import ControlPanel, {
  Range,
} from '../ControlPanel/index.mjs'
import { BidirectionalCounter } from '../util.mjs'

export default function sketch(p) {
  const [w, h] = [500, 500]
  const counter = new BidirectionalCounter(-100, 100)

  const controlPanel = new ControlPanel({
    id: 'sketch',
    attemptReload: true,
    controls: {
      count: new Range({
        name: 'count',
        value: 100,
        min: 1,
        max: 1000,
      }),
      size: new Range({
        name: 'size',
        value: 60,
        min: 1,
        max: 100,
      }),
      radius: new Range({
        name: 'radius',
        value: 0,
        min: 0,
        max: 500,
      }),
      a: new Range({
        name: 'a',
        value: 2,
        min: 1,
        max: 100,
      }),
    },
    inputHandler() {
      !p.isLooping() && draw()
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(500, 500)

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
    const { size, radius, count, a } = controlPanel.values()

    p.background(255)

    p.translate(w / 2, h / 2)
    p.push()

    for (let i = 0; i < count; i++) {
      p.push()
      p.stroke(0, 10)
      p.rotate(p.sin(i) * a)
      for (let j = 0; j < w / 2; j += 10) {
        p.line(j, j, 0, size + p.noise(i, i * 2) * radius)
      }
      p.pop()
    }

    p.pop()
    counter.tick()
  }

  return {
    setup,
    draw,
    destroy() {
      controlPanel.destroy()
    },
    metadata: {
      name: 'sketch',
    },
  }
}
