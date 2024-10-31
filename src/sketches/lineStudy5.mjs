/* eslint-disable no-unused-vars */
// https://www.youtube.com/watch?v=lNKFhaOQJys&t=259s

import ControlPanel, {
  Range,
  Checkbox,
  createBlendMode,
} from '../lib/ControlPanel/index.mjs'
import { arrayModLookup, mapTimes } from '../util.mjs'

export default function lines(p) {
  const [w, h] = [500, 500]

  const metadata = {
    name: 'lineStudy5',
  }

  const controlPanel = new ControlPanel({
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
      blendMode: createBlendMode(),
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    p.colorMode(p.HSB, 1)
    p.noStroke()
    p.noLoop()

    return {
      canvas,
    }
  }

  function draw() {
    const { nLines, segmentLength, strokeWeight, blendMode, range } =
      controlPanel.values()
    p.blendMode(p[blendMode])
    p.background(1, 0.02, 1)
    p.fill(0)
    p.stroke(0)
    p.strokeWeight(strokeWeight)

    const n = Math.floor(h / nLines)
    const pad = 8
    for (let y = n; y < h - n; y += n) {
      drawLine({
        x: pad,
        y,
        length: w - pad * 2,
        segmentLength,
        range,
      })
    }
  }

  function drawLine({ x: lineX, y: lineY, length, segmentLength, range }) {
    let prevX = lineX
    let prevY = lineY
    const r = p.map(lineY, 0, h, 0, range)

    for (
      let x = lineX + segmentLength;
      x < lineX + length;
      x += segmentLength
    ) {
      const y = lineY + p.random(-r, r)
      p.line(prevX, prevY, x, y)
      prevX = x
      prevY = y
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
