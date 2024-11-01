/* eslint-disable no-unused-vars */
// https://www.youtube.com/watch?v=0YvPgYDR1oM&list=PLeCiJGCSl7jc5UWvIeyQAvmCNc47IuwkM&index=6
import ControlPanel, {
  Range,
  Checkbox,
  createBlendMode,
} from '../lib/ControlPanel/index.mjs'
import AnimationHelper from '../lib/AnimationHelper.mjs'
import { arrayModLookup, mapTimes } from '../util.mjs'

/**
 * @param {import("p5")} p
 */
export default function (p) {
  const metadata = {
    name: 'perlin',
    frameRate: 30,
  }

  const [w, h] = [500, 500]
  const ah = new AnimationHelper({ p, frameRate: metadata.frameRate, bpm: 134 })

  const controlPanel = new ControlPanel({
    p,
    id: metadata.name,
    controls: {
      blendMode: createBlendMode(),
      size: new Range({
        name: 'size',
        value: 1,
        min: 1,
        max: 100,
      }),
      space: new Range({
        name: 'space',
        value: 1,
        min: 1,
        max: 100,
      }),
      thinness: new Range({
        name: 'thinness',
        value: 1,
        min: 1,
        max: 100,
      }),
      nCircles: new Range({
        name: 'nCircles',
        value: 3,
        min: 1,
        max: 100,
      }),
      noiseFalloff: new Range({
        name: 'noiseFalloff',
        value: 0,
        min: 0,
        max: 10,
        step: 0.01,
      }),
      flip: new Checkbox({
        name: 'flip',
        value: true,
      }),
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    p.angleMode(p.DEGREES)
    p.noStroke()

    return {
      canvas,
    }
  }

  let phase = 0

  function draw() {
    const { blendMode, size, space, thinness, flip, nCircles, noiseFalloff } =
      controlPanel.values()

    p.blendMode(p[blendMode])
    p.noiseDetail(2, noiseFalloff)
    p.background(0)
    p.fill(255)

    for (let j = 0; j < nCircles; j++) {
      p.push()
      p.translate(w / 2, h / 2)
      for (let i = 0; i < 360; i += space) {
        const angle = i + phase
        const xOff = p.map(p.cos(i + phase), -1, 1, 0, 3)
        const yOff = p.map(p.sin(i + phase), -1, 1, 0, 3)
        const n = p.noise(xOff, yOff, j)
        const hh = p.map(n, 0, 1, flip ? -size : 0, size)
        p.fill(
          p.map(p.sin(i), -1, 1, 100, j * 100),
          p.map(hh, -size, size, 0, size),
          p.map(n, 0, 1, 150, 255),
        )
        p.rotate(space)
        p.rect((phase + j * 100) % 1000, 0, hh, thinness)
      }
      p.pop()
      phase += 0.1
    }
  }

  return {
    setup,
    draw,
    destroy() {
      controlPanel.destroy()
    },
    metadata,
  }
}
