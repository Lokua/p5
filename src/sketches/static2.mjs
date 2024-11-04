import chroma from 'chroma-js'
import ControlPanel, {
  Checkbox,
  Range,
  Select,
} from '../lib/ControlPanel/index.mjs'
import { average } from '../util.mjs'

/**
 * @param {import("p5")} p
 */
export default function lines(p) {
  const metadata = {
    name: 'static2',
    frameRate: 30,
  }

  const [w, h] = [500, 500]

  const speedDistributions = {
    topToBottom: (y) => y / h,
    bottomToTop: (y) => (h - y) / h,
    sineWave: (y) => Math.sin((y / h) * Math.PI),
    hourglass: (y) => 1 - Math.abs(y / h - 0.5) * 2,
    exponential: (y) => Math.pow(y / h, 2),
    invertedExponential: (y) => 1 - Math.pow(y / h, 2),
    bellCurve: (y) => Math.exp(-Math.pow((y / h - 0.5) * 4, 2)),
    stepFunction: (y) => (y / h < 0.5 ? 0 : 1),
    triangleWave: (y) => 1 - Math.abs((((y / h) * 2) % 2) - 1),
    sawtoothWave: (y) => ((y / h) * 2) % 1,
    squareWave: (y) => (((y / h) * 2) % 2 < 1 ? 0 : 1),
    customCurve: (y) => Math.pow(Math.sin((y / h) * Math.PI), 2),
    logistic: (y) => 1 / (1 + Math.exp(-10 * (y / h - 0.5))),
    invertedLogistic: (y) => 1 - 1 / (1 + Math.exp(-10 * (y / h - 0.5))),
  }

  const colorScale = chroma.scale([
    'indigo',
    'azure',
    'midnightblue',
    'rebeccapurple',
  ])

  const controlPanel = new ControlPanel({
    p,
    id: metadata.name,
    controls: {
      nLines: new Range({
        name: 'nLines',
        value: 10,
        min: 1,
        max: 200,
      }),
      range: new Range({
        name: 'range',
        value: 20,
        min: 0,
        max: 100,
      }),
      segmentLength: new Range({
        name: 'segmentLength',
        value: 10,
        min: 1,
        max: 100,
      }),
      strokeWeight: new Range({
        name: 'strokeWeight',
        value: 2,
        min: 1,
        max: 20,
      }),
      padding: new Range({
        name: 'padding',
        value: 8,
        min: 0,
        max: w / 2,
      }),
      noiseScale: new Range({
        name: 'noiseScale',
        value: 0.02,
        min: 0.001,
        max: 1,
        step: 0.001,
      }),
      globalNoiseOffset: new Range({
        name: 'globalNoiseOffset',
        value: 11.5,
        min: 0,
        max: 40,
        step: 0.1,
      }),
      speed: new Range({
        name: 'speed',
        value: 0.1,
        min: 0.001,
        max: 10,
        step: 0.001,
      }),
      leftToRight: new Checkbox({
        name: 'leftToRight',
        value: false,
      }),
      speedDistribution1: new Select({
        name: 'speedDistribution1',
        value: 'topToBottom',
        options: Object.keys(speedDistributions),
      }),
      speedDistribution2: new Select({
        name: 'speedDistribution2',
        value: 'bottomToTop',
        options: Object.keys(speedDistributions),
      }),
      blendAmount: new Range({
        name: 'blendAmount',
        value: 0,
        min: 0,
        max: 1,
        step: 0.01,
      }),
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    p.colorMode(p.RGB, 255, 255, 255, 1)
    p.noiseSeed(42)

    return {
      canvas,
    }
  }

  function draw() {
    const {
      nLines,
      segmentLength,
      strokeWeight,
      range,
      noiseScale,
      globalNoiseOffset,
      speed,
      leftToRight,
      padding,
      speedDistribution1,
      speedDistribution2,
      blendAmount,
    } = controlPanel.values()

    p.background(255)
    p.fill(0)
    p.strokeWeight(strokeWeight)

    const lineSpacing = Math.floor(h / (nLines - 1))
    const speedFn1 = speedDistributions[speedDistribution1]
    const speedFn2 = speedDistributions[speedDistribution2]

    for (let y = 0; y <= h + range; y += lineSpacing) {
      const speedFactor =
        speedFn1(y) * (1 - blendAmount) + speedFn2(y) * blendAmount
      const lineNoiseOffset =
        (leftToRight ? -globalNoiseOffset : globalNoiseOffset) * speedFactor

      drawLine({
        startX: padding,
        startY: y,
        length: w - padding * 2,
        segmentLength,
        range,
        noiseScale,
        globalNoiseOffset: lineNoiseOffset,
        speed,
      })
    }
  }

  function drawLine({
    startX,
    startY,
    length,
    segmentLength,
    range,
    noiseScale,
    globalNoiseOffset,
    speed,
  }) {
    const numSegments = Math.ceil(length / segmentLength)
    const actualSegmentLength = length / numSegments

    let noiseOffset = 0
    const noiseIncrement = noiseScale * actualSegmentLength

    const noiseValues = []
    const t = (p.millis() / 1000) * speed
    const someScale = 0.1
    for (let i = 0; i <= numSegments; i++) {
      const noiseValue =
        p.noise(
          noiseOffset + globalNoiseOffset,
          startY * noiseScale + t * someScale,
        ) - 0.5
      noiseValues.push(noiseValue)
      noiseOffset += noiseIncrement
    }

    const meanNoiseValue = average(noiseValues)
    const adjustedNoiseValues = noiseValues.map((n) => n - meanNoiseValue)

    const amplitude = p.map(startY, 0, h, 0, range)
    let prevX = startX
    let prevY = startY + adjustedNoiseValues[0] * 2 * amplitude

    for (let i = 1; i <= numSegments; i++) {
      const currentX = startX + i * actualSegmentLength
      const currentY = startY + adjustedNoiseValues[i] * 2 * amplitude

      const noiseFactor = (adjustedNoiseValues[i] + 0.5) * amplitude
      p.stroke(colorScale(noiseFactor / amplitude).rgba())

      p.line(prevX, prevY, currentX, currentY)
      prevX = currentX
      prevY = currentY
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
