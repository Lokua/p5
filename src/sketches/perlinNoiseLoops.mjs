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
  const ah = new AnimationHelper({ p, frameRate: metadata.frameRate, bpm: 134 })
  let phase = 0

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
    p.background(0, 0.2)
    p.fill('beige')

    for (let o = 1; o < nCircles + 1; o++) {
      p.push()
      p.translate(w / 2, h / 2)
      for (let ii = 0; ii < 360; ii += space) {
        const i = (ii - o * 30) % 360
        const xOff = p.map(p.cos(i), -1, 1, 0, 3)
        const yOff = p.map(p.sin(i), -1, 1, 0, 3)
        const n = simplex.noise(
          xOff + phase * (noiseFalloff / o),
          yOff + phase * (noiseFalloff / o),
        )
        const hh = p.map(n, 0, 1, flip ? -(height * o) : 0, height * o)
        p.rotate(space)
        p.ellipse(
          o * size,
          0,
          hh +
            n *
              ah.animate({
                keyframes: [20, 40, 20],
                duration: 4,
                delay: o * 0.5,
              }),
          thinness,
        )
      }
      p.pop()
    }

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
        value: 25,
        min: 1,
        max: 100,
      }),
      size: new Range({
        name: 'size',
        value: 57,
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
        value: 2,
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
        value: 0.5,
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
