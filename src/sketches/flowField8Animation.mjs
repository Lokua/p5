// https://www.youtube.com/watch?v=sZBfLgfsvSk&list=PLeCiJGCSl7jc5UWvIeyQAvmCNc47IuwkM&index=22

import ControlPanel, { Range, Select } from '../lib/ControlPanel/index.mjs'

export default function (p) {
  const [w, h] = [500, 500]

  const metadata = {
    name: 'flowField8Animation',
    frameRate: 30,
  }

  const nPoints = 10000
  const points = []

  let patternIndex = 0
  const patterns = [
    ['tan', 'tan'],
    ['tan', 'sin'],
    ['sin', 'tan'],
    ['tan', 'cos'],
  ]

  const controlPanel = new ControlPanel({
    p,
    id: metadata.name,
    controls: {
      noiseScale: new Range({
        name: 'noiseScale',
        value: 0.0001,
        min: 0.0001,
        max: 1,
        step: 0.0001,
      }),
      velocity: new Range({
        name: 'velocity',
        value: 0.01,
        min: 0.01,
        max: 10,
        step: 0.01,
      }),
      particleAlpha: new Range({
        name: 'particleAlpha',
        value: 128,
        min: 0,
        max: 255,
      }),
      pattern: new Select({
        name: 'pattern',
        value: 'sin,cos',
        options: [
          'sin,cos',
          'sin,sin',
          'cos,sin',
          'cos,cos',
          'tan,tan',
          'tan,sin',
          'sin,tan',
          'cos,tan',
          'tan,cos',
        ],
      }),
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    p.colorMode(p.HSB, 100)

    for (let i = 0; i < nPoints; i++) {
      points.push(p.createVector(p.random(w), p.random(h)))
    }

    return {
      canvas,
    }
  }

  function draw() {
    const {
      noiseScale: ns,
      velocity: vel,
      particleAlpha,
    } = controlPanel.values()
    p.background(0, 5)
    p.stroke(255, particleAlpha)
    p.strokeWeight(1)

    const [fnA, fnB] = patterns[patternIndex]

    for (let i = 0; i < nPoints; i++) {
      const point = points[i]
      p.point(point.x, point.y)
      const n = p[fnA](point.x * ns) + p[fnB](point.y * ns)
      const a = p.TWO_PI * 6 * n
      point.x += Math.cos(a) * vel
      point.y += Math.sin(a) * vel
      if (!onScreen(point)) {
        point.x = p.random(w)
        point.y = p.random(h)
      }
    }

    if (p.frameCount % 300 === 0) {
      p.noiseSeed(p.millis())
      patternIndex = (patternIndex + 1) % patterns.length
    }
  }

  function onScreen(v) {
    return v.x >= 0 && v.x <= w && v.y >= 0 && v.y <= h
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
