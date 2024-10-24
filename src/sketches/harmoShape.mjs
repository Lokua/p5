// @ts-check
import ControlPanel, { Range, Select } from '../ControlPanel/index.mjs'

/**
 * @param {import("p5")} p
 */
export default function (p) {
  const [w, h] = [500, 500]

  const metadata = {
    name: 'harmoShape',
    frameRate: 30,
  }

  const shapes = {
    diamond({ index, halfLineCount, scale, a = 1 }) {
      const normalizedIndex = Math.abs(index) / halfLineCount
      return (1 - Math.pow(normalizedIndex, a)) * w * scale
    },
    hourglass({ index, halfLineCount, scale, a = 2 }) {
      const normalizedIndex = Math.abs(index) / halfLineCount
      return (1 - normalizedIndex * a) * w * scale
    },
    sineWave({ index, halfLineCount, scale, a = 1 }) {
      const normalizedIndex = index / halfLineCount
      const wave = Math.sin(normalizedIndex * Math.PI * a)
      return Math.abs(wave) * w * scale
    },
    exponential({ index, halfLineCount, scale, a = 2 }) {
      const normalizedIndex = Math.abs(index) / halfLineCount
      return Math.pow(normalizedIndex, a) * w * scale
    },
  }

  const controlPanel = new ControlPanel({
    p,
    id: metadata.name,
    controls: {
      shape: new Select({
        name: 'shape',
        options: Object.keys(shapes),
        value: 'hourglass',
      }),
      lineCount: new Range({
        name: 'lineCount',
        value: 5,
        min: 1,
        max: 50,
      }),
      rectHeight: new Range({
        name: 'rectHeight',
        value: 2,
        min: 1,
        max: 100,
        step: 1,
      }),
      widthScale: new Range({
        name: 'widthScale',
        value: 1,
        min: 0,
        max: 1,
        step: 0.001,
      }),
      a: new Range({
        name: 'a',
        value: 2,
        min: 0.1,
        max: 10,
        step: 0.1,
      }),
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    p.colorMode(p.HSB, 100)

    return {
      canvas,
    }
  }

  function draw() {
    const {
      lineCount,
      rectHeight,
      widthScale,
      shape,
      a,
    } = controlPanel.values()
    const shapeFn = shapes[shape]

    p.background(0, 5, 100)
    p.fill(5, 50, 50)
    p.noStroke()

    const centerY = h / 2
    let adjustedLineCount = lineCount

    if (lineCount % 2 === 0) {
      adjustedLineCount = lineCount + 1
    }

    const halfLineCount = Math.floor(adjustedLineCount / 2)
    const spacing = h / (adjustedLineCount - 1)

    for (let i = -halfLineCount; i <= halfLineCount; i++) {
      const yOffset = i * spacing
      const rectWidth = shapeFn({
        index: i,
        halfLineCount,
        scale: widthScale,
        a,
      })

      p.rect(
        w / 2 - rectWidth / 2,
        centerY + yOffset - rectHeight / 2,
        rectWidth,
        rectHeight,
      )
    }
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
