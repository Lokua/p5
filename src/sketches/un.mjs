import chroma from 'chroma-js'
import ControlPanel, { Button, Range } from '../lib/ControlPanel/index.mjs'
import { randomInt } from '../util.mjs'

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const metadata = {
    name: 'un',
    frameRate: 30,
  }

  const [w, h] = [500, 500]
  let buffer
  let splashed = false

  const controlPanel = new ControlPanel({
    p,
    id: metadata.name,
    autoRedraw: false,
    controls: {
      strokeWeight: new Range({
        name: 'strokeWeight',
        value: 2,
        min: 1,
        max: 100,
      }),
      segmentLength: new Range({
        name: 'segmentLength',
        value: 1,
        min: 1,
        max: 10,
      }),
      speed: new Range({
        name: 'speed',
        value: 5,
        min: 1,
        max: 1000,
      }),
      splash: new Button({
        name: 'splash',
        shortcut: 'q',
        handler() {
          splashed = true
          p.redraw()
        },
      }),
      intensity: new Range({
        name: 'intensity',
        value: 100,
        min: 10,
        max: 1000,
      }),
      clear: new Button({
        name: 'clear',
        shortcut: 'w',
        handler() {
          buffer.clear()
          p.clear()
        },
      }),
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)
    buffer = p.createGraphics(w, h)
    p.colorMode(p.RGB, 255, 255, 255, 1)
    buffer.colorMode(p.RGB, 255, 255, 255, 1)
    buffer.strokeCap(p.SQUARE)

    p.noLoop()

    return {
      canvas,
    }
  }

  const center = p.createVector(w / 2, h / 2)

  const directions = [
    p.createVector(1, 0),
    p.createVector(-1, 0),
    p.createVector(0, 1),
    p.createVector(0, -1),
  ]

  const pointA = {
    position: center.copy(),
    previous: center.copy(),
    velocity: directions[randomInt(0, 3)].copy(),
    segmentRemaining: 0,
    color: chroma('black').alpha(0.2).rgba(),
  }

  const pointB = {
    position: center.copy(),
    previous: center.copy(),
    velocity: directions[randomInt(0, 3)].copy(),
    segmentRemaining: 0,
    color: chroma('white').alpha(0.5).rgba(),
  }

  function draw() {
    if (!splashed) {
      return
    }

    const { strokeWeight, segmentLength, speed, alpha, intensity } =
      controlPanel.values()

    p.background(255)
    buffer.strokeWeight(strokeWeight)
    buffer.strokeCap(p.SQUARE)
    buffer.noFill()

    for (let i = 0; i < speed * intensity; i++) {
      updateAndDrawPoint(pointA, segmentLength, alpha)
      updateAndDrawPoint(pointB, segmentLength, alpha)
    }

    p.image(buffer, 0, 0)
  }

  function updateAndDrawPoint(point, segmentLength) {
    if (point.segmentRemaining <= 0) {
      point.velocity = directions[randomInt(0, 3)].copy()
      point.segmentRemaining = segmentLength
    }

    point.previous.set(point.position)

    point.position.add(point.velocity)

    buffer.stroke(point.color)
    buffer.line(
      point.previous.x,
      point.previous.y,
      point.position.x,
      point.position.y,
    )

    point.segmentRemaining -= 1

    if (point.position.x < 0) {
      point.position.x = 0
      point.segmentRemaining = 0
    } else if (point.position.x > w) {
      point.position.x = w
      point.segmentRemaining = 0
    }
    if (point.position.y < 0) {
      point.position.y = 0
      point.segmentRemaining = 0
    } else if (point.position.y > h) {
      point.position.y = h
      point.segmentRemaining = 0
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
