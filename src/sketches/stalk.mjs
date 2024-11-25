import chroma from 'chroma-js'
import AnimationHelper from '../lib/AnimationHelper.mjs'
import { createControlPanel } from '../lib/ControlPanel/index.mjs'
import { times } from '../util.mjs'

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const metadata = {
    name: 'stalk',
    frameRate: 30,

    // WARNING! This is probably too big
    // if recording video but perfect for images
    pixelDensity: 6,
  }

  const [w, h] = [500, 500]
  const center = p.createVector(w / 2, h / 2)

  const colorScale = chroma.scale(['palevioletred', 'orange', 'olive'])

  const ah = new AnimationHelper({
    p,
    frameRate: metadata.frameRate,
    bpm: 134,
  })

  const cp = createControlPanel({
    p,
    id: metadata.name,
    controls: [
      {
        type: 'Range',
        name: 'phaseIncrement',
        display: 'phaseInc',
        value: 0.2,
        min: 0.001,
        max: 1,
        step: 0.001,
      },
      {
        type: 'Range',
        name: 'amplitudeY',
        value: 20,
      },
      {
        type: 'Range',
        name: 'amplitudeZ',
        value: 100,
        max: w / 2,
      },
      {
        type: 'Range',
        name: 'frequency',
        value: 1,
        min: 0.01,
        max: 2,
        step: 0.01,
      },
      {
        type: 'Range',
        name: 'scale',
        value: 20,
      },
    ],
  })

  function setup() {
    cp.init()
    const canvas = p.createCanvas(w, h, p.WEBGL)

    p.colorMode(p.RGB, 255, 255, 255, 1)

    return {
      canvas,
    }
  }

  const backgroundColor = colorScale(1).desaturate(3).brighten(2.6).rgba()
  const margin = 50
  const xRange = -w / 2 - margin
  let phase = 0

  const incrementPhase = ah.triggerEvery(() => {
    phase += cp.phaseIncrement
  }, 1 / 16)

  function draw() {
    p.background(backgroundColor)

    p.$.shape(() => {
      for (let x = xRange; x <= -xRange; x += 1) {
        const theta = x / cp.scale + phase
        const y = cp.amplitudeY * Math.cos(cp.frequency * theta)
        const z = cp.amplitudeZ * Math.sin(cp.frequency * theta)
        p.stroke(colorScale(1).rgba())
        p.noFill()
        p.vertex(x, y, z)

        if (x % 50 === 0) {
          p.$.pushPop(() => {
            p.translate(x, y, z)
            p.noStroke()
            p.fill(colorScale(p.map(x, -xRange, xRange, 0, 1)).rgba())
            p.sphere(10, 5, 5)
          })
        }
      }
    })

    incrementPhase()
  }

  return {
    setup,
    draw,
    destroy() {
      cp.destroy()
    },
    metadata,
  }
}
