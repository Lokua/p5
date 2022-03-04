import ControlPanel, {
  Range,
} from '../ControlPanel/index.mjs'
import { times } from '../util.mjs'

export default function grid4(p) {
  const [w, h] = [500, 500]

  const controlPanel = new ControlPanel({
    controls: {
      size: new Range({
        name: 'size',
        value: 10,
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
      rotations: new Range({
        name: 'rotations',
        value: 8,
        min: 1,
        max: 32,
      }),
    },
    inputHandler() {
      !p.isLooping() && draw()
    },
  })

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

  const red = () => p.color(p.random([200, 255]), 0, 0, 127)
  const orange = () =>
    p.color(p.random([200, 255]), 90, 0, 63)

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)
    p.noLoop()
    p.rectMode(p.CENTER)

    return {
      canvas,
    }
  }

  function draw() {
    const {
      count,
      offset,
      size,
      rotations,
    } = controlPanel.values()
    p.background(255)
    p.noiseSeed(p.random(100))

    createSections(2, 4).forEach(([x, y]) => {
      p.push()
      p.translate(x, y)

      p.push()
      p.scale(1.3, 1.3)
      times(rotations, (i) => {
        p.push()
        p.rotate((p.TWO_PI * i) / rotations)
        burst({
          color: orange,
          count,
          size,
          offset,
          x: p.noise(i),
          y: p.noise(i),
        })
        p.pop()
      })
      p.pop()

      times(rotations, (i) => {
        p.push()
        p.rotate((p.TWO_PI * i) / rotations)
        burst({
          color: red,
          count,
          size,
          offset,
          x: p.noise(i),
          y: p.noise(i),
        })
        p.pop()
      })
      p.pop()
    })
  }

  function burst({ color, count, size, offset, x, y }) {
    p.noStroke()
    p.noiseSeed(p.random([1, 100]))

    for (let i = 0; i < count; i++) {
      p.fill(color())
      p.ellipse(
        p.noise(i) * offset,
        p.noise(i) * offset,
        x * p.random([0, size]),
        y * p.random([0, size]),
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
      name: 'burst3',
    },
  }
}
