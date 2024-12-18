// @ts-check
import chroma from 'chroma-js'
import { isControlChange, getChannel, getType } from '@lokua/midi-util'
import ControlPanel, { Range, Checkbox } from '../lib/ControlPanel/index.mjs'
import AnimationHelper from '../lib/AnimationHelper.mjs'

/**
 * @param {import("p5")} p
 */
export default function (p, getMidiInputPort) {
  const metadata = {
    name: 'animateStudyWithMidi',
    frameRate: 60,
  }

  const [w, h] = [500, 500]

  const ah = new AnimationHelper({
    p,
    frameRate: metadata.frameRate,
    bpm: 134,
    latencyOffset: -24,
  })

  const count = 7
  const diameter = w / 8
  const space = w / count
  const colorScale = chroma.scale(['red', 'teal'])
  const ordered = []

  const midiData = Array(count)
    .fill(null)
    .map(() => [])

  const CC_MUTED = 1
  const CC_ALPHA = 2

  const controlPanel = new ControlPanel({
    p,
    id: metadata.name,
    attemptReload: true,
    controls: {
      amplitude: new Range({
        name: 'amplitude',
        value: 48,
        min: 0,
        max: 250,
      }),
      animateAmplitude: new Checkbox({
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
    p.rectMode(p.CENTER)
    p.background(230, 0)
    p.textAlign(p.CENTER, p.CENTER)
    p.textSize(16)

    getMidiInputPort()?.addEventListener('midimessage', onMidiMessage)

    for (let i = 0; i < count; i++) {
      ordered.push()
    }

    return {
      canvas,
    }
  }

  function draw() {
    const { amplitude, animateAmplitude, mixWeight } = controlPanel.values()

    p.noStroke()

    for (let i = 0, duration = 0.25; i < count; i++, duration += 0.25) {
      const x = space / 2 + i * space
      const controllers = midiData[i]
      const isMuted = controllers[CC_MUTED]
      const alpha = controllers[CC_ALPHA]

      p.fill(230, isMuted || alpha === undefined ? 1 : alpha / 127)
      p.rect(x, h / 2, space, h)

      drawCircle({
        x,
        amplitude: animateAmplitude
          ? ah.animate({
              keyframes: [10, amplitude + x / 4, 10],
              duration: 8,
            })
          : amplitude,
        chromaColor: isMuted ? chroma('black') : colorScale(i / (count - 1)),
        mixWeight,
        animation: isMuted
          ? 0
          : ah.animate({
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

  function onMidiMessage(e) {
    const [status, controller, value] = e.data

    if (isControlChange(status)) {
      // live sends 123 whenever you press stop three times
      // and since >=120 are forbidden...
      if (controller >= 120) {
        return
      }

      try {
        const channelIndex = getChannel(status)
        midiData[channelIndex][controller] = value
      } catch (error) {
        console.error(error, {
          status,
          controller,
          value,
          midiData,
          channelIndex: getChannel(status),
          type: getType(status),
        })
      }
    }
  }

  return {
    setup,
    draw,
    destroy() {
      controlPanel.destroy()
      getMidiInputPort()?.removeEventListener('midimessage', onMidiMessage)
    },
    metadata,
  }
}
