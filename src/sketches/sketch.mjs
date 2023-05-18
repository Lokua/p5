import ControlPanel, {
  Range,
} from '../ControlPanel/index.mjs'
import {
  FRAMERATE_BPM_130,
  BidirectionalCounter,
} from '../util.mjs'

export default function (p) {
  const [w, h] = [500, 500]
  const counter = new BidirectionalCounter(1, 100)
  const scaleCounter = new BidirectionalCounter(1, 100)
  const sizeCounter = new BidirectionalCounter(10, 100)
  const pointsCounter = new BidirectionalCounter(1, 200)

  const metadata = {
    name: 'sketch',
    frameRate: FRAMERATE_BPM_130,
  }

  const controlPanel = new ControlPanel({
    id: metadata.name,
    attemptReload: true,
    controls: {
      size: new Range({
        name: 'size',
        value: 60,
        min: 1,
        max: 100,
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
    p.background(100)

    return {
      canvas,
    }
  }

  function draw() {
    const {
      size,
      // resolution,
      // scale,
      // nPoints,
    } = controlPanel.values()
    p.background(0)
    p.stroke(0)
    p.strokeWeight(1)

    for (let i = 0; i < 50; i += 2) {
      p.translate(w / 2, h / 2)
      p.scale(3 - i * 0.05)
      p.beginShape(p.TRIANGLES)
      for (
        let a = 0;
        a < p.TAU;
        a += p.TAU / pointsCounter.count
      ) {
        const x = (size + counter.count * 0.1) * p.cos(a)
        const y = (size + counter.count * 0.01) * p.sin(a)

        const [xx, yy] =
          p.frameCount % 2 === 0 ? [y, x] : [x, y]

        const n = p.map(
          p.noise(xx * counter.count, yy * counter.count),
          0,
          1,
          -scaleCounter.count,
          scaleCounter.count,
        )

        p.curveVertex(xx + n, yy + n)
      }
      p.endShape(p.CLOSE)
      p.resetMatrix()
    }

    counter.tick()
    scaleCounter.tick()
    sizeCounter.tick()
    p.frameCount % (Math.floor(FRAMERATE_BPM_130) * 2) ===
      0 && pointsCounter.tick()
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
