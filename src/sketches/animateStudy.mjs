// @ts-check
import chroma from 'chroma'
import ControlPanel, { Range } from '../ControlPanel/index.mjs'
import AnimationHelper from '../AnimationHelper.mjs'

/**
 * @param {import("p5")} p
 */
export default function (p) {
  const metadata = {
    name: 'animateStudy',
    frameRate: 60,
  }

  const [w, h] = [500, 500]

  const ah = new AnimationHelper(p, metadata.frameRate, 134)
  const colorScale = chroma.scale(['teal', 'red'])

  const controlPanel = new ControlPanel({
    id: metadata.name,
    attemptReload: true,
    controls: {
      amplitude: new Range({
        name: 'amplitude',
        value: 20,
        min: 0,
        max: 1000,
      }),
      alpha: new Range({
        name: 'alpha',
        value: 1,
        min: 0,
        max: 1,
        step: 0.001,
      }),
    },
    inputHandler() {
      !p.isLooping() && draw()
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    p.colorMode(p.RGB, 255, 255, 255, 1)
    p.textAlign(p.CENTER, p.CENTER)
    p.textSize(16)

    return {
      canvas,
    }
  }

  const diameter = w / 8

  function draw() {
    const { alpha, amplitude } = controlPanel.values()
    p.background(230, 230, 230, alpha)
    p.noStroke()

    const count = 7
    const space = w / count
    let duration = 0.25

    for (let i = 0; i < count; i++) {
      const x = space / 2 + i * space

      drawCircle({
        x,
        amplitude: ah.animate({
          keyframes: [10, amplitude + x / 4, 10],
          duration: 8,
        }),
        color: colorScale(i / (count - 1)).rgba(),
        animation: ah.animate({
          keyframes: [0, 1],
          duration,
        }),
      })

      p.fill(255)
      p.text(`${i + 1}/16`, x, h / 2)

      duration += 0.25
    }
  }

  function drawCircle({ x, amplitude, color, animation }) {
    p.fill(color)
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
