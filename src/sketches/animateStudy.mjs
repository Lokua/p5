// @ts-check
import chroma from 'chroma'
import ControlPanel, { Range, Toggle } from '../ControlPanel/index.mjs'
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

  const ah = new AnimationHelper({
    p,
    frameRate: metadata.frameRate,
    bpm: 134,
    latencyOffset: -24,
  })
  const colorScale = chroma.scale(['red', 'teal'])

  const controlPanel = new ControlPanel({
    p,
    id: metadata.name,
    attemptReload: true,
    controls: {
      amplitude: new Range({
        name: 'amplitude',
        value: 20,
        min: 0,
        max: 1000,
      }),
      animateAmplitude: new Toggle({
        name: 'animateAmplitude',
        value: false,
      }),
      mixWeight: new Range({
        name: 'mixWeight',
        value: 0.5,
        min: 0,
        max: 1,
        step: 0.01,
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
    p.textAlign(p.CENTER, p.CENTER)
    p.textSize(16)

    return {
      canvas,
    }
  }

  const diameter = w / 8
  const count = 7
  const space = w / count

  function draw() {
    const { amplitude, animateAmplitude, backgroundAlpha, mixWeight } =
      controlPanel.values()

    p.background(230, 230, 230, backgroundAlpha)
    p.noStroke()

    for (let i = 0, duration = 0.25; i < count; i++, duration += 0.25) {
      const x = space / 2 + i * space

      drawCircle({
        x,
        amplitude: animateAmplitude
          ? ah.animate({
              keyframes: [10, amplitude + x / 4, 10],
              duration: 8,
            })
          : amplitude,
        chromaColor: colorScale(i / (count - 1)),
        mixWeight,
        animation: ah.animate({
          keyframes: [0, 1],

          // multiplying by 2 so it hits the tick on the up and down
          // instead of just the down or up (depending on phaseOffset)
          duration: duration * 2,
        }),
      })

      p.fill(255)
      p.text(`${i + 1}/16`, x, h / 2)
    }
  }

  function drawCircle({ x, amplitude, chromaColor, mixWeight, animation }) {
    // Start the sine wave at the bottom by adding a positive phase offset
    // const phaseOffset = p.HALF_PI
    const phaseOffset = 0

    // Sine wave key points for reference:
    // - At 0: starts at 0 ("0r"), rising up
    // - At π/2: reaches peak at 1
    // - At π: crosses 0 again ("0f"), falling down
    // - At 3π/2: reaches bottom at -1
    //
    // With no phase offset (as explained above):
    // (0r, 1, 0f, -1)
    //
    // Positive phase offset explanation (like rotating an array):
    // Adding +π/2 shifts the sine wave to start from -1:
    // (-1, 0r, 1, 0f)
    //
    // A negative phase offset would shift it backwards:
    // (1, 0f, -1, 0r)

    // Calculate the sine value based on the animation state
    const sineValue = p.sin(animation * p.TWO_PI + phaseOffset)

    // Calculate the interpolation factor (t) based on the sine value
    const t = Math.abs(sineValue) * mixWeight

    const interpolatedColor = chroma.mix(chromaColor, 'black', t, 'rgb').rgba()

    p.fill(interpolatedColor)

    p.circle(
      x,
      h / 2 + amplitude * p.sin(animation * p.TWO_PI + phaseOffset),
      diameter,
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
