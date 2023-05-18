import ControlPanel, {
  Range,
} from '../ControlPanel/index.mjs'
import { BidirectionalCounter } from '../util.mjs'

export default function (p) {
  const [w, h] = [500, 500]
  const counter = new BidirectionalCounter(1, 100)

  const metadata = {
    name: 'radialPerlin2',
  }

  const controlPanel = new ControlPanel({
    id: metadata.name,
    attemptReload: true,
    controls: {
      size: new Range({
        name: 'size',
        value: 60,
        min: 1,
        max: 400,
      }),
      resolution: new Range({
        name: 'resolution',
        value: 0.05,
        min: 0,
        max: 1,
        step: 0.01,
      }),
      scale: new Range({
        name: 'scale',
        value: 10,
        min: 1,
        max: 100,
      }),
      nPoints: new Range({
        name: 'nPoints',
        value: 100,
        min: 1,
        max: 400,
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
    p.noiseSeed(312)
    p.angleMode(p.DEGRESS)
    p.strokeCap(p.SQUARE)
    p.background(255)

    return {
      canvas,
    }
  }

  function draw() {
    const {
      size,
      resolution,
      scale,
      nPoints,
    } = controlPanel.values()
    p.background(0)
    p.stroke(0, 90)
    p.strokeWeight(1)
    p.fill(100, 50)

    for (let i = 0; i < 10; i += 1) {
      p.translate(w / 2, h / 2)
      p.scale(3 - i * 0.05)
      p.beginShape()
      for (let a = 0; a < p.TAU; a += p.TAU / nPoints) {
        const x = p.cos(a)
        const y = p.sin(a)
        const n = p.map(
          p.noise(x * resolution, y * resolution),
          0,
          1,
          -scale,
          scale,
        )
        p.curveVertex(x, y)
      }
      p.endShape()
      p.resetMatrix()
    }

    counter.tick()
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
