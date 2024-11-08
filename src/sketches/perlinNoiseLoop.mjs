/* eslint-disable no-unused-vars */
// https://www.youtube.com/watch?v=0YvPgYDR1oM&list=PLeCiJGCSl7jc5UWvIeyQAvmCNc47IuwkM&index=6

import ControlPanel, {
  Range,
  Checkbox,
  createBlendMode,
} from '../lib/ControlPanel/index.mjs'
import { arrayModLookup, mapTimes } from '../util.mjs'

export default function (p) {
  const [w, h] = [500, 500]

  const metadata = {
    name: 'perlinNoiseLoop',
  }

  const controlPanel = new ControlPanel({
    p,
    id: metadata.name,
    controls: {
      blendMode: createBlendMode(),
      height: new Range({
        name: 'height',
        value: 46,
        min: 1,
        max: 100,
      }),
      size: new Range({
        name: 'size',
        value: 108,
        min: 1,
        max: 1000,
      }),
      space: new Range({
        name: 'space',
        value: 4,
        min: 1,
        max: 100,
      }),
      thinness: new Range({
        name: 'thinness',
        value: 1.5,
        min: 0.1,
        max: 100,
        step: 0.1,
      }),
      noiseFalloff: new Range({
        name: 'noiseFalloff',
        value: 3.08,
        min: 0,
        max: 10,
        step: 0.01,
      }),
      flip: new Checkbox({
        name: 'flip',
        value: false,
      }),
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
    const { blendMode, height, size, space, flip, thinness, noiseFalloff } =
      controlPanel.values()
    p.blendMode(p[blendMode])
    p.noiseDetail(2, noiseFalloff)
    p.background(0)
    p.fill(1)

    p.push()
    p.translate(w / 2, h / 2)
    for (let i = 0; i < 360; i += space) {
      const xOff = p.map(p.cos(i), -1, 1, 0, 3)
      const yOff = p.map(p.sin(i), -1, 1, 0, 3)
      const n = p.noise(xOff, yOff)
      const hh = p.map(n, 0, 1, flip ? -height : 0, height)
      p.rotate(space)
      p.rect(size, 0, hh, thinness)
    }
    p.pop()
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
