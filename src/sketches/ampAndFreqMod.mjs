import chroma from 'chroma-js'
import ControlPanel, {
  Checklist,
  Range,
  Select,
} from '../lib/ControlPanel/index.mjs'

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const metadata = {
    name: 'ampAndFreqMod',
    frameRate: 30,
  }

  const [w, h] = [500, 500]
  const center = p.createVector(w / 2, h / 2)

  const controlPanel = new ControlPanel({
    p,
    id: metadata.name,
    controls: {
      modulationType: new Select({
        name: 'modulationType',
        value: 'frequency',
        options: ['frequency', 'amplitude'],
      }),
      animationSpeed: new Range({
        name: 'animationSpeed',
        value: 15,
        min: 0,
        max: 100,
      }),
      amplitude: new Range({
        name: 'amplitude',
        value: 75,
        min: 0,
        max: 200,
      }),
      carrierFrequency: new Range({
        name: 'carrierFrequency',
        value: 26,
        min: 0,
        max: 100,
      }),
      modulatorFrequency: new Range({
        name: 'modulatorFrequency',
        value: 34,
        min: 0,
        max: 100,
      }),
      modulationIndex: new Range({
        name: 'modulationIndex',
        value: 4,
        min: 0,
        max: 100,
      }),
      show: new Checklist({
        name: 'show',
        options: {
          carrier: true,
          modulator: true,
          result: true,
        },
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

  let theta = 0

  function draw() {
    const {
      modulationType,
      animationSpeed,
      amplitude,
      carrierFrequency,
      modulatorFrequency,
      modulationIndex,
      show,
    } = controlPanel.values()

    p.noFill()
    p.background(0)
    p.strokeWeight(1)
    p.textAlign(p.LEFT, p.TOP)
    const textSize = 14
    p.textSize(textSize)
    p.noFill()

    const f1 = carrierFrequency * 0.001
    const f2 = modulatorFrequency * 0.001

    show.carrier &&
      drawNeonWaveform(
        'cyan',
        (x) => center.y + amplitude * p.sin(theta + x * f1),
      )
    show.modulator &&
      drawNeonWaveform(
        'magenta',
        (x) => center.y + amplitude * p.sin(theta + x * f2),
      )

    // ???
    show.result &&
      drawNeonWaveform(chroma.mix('magenta', 'cyan', 0.5), (x) => {
        if (modulationType === 'frequency') {
          const modulation = modulationIndex * p.sin(theta + x * f2)
          return center.y + amplitude * p.sin(theta + x * f1 + modulation)
        }
        const modulatingSignal = (p.sin(theta + x * f2) + 1) / 2
        const modulatedAmplitude = amplitude * modulatingSignal
        return center.y + modulatedAmplitude * p.sin(theta + x * f1)
      })

    theta += animationSpeed * 0.01

    p.$.pushPop(() => {
      p.noStroke()

      p.translate(10, 0)
      const nextLine = () => p.translate(0, 18)

      nextLine()
      p.fill('cyan')
      p.text('Carrier', 0, 0)

      nextLine()
      p.fill('magenta')
      p.text('Modulator', 0, 0)

      nextLine()
      p.fill(chroma.mix('magenta', 'cyan', 0.5).rgba())
      p.text('Result', 0, 0)
    })
  }

  function drawNeonWaveform(color, amplitudeFunction) {
    const stepSize = 1
    p.$.shape(() => {
      for (let x = 0; x < w; x += stepSize) {
        p.stroke(chroma(color).alpha(0.2).rgba())
        p.strokeWeight(10)
        p.noFill()
        const y = amplitudeFunction(x)
        p.curveVertex(x, y)
      }
    })
    p.$.shape(() => {
      for (let x = 0; x < w; x += stepSize) {
        p.stroke(chroma(color).rgba())
        p.strokeWeight(1)
        p.noFill()
        const y = amplitudeFunction(x)
        p.curveVertex(x, y)
      }
    })
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
