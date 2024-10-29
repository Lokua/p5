// @ts-check
import chroma from 'chroma'
import ControlPanel, {
  Checkbox,
  Range,
  Select,
} from '../ControlPanel/index.mjs'
import AnimationHelper from '../AnimationHelper.mjs'
import { apply, erf, multiLerp } from '../util.mjs'

/**
 * @param {import("p5")} p
 */
export default function (p) {
  const [w, h] = [500, 500]

  const metadata = {
    name: 'harmoShape',
    frameRate: 30,
  }

  const ah = new AnimationHelper({ p, frameRate: metadata.frameRate, bpm: 134 })
  const colorScale = chroma.scale(['red', 'black'])

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
      interpolateShapes: new Checkbox({
        name: 'interpolateShapes',
        value: true,
      }),
      shape: new Select({
        name: 'shape',
        options: Object.keys(shapes),
        value: 'hourglass',
      }),
      a: new Range({
        disabled: true,
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

    p.colorMode(p.RGB, 255, 255, 255, 1)
    p.noStroke()

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
    } = controlPanel.values()

    const a = ah.animate({
      keyframes: [0.1, 10, 0.1],
      duration: 128,
    })

    p.background(0, backgroundAlpha)

    const centerY = h / 2
    const adjustedLineCount = lineCount % 2 === 0 ? lineCount + 1 : lineCount

    const halfLineCount = Math.floor(adjustedLineCount / 2)
    const spacing = h / (adjustedLineCount - 1)
    const rectWidthProgress = ah.getPingPongLoopProgress(16)

    for (let i = -halfLineCount; i <= halfLineCount; i++) {
      const phaseOffset =
        Math.abs(i) *
        ah.animate({
          keyframes: [0, 1],
          duration: 64,
        })
      p.fill(
        colorScale(
          (ah.animate({
            keyframes: [0, 1, 0],
            duration: 8,
          }) +
            phaseOffset) %
            1,
        ).rgba(),
      )
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

      let rectRadius = ah.animateProperty({ from: 0, to: 10, duration: 2 })
      rectRadius += ah.getPingPongLoopProgress(1) * Math.abs(i) * 2
      rectRadius = rectRadius % 20

      // center
      p.rect(
        w / 2 - rectWidth / 2,
        centerY + yOffset - rectHeight / 2,
        rectWidth,
        rectHeight,
        rectRadius,
      )

      const edgeWidth = rectWidth * 2
      p.fill(
        colorScale(
          (ah.animate({
            keyframes: [0, 1, 0],
            duration: 8,
          }) +
            (1 - phaseOffset)) %
            1,
        ).rgba(),
      )
      // left
      p.rect(
        0,
        centerY + yOffset - rectHeight / 2,
        edgeWidth,
        rectHeight / 4,
        rectRadius,
      )
      // right
      p.rect(
        w - edgeWidth,
        centerY + yOffset - rectHeight / 2,
        edgeWidth,
        rectHeight / 4,
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
