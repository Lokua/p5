// @ts-check
import chroma from 'chroma-js'
import ControlPanel, { Range } from '../lib/ControlPanel/index.mjs'
import AnimationHelper from '../lib/AnimationHelper.mjs'

/**
 * @param {import("p5")} p
 */
export default function (p) {
  const [w, h] = [500, 500]

  const metadata = {
    name: 'sonar',
    frameRate: 120,
  }

  const ah = new AnimationHelper({
    p,
    frameRate: metadata.frameRate,
    bpm: 134,
    latencyOffset: -12,
  })

  const controlPanel = new ControlPanel({
    p,
    id: metadata.name,
    controls: {
      diameter: new Range({
        name: 'diameter',
        value: 50,
        min: 0,
        max: 1000,
      }),
      backgroundAlpha: new Range({
        name: 'backgroundAlpha',
        value: 1,
        min: 0,
        max: 1,
        step: 0.001,
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

  const scale = chroma.scale(['#222', chroma('azure').saturate(0.25)])

  function draw() {
    const { diameter, backgroundAlpha } = controlPanel.values()
    p.background(255, backgroundAlpha)

    const duration = 2
    renderCircle(diameter, duration)
    renderRing(diameter, duration * 2)
  }

  function renderCircle(diameter, duration) {
    p.noStroke()
    p.fill(
      scale(
        ah.animate({
          keyframes: [0, 1],
          duration,
        }),
      ).rgba(),
    )
    p.circle(
      w / 2,
      h / 2,
      p.sin(
        ah.animate({
          keyframes: [0.25, 1],
          duration,
        }) * p.TWO_PI,
      ) * diameter,
    )
  }

  function renderRing(diameter, duration) {
    p.stroke(
      scale(
        ah.animate({
          keyframes: [0, 1],
          duration,
        }),
      )
        .alpha(
          ah.animate({
            keyframes: [1, 0],
            duration,
          }),
        )
        .rgba(),
    )
    p.strokeWeight(
      ah.animate({
        keyframes: [1, 24],
        duration,
        easing: 'easeIn',
      }),
    )
    p.noFill()
    p.circle(
      w / 2,
      h / 2,
      ah.animate({
        keyframes: [diameter / 2, w * 2],
        duration,
        delay: 1.5,
      }),
    )
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
