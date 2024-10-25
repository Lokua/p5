// https://editor.p5js.org/generative-design/sketches/M_2_5_01

import ControlPanel, { Range } from '../ControlPanel/index.mjs'

export default function (p) {
  const [w, h] = [500, 500]

  const pointCount = 500
  const lissajousPoints = []
  const freqX = 4
  const freqY = 7
  const phi = 15

  const modFreqX = 3
  const modFreqY = 2

  const lineWeight = 0.1
  const lineColor = p.color(0, 50)

  const metadata = {
    name: 'lissajous',
  }

  const controlPanel = new ControlPanel({
    id: metadata.name,
    attemptReload: true,
    controls: {
      connectionRadius: new Range({
        name: 'connectionRadius',
        value: 100,
        min: 1,
        max: 1000,
      }),
      lineAlpha: new Range({
        name: 'lineAlpha',
        value: 50,
        min: 1,
        max: 255,
      }),
    },
    inputHandler() {
      !p.isLooping() && draw()
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    p.noLoop()
    p.noFill()

    calculateLissajousPoints()

    return {
      canvas,
    }
  }

  function draw() {
    const { connectionRadius, lineAlpha } = controlPanel.values()
    p.background(255)
    p.strokeWeight(lineWeight)

    p.push()
    p.translate(w / 2, h / 2)
    for (let i1 = 0; i1 < pointCount; i1++) {
      for (let i2 = 0; i2 < i1; i2++) {
        const d = lissajousPoints[i1].dist(lissajousPoints[i2])
        const a = p.pow(1 / (d / connectionRadius + 1), 6)
        if (d <= connectionRadius) {
          p.stroke(lineColor, a * lineAlpha)
          p.line(
            lissajousPoints[i1].x,
            lissajousPoints[i1].y,
            lissajousPoints[i2].x,
            lissajousPoints[i2].y,
          )
        }
      }
    }
    p.pop()
  }

  function calculateLissajousPoints() {
    for (let i = 0; i <= pointCount; i++) {
      const angle = p.map(i, 0, pointCount, 0, p.TAU)

      let x = p.sin(angle * freqX + p.radians(phi)) * p.cos(angle * modFreqX)
      let y = p.sin(angle * freqY) * p.cos(angle * modFreqY)
      x *= w / 2 - 30
      y *= h / 2 - 30

      lissajousPoints[i] = p.createVector(x, y)
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
