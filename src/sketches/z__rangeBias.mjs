import ControlPanel, {
  Checkbox,
  Range,
  Select,
} from '../lib/ControlPanel/index.mjs'
import { interpolators, generateRange } from '../lib/scaling.mjs'

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const [w, h] = [500, 500]

  const metadata = {
    name: 'z__rangeBias',
    frameRate: 30,
  }

  const categorical = Object.keys(interpolators)
  const visual = [
    'cubicEaseIn',
    'easeIn',
    'exponential',
    'sineEaseIn',
    'sigmoid',
    'cubicEaseInOut',
    'easeInOut',
    'sineEaseInOut',
    'linear',
    'sineEaseOut',
    'easeOut',
    'logarithmic',
    'cubicEaseOut',
    'bounce',
  ]

  const controlPanel = new ControlPanel({
    p,
    id: metadata.name,
    controls: {
      steps: new Range({
        name: 'steps',
        value: 100,
        min: 3,
        max: 255,
      }),
      labels: new Checkbox({
        name: 'labels',
        value: true,
      }),
      sort: new Select({
        name: 'sort',
        value: 'categorical',
        options: ['categorical', 'visual'],
      }),
      exponent: new Range({
        name: 'exponent',
        value: 2,
        min: 1,
        max: 5,
        step: 0.1,
      }),
      steepness: new Range({
        name: 'steepness',
        value: 10,
        min: 1,
        max: 20,
        step: 0.1,
      }),
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    p.colorMode(p.RGB, 255, 255, 255, 1)
    p.noLoop()
    p.noStroke()

    return {
      canvas,
    }
  }

  function draw() {
    const { steps, labels, sort, steepness, exponent } = controlPanel.values()
    const keys = sort === 'categorical' ? categorical : visual
    const totalRows = keys.length

    p.background(255)

    keys.forEach((funcName, i) => {
      const values = generateRange(
        255,
        0,
        steps,
        funcName,
        funcName === 'sigmoid'
          ? steepness
          : funcName === 'exponential'
            ? exponent
            : undefined,
      )

      const y = Math.floor((i / totalRows) * h)
      const nextY = Math.floor(((i + 1) / totalRows) * h)
      const rowHeight = nextY - y

      for (let j = 0; j < steps; j++) {
        const value = values[j]
        p.fill(value)
        p.noStroke()
        const x = Math.floor((j / steps) * w)
        const rectWidth = Math.ceil(w / steps)
        p.rect(x, y, rectWidth, rowHeight)
      }

      if (labels) {
        p.fill('limegreen')
        p.textSize(rowHeight / 2)
        p.textAlign(p.RIGHT, p.CENTER)
        p.text(funcName, w - 10, y + rowHeight / 2)
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
