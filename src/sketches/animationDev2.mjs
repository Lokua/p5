// @ts-check
import chroma from 'chroma-js'
import ControlPanel, { Range } from '../lib/ControlPanel/index.mjs'
import AnimationHelper from '../lib/AnimationHelper.mjs'

/**
 * @param {import("p5")} p
 */
export default function (p) {
  const metadata = {
    name: 'animationDev2',
    frameRate: 60,
  }

  const [w, h] = [500, 500]

  const ah = new AnimationHelper({ p, frameRate: metadata.frameRate, bpm: 134 })
  const colorScale = chroma.scale(['red', 'teal'])

  const controlPanel = new ControlPanel({
    p,
    id: metadata.name,
    attemptReload: true,
    controls: {
      a: new Range({
        name: 'a',
        value: 50,
        min: 0,
        max: 1000,
      }),
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    p.colorMode(p.RGB, 255, 255, 255, 1)

    return {
      canvas,
    }
  }

  function draw() {
    p.background(240)
    p.noStroke()

    const amplitude = 20
    const diameter = w / 8

    drawCircle({
      x: w / 4,
      amplitude,
      diameter,
      color: colorScale(0).rgba(),
      animation: ah.animate({
        keyframes: [0, 1],
        duration: 1.5,
      }),
    })
    drawCircle({
      x: w / 4 + w / 8,
      amplitude,
      diameter: diameter / 2,
      color: colorScale(0.25).rgba(),
      animation: ah.animate({
        keyframes: [0, 1],
        duration: 1.5,
        every: 3,
      }),
    })

    drawCircle({
      x: w / 2,
      amplitude,
      diameter,
      color: colorScale(0.5).rgba(),
      animation: ah.animate({
        keyframes: [0, 1],
        easing: 'easeIn',
      }),
    })

    drawCircle({
      x: w / 2 + w / 8,
      amplitude,
      diameter: diameter / 2,
      color: colorScale(0.75).rgba(),
      animation: ah.animate({
        keyframes: [0, 1],
        duration: 2.5,
        every: 5,
      }),
    })
    drawCircle({
      x: w / 2 + w / 4,
      amplitude,
      diameter,
      color: colorScale(1).rgba(),
      animation: ah.animate({
        keyframes: [0, 1],
        duration: 1.25,
      }),
    })
  }

  function drawCircle({ x, amplitude, diameter, color, animation }) {
    p.fill(...color)
    p.circle(x, h / 2 + amplitude * p.sin(animation * p.TWO_PI), diameter)
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
