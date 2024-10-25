// @ts-check
import ControlPanel, { Range, Select, Toggle } from '../ControlPanel/index.mjs'
import AnimationHelper from '../AnimationHelper.mjs'
import { apply, multiLerp } from '../util.mjs'

/**
 * @param {import("p5")} p
 */
export default function (p) {
  const [w, h] = [500, 500]

  const metadata = {
    name: 'harmoShape',
    frameRate: 30,
  }

  const ax = new AnimationHelper(p, metadata.frameRate, 134)

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
      backgroundAlpha: new Range({
        name: 'backgroundAlpha',
        value: 100,
      }),
      interpolateShapes: new Toggle({
        name: 'interpolateShapes',
        value: true,
      }),
      shape: new Select({
        name: 'shape',
        options: Object.keys(shapes),
        value: 'hourglass',
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

    p.colorMode(p.HSB, 100, 100, 100, 100)

    return {
      canvas,
    }
  }

  function draw() {
    const {
      lineCount,
      rectHeight,
      widthScale,
      backgroundAlpha,
      interpolateShapes,
      shape,
      a,
    } = controlPanel.values()

    p.background(100, 0, 100, backgroundAlpha)
    p.fill(0)
    p.noStroke()

    const centerY = h / 2
    const adjustedLineCount = lineCount % 2 === 0 ? lineCount + 1 : lineCount

    const halfLineCount = Math.floor(adjustedLineCount / 2)
    const spacing = h / (adjustedLineCount - 1)
    const rectWidthProgress = ax.getPingPongLoopProgress(16)

    for (let i = -halfLineCount; i <= halfLineCount; i++) {
      const yOffset = i * spacing

      const shapeFnArgs = {
        index: i,
        halfLineCount,
        scale: widthScale,
        a,
      }
      const rectWidth = interpolateShapes
        ? multiLerp(
            Object.values(shapes).map(apply(shapeFnArgs)),
            rectWidthProgress,
          )
        : shapes[shape](shapeFnArgs)

      let rectRadius = ax.animateProperty({ from: 0, to: 10, duration: 1 })
      rectRadius += ax.getPingPongLoopProgress(1) * Math.abs(i) * 2
      rectRadius = rectRadius % 20

      p.rect(
        w / 2 - rectWidth / 2,
        centerY + yOffset - rectHeight / 2,
        rectWidth,
        rectHeight,
        rectRadius,
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
