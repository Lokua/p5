/* eslint-disable no-unused-vars */
// https://www.youtube.com/watch?v=0YvPgYDR1oM&list=PLeCiJGCSl7jc5UWvIeyQAvmCNc47IuwkM&index=6

import ControlPanel, {
  Range,
  Checkbox,
  createBlendMode,
} from '../lib/ControlPanel/index.mjs'
import AnimationHelper from '../lib/AnimationHelper.mjs'
import { Simplex } from '../lib/Noise.mjs'
import { arrayModLookup, mapTimes } from '../util.mjs'

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const metadata = {
    name: 'perlinNoiseLoops',
    frameRate: 30,
  }

  const [w, h] = [500, 500]
  const controlPanel = createControlPanel(p, metadata)
  const simplex = new Simplex('2d', 'seed')
  let phase = 0

  const ah = new AnimationHelper({
    p,
    frameRate: metadata.frameRate,
    bpm: 134,
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    p.colorMode(p.RGB, 255, 255, 255, 1)
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
    p.background(30, 0.2)
    p.fill('beige')

    for (let o = 1; o < nCircles + 1; o++) {
      const chaosFactor = p.map(o, 1, nCircles, 0.001, 2)

      p.push()
      p.translate(w / 2, h / 2)
      for (let ii = 0; ii < 360; ii += space) {
        const i = (ii - o * ah.accumulateValue(0.1, 0.25)) % 360
        const xOff = p.map(p.cos(i), -1, 1, 0, 3)
        const yOff = p.map(p.sin(i), -1, 1, 0, 3)
        const n = simplex.noise(
          (xOff + phase * noiseFalloff) * chaosFactor,
          (yOff + phase * noiseFalloff) * chaosFactor,
        )
        const hh = p.map(n, 0, 1, flip ? -(height * o) : 0, height * o)
        p.rotate(space)
        p.ellipse(
          o % ah.repeat([11, 7, 5, 3], 3) === 0 ? 0 : o * size,
          o % ah.repeat([3, 5, 7, 11], 4) === 0 ? o * size : 0,
          ah.animate([hh / 16, hh, hh / 16], 8),
          thinness,
        )
      }
      p.pop()
    }

    p.fill(30, 1)
    p.circle(w / 2, h / 2, ah.repeat([20, 40], 2))

    phase += 0.015
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

function createControlPanel(p, metadata) {
  return new ControlPanel({
    p,
    id: metadata.name,
    controls: {
      blendMode: createBlendMode(),
      height: new Range({
        name: 'height',
        value: 0.921,
        min: 0.001,
        max: 5,
        step: 0.001,
      }),
      size: new Range({
        name: 'size',
        value: 13,
        min: 1,
        max: 1000,
      }),
      space: new Range({
        name: 'space',
        value: 3,
        min: 1,
        max: 100,
      }),
      thinness: new Range({
        name: 'thinness',
        value: 16.8,
        min: 0.1,
        max: 100,
        step: 0.1,
      }),
      nCircles: new Range({
        name: 'nCircles',
        value: 24,
        min: 1,
        max: 100,
      }),
      noiseFalloff: new Range({
        name: 'noiseFalloff',
        value: 0.53,
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
}
