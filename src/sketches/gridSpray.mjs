import chroma from 'chroma-js'
import ControlPanel, { Button, Range } from '../lib/ControlPanel/index.mjs'
import { createPrng } from '../lib/Noise.mjs'
import { logInfo } from '../util.mjs'

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const metadata = {
    name: 'gridSpray',
    frameRate: 30,
    pixelDensity: 6,
  }

  const [w, h] = [500, 500]
  let buffer
  let spray
  let splashed = false

  const controlPanel = new ControlPanel({
    p,
    id: metadata.name,
    autoRedraw: false,
    controls: {
      intensity: new Range({
        name: 'intensity',
        value: 50,
        min: 10,
        max: 100,
      }),
      maxSegmentLength: new Range({
        name: 'maxSegmentLength',
        value: 5,
        min: 1,
        max: 40,
      }),
      anomaly: new Range({
        name: 'anomaly',
      }),
      seed: new Range({
        name: 'seed',
        value: 25,
        min: 20,
        max: 30,
        step: 1,
      }),
      splash: new Button({
        name: 'splash',
        shortcut: 'q',
        handler() {
          console.log('what the fuck!?!')
          logInfo('[gridSpray] processing...')
          splashed = true
          p.redraw()
          logInfo('[gridSpray] done')
        },
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
    const canvas = p.createCanvas(w, h)

    controlPanel.init()
    const { intensity, maxSegmentLength, anomaly, seed } = controlPanel.values()

    spray = gridSpray({
      p,
      w,
      h,
      intensity,
      maxSegmentLength,
      anomaly,
      color1: chroma('black').alpha(0.2).rgba(),
      color2: chroma('white').alpha(0.5).rgba(),
      seed,
    })

    p.noLoop()

    return {
      canvas,
    }
  }

  function draw() {
    if (splashed) {
      const { intensity, maxSegmentLength, anomaly } = controlPanel.values()
      p.background(255)
      buffer = spray({
        intensity,
        maxSegmentLength,
        anomaly,
      })
      p.image(buffer, 0, 0, w, h)
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

export function gridSpray({
  p,
  w,
  h,
  intensity: intensity_,
  maxSegmentLength: maxSegmentLength_,
  anomaly: anomaly_,
  color1,
  color2,
  seed = 36_592,
}) {
  const buffer = p.createGraphics(w, h)
  const random = createPrng(seed)
  buffer.colorMode(p.RGB, 255, 255, 255, 1)
  buffer.noiseSeed(seed)
  buffer.colorMode(p.RGB, 255, 255, 255, 1)
  buffer.strokeCap(p.SQUARE)
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
    velocity: directions[0].copy(),
    segmentRemaining: 0,
    noiseOffset: 0,
    color: chroma(color1).rgba(),
  }

  const pointB = {
    position: center.copy(),
    previous: center.copy(),
    velocity: directions[0].copy(),
    segmentRemaining: 0,
    noiseOffset: 0,
    color: chroma(color2).rgba(),
  }

  return ({
    splashes = 1,
    intensity = intensity_,
    maxSegmentLength = maxSegmentLength_,
    anomaly = anomaly_,
  } = {}) => {
    buffer.noFill()

    for (let s = 0; s < splashes; s++) {
      const iterations = Math.round(Math.pow(intensity, 3))
      for (let i = 0; i < iterations; i++) {
        for (
          let segmentLength = maxSegmentLength;
          segmentLength > 1;
          segmentLength--
        ) {
          buffer.strokeWeight(maxSegmentLength - segmentLength)
          updateAndDrawPoint({
            point: pointA,
            segmentLength,
            anomaly,
          })
          updateAndDrawPoint({
            point: pointB,
            segmentLength,
            anomaly,
          })
        }
      }
    }

    return buffer
  }

  function updateAndDrawPoint({ point, segmentLength, anomaly }) {
    if (point.segmentRemaining <= 0) {
      const isAnomaly = random() * 100 < anomaly

      if (isAnomaly && point.previousDirection) {
        point.velocity = point.previousDirection.copy()
        const multiplier = 3
        point.segmentRemaining = segmentLength * multiplier
      } else {
        const index = Math.floor(random() * 4)
        point.velocity = directions[index].copy()
        point.segmentRemaining = segmentLength
      }

      point.previousDirection = point.velocity.copy()
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
}
