// https://www.youtube.com/watch?v=sZBfLgfsvSk&list=PLeCiJGCSl7jc5UWvIeyQAvmCNc47IuwkM&index=22

import ControlPanel, { Range } from '../ControlPanel/index.mjs'

export default function (p) {
  const [w, h] = [500, 500]

  const metadata = {
    name: 'flowField6',
    frameRate: 30,
  }

  const nPoints = 10000
  const points = []

  const controlPanel = new ControlPanel({
    id: metadata.name,
    attemptReload: true,
    controls: {
      noiseScale: new Range({
        name: 'noiseScale',
        value: 0.001,
        min: 0.001,
        max: 1,
        step: 0.001,
      }),
      velocity: new Range({
        name: 'velocity',
        value: 0.01,
        min: 0.01,
        max: 10,
        step: 0.01,
      }),
      zoom: new Range({
        name: 'zoom',
        value: 1,
        min: 1,
        max: 100,
        step: 1,
      }),
      octaves: new Range({
        name: 'octaves',
        value: 4,
        min: 1,
        max: 100,
      }),
      octaveMult: new Range({
        name: 'octaveMult',
        value: 1,
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
    },
    inputHandler() {
      !p.isLooping() && draw()
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
      zoom,
      octaves,
      octaveMult,
      particleAlpha,
    } = controlPanel.values()
    p.background(0, 5)
    p.strokeWeight(1)
    p.noiseDetail(octaves, octaveMult)

    for (let i = 0; i < nPoints; i++) {
      p.stroke(p.random(0, 100), 100, 100, particleAlpha)
      const point = points[i]
      p.point(point.x, point.y)
      const n = p.noise(point.x * ns, point.y * ns)
      const a = p.TWO_PI * zoom * n
      point.x += Math.tan(a) * vel
      point.y += Math.tanh(a) * vel
      if (!onScreen(point)) {
        point.x = p.random(w)
        point.y = p.random(h)
      }
    }

    if (p.frameCount % 200 === 0) {
      p.noiseSeed(p.millis())
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
