// https://www.youtube.com/watch?v=lNKFhaOQJys&t=259s

import ControlPanel, {
  Range,
  createBlendMode,
} from '../lib/ControlPanel/index.mjs'
import AnimationHelper from '../lib/AnimationHelper.mjs'

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
        min: 1,
        max: 100,
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
      blendMode: createBlendMode(),
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
      blendMode,
      range,
      noiseScale,
      speed,
    } = controlPanel.values()

    p.blendMode(p[blendMode])
    p.background(100, 2, 100)
    p.fill(0)
    p.stroke(0)
    p.strokeWeight(strokeWeight)

    const globalNoiseOffset = ah.getTotalBeatsElapsed() * speed

    const n = Math.floor(h / nLines)
    const pad = 8
    for (let y = n; y < h - n; y += n) {
      drawLine({
        x: pad,
        y,
        length: w - pad * 2,
        segmentLength,
        range,
        noiseScale,
        globalNoiseOffset,
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
    let prevX = lineX
    let prevY = lineY
    const r = p.map(lineY, 0, h, 0, range)

    const numSegments = Math.ceil(length / segmentLength)
    const actualSegmentLength = length / numSegments

    let noiseOffset = 0
    const noiseIncrement = noiseScale * actualSegmentLength

    for (let i = 1; i <= numSegments; i++) {
      const x = lineX + i * actualSegmentLength
      const noiseValue = p.noise(
        noiseOffset + globalNoiseOffset,
        lineY * noiseScale,
      )
      const y = lineY + p.map(noiseValue, 0, 1, -r, r)
      p.line(prevX, prevY, x, y)
      prevX = x
      prevY = y
      noiseOffset += noiseIncrement
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
