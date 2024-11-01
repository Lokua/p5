// https://www.youtube.com/watch?v=lNKFhaOQJys&t=259s

import ControlPanel, { Checkbox, Range } from '../lib/ControlPanel/index.mjs'
import AnimationHelper from '../lib/AnimationHelper.mjs'
import { average } from '../util.mjs'

/**
 * @param {import("p5")} p
 */
export default function lines(p) {
  const [w, h] = [500, 500]

  const metadata = {
    name: 'static',
    frameRate: 30,
  }

  const bpm = 134
  const ah = new AnimationHelper({ p, frameRate: metadata.frameRate, bpm })

  const controlPanel = new ControlPanel({
    p,
    id: metadata.name,
    controls: {
      nLines: new Range({
        name: 'nLines',
        value: 1,
        min: 2,
        max: 200,
      }),
      range: new Range({
        name: 'range',
        value: 2,
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
        value: 1,
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
      speed: new Range({
        name: 'speed',
        value: 0.1,
        min: 0.001,
        max: 1,
        step: 0.001,
      }),
      leftToRight: new Checkbox({
        name: 'leftToRight',
        value: false,
      }),
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    p.colorMode(p.HSB, 100)
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
      speed,
      leftToRight,
      padding,
    } = controlPanel.values()

    p.background(100, 2, 100)
    p.fill(0)
    p.stroke(0)
    p.strokeWeight(strokeWeight)

    const globalNoiseOffset = ah.getTotalBeatsElapsed() * speed

    const n = Math.floor(h / nLines)
    for (let y = n; y < h - n; y += n) {
      drawLine({
        x: padding,
        y,
        length: w - padding * 2,
        segmentLength,
        range,
        noiseScale,
        globalNoiseOffset: leftToRight
          ? globalNoiseOffset * -1
          : globalNoiseOffset,
      })
    }
  }

  function drawLine({
    x: lineX,
    y: lineY,
    length,
    segmentLength,
    range,
    noiseScale,
    globalNoiseOffset,
  }) {
    const numSegments = Math.ceil(length / segmentLength)
    const actualSegmentLength = length / numSegments

    // Arrays to store x and y coordinates
    const xCoords = []
    const yCoords = []

    let noiseOffset = 0
    const noiseIncrement = noiseScale * actualSegmentLength

    // Collect noise values for all segments
    const noiseValues = []
    for (let i = 0; i <= numSegments; i++) {
      const noiseValue =
        p.noise(noiseOffset + globalNoiseOffset, lineY * noiseScale) - 0.5
      noiseValues.push(noiseValue)
      noiseOffset += noiseIncrement
    }

    const meanNoiseValue = average(noiseValues)
    const adjustedNoiseValues = noiseValues.map((x) => x - meanNoiseValue)

    // Map adjusted noise values to y coordinates
    const r = p.map(lineY, 0, h, 0, range)
    for (let i = 0; i <= numSegments; i++) {
      const x = lineX + i * actualSegmentLength
      const y = lineY + adjustedNoiseValues[i] * 2 * r
      xCoords.push(x)
      yCoords.push(y)
    }

    const glitch = 1
    for (let i = glitch; i <= numSegments; i++) {
      p.line(
        xCoords[i - glitch],
        Math.min(yCoords[i - glitch], h - 1),
        xCoords[i],
        Math.min(yCoords[i], h - 1),
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
