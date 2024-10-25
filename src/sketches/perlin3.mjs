/* eslint-disable no-unused-vars */
// https://www.youtube.com/watch?v=0YvPgYDR1oM&list=PLeCiJGCSl7jc5UWvIeyQAvmCNc47IuwkM&index=6

import ControlPanel, {
  Range,
  Toggle,
  createBlendMode,
} from '../ControlPanel/index.mjs'
import { arrayModLookup, mapTimes } from '../util.mjs'

export default function (p) {
  const [w, h] = [500, 500]
  let phase = 0

  const metadata = {
    name: 'perlin3',
  }

  const controlPanel = new ControlPanel({
    id: metadata.name,
    attemptReload: true,
    controls: {
      blendMode: createBlendMode(),
      height: new Range({
        name: 'height',
        value: 1,
        min: 1,
        max: 100,
      }),
      size: new Range({
        name: 'size',
        value: 1,
        min: 1,
        max: 1000,
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
        min: 0.1,
        max: 100,
        step: 0.1,
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
      flip: new Toggle({
        name: 'flip',
        value: true,
      }),
    },
    inputHandler() {
      !p.isLooping() && draw()
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    p.colorMode(p.HSB, 1)
    p.angleMode(p.DEGREES)
    p.noStroke()

    return {
      canvas,
    }
  }

  function draw() {
    const {
      blendMode,
      height,
      size,
      space,
      flip,
      thinness,
      nCircles,
      noiseFalloff,
    } = controlPanel.values()
    p.blendMode(p[blendMode])
    p.noiseDetail(2, noiseFalloff)
    p.background(0)
    p.fill(1, 0, 1, 0.8)

    for (let o = 1; o < nCircles + 1; o++) {
      p.push()
      p.translate(w / 2, h / 2)
      for (let ii = 0; ii < 360; ii += space) {
        const i = (ii - o * 30) % 360
        const xOff = p.map(p.cos(i), -1, 1, 0, 3)
        const yOff = p.map(p.sin(i), -1, 1, 0, 3)
        const n = p.noise(xOff + phase, yOff + phase)
        const hh = p.map(n, 0, 1, flip ? -(height * o) : 0, height * o)
        p.rotate(space)
        p.rect(o * size, 0, hh + n * 20, thinness)
      }
      p.pop()
    }

    phase += 0.01
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
