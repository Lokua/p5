import ControlPanel, {
  Range,
} from '../ControlPanel/index.mjs'
import { BidirectionalCounter } from '../util.mjs'

export default function grid4(p) {
  const [w, h] = [500, 500]
  const counter = new BidirectionalCounter(0, 8)

  // default 2 and 4 will create a grid like:
  // +-------+
  // | X   X |
  // |   X   |
  // | X   X |
  // +-------+
  const createSections = (a = 2, b = 4) => [
    // center
    [w / a, h / a],
    // top left
    [w / b, h / b],
    // top-right
    [w / a + w / b, h / b],
    // bottom left
    [w / b, h / a + h / b],
    // bottom right
    [w / a + w / b, h / a + h / b],
  ]

  const rb = () => p.random() < 0.5
  const red = () => p.color(p.random([200, 255]), 0, 0, 127)
  const orange = () =>
    p.color(p.random([200, 255]), 127, 0, 127)

  const controlPanel = new ControlPanel({
    controls: {
      size: new Range({
        name: 'size',
        value: 20,
        min: 1,
        max: 500,
      }),
      offset: new Range({
        name: 'offset',
        value: 100,
        min: 1,
        max: 500,
      }),
      count: new Range({
        name: 'count',
        value: 40,
        min: 1,
        max: 500,
      }),
    },
    inputHandler() {
      !p.isLooping() && draw()
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)
    p.angleMode(p.DEGREES)

    return {
      canvas,
    }
  }

  function draw() {
    const { count, offset, size } = controlPanel.values()
    p.background(0)
    p.noiseSeed(p.random(100))

    const bustBursts = (color, otherShit) => ([x, y]) => {
      otherShit?.()
      burst({
        color,
        count,
        size,
        offset,
        x,
        y,
      })
    }

    createSections(2, 4).forEach(([xx]) => {
      p.translate(xx, 0)
      createSections(2, 4).forEach(bustBursts(red))
      p.resetMatrix()

      p.translate(xx * -1, 0)
      createSections(2, 4).forEach(bustBursts(orange))
      p.resetMatrix()
    })

    counter.tick()
  }

  function burst({ color, count, size, offset, x, y }) {
    p.noStroke()

    for (let i = 0; i < count; i++) {
      p.fill(color())

      const randomOffset = () =>
        p.noise(offset * i) * offset

      const xx = rb()
        ? x + randomOffset()
        : x - randomOffset()

      const yy = rb()
        ? y + randomOffset()
        : y - randomOffset()

      p.ellipse(
        yy,
        xx,
        p.noise(size * i + x) * size,
        p.noise(size * i + y) * size,
      )
    }
  }

  return {
    setup,
    draw,
    destroy() {
      controlPanel.destroy()
    },
    metadata: {
      name: 'burst2',
    },
  }
}
