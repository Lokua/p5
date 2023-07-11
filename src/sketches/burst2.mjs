import ControlPanel, {
  Range,
} from '../ControlPanel/index.mjs'
import Counter from '../Counter.mjs'

export default function grid4(p) {
  const [w, h] = [500, 500]
  const counter = new Counter({
    min: 2,
    max: 8,
  })
  const sizeCounter = new Counter({
    min: 2,
    max: 100,
  })
  const countCounter = new Counter({
    min: 10,
    max: 66,
  })
  const offsetCounter = new Counter({
    min: 0,
    max: 500,
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

  const alpha = 90
  const rb = () => p.random() < 0.5
  const color1 = () =>
    p.color(0, 0, p.random([200, 255]), alpha)
  const color2 = () =>
    p.color(p.random([200, 255]), 63, 99, alpha)

  const controlPanel = new ControlPanel({
    controls: {
      unused: new Range({
        name: 'unused',
        value: 100,
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
    p.background(0)
    p.noiseSeed(p.random(100))

    const bustBursts = (color, otherShit) => ([x, y]) => {
      otherShit?.()
      burst({
        color,
        count: countCounter.count,
        size: sizeCounter.count,
        offset: offsetCounter.count,
        x,
        y,
      })
    }

    createSections(2, 4).forEach(([xx]) => {
      p.translate(xx, 0)
      createSections(2, 4).forEach(bustBursts(color1))
      p.resetMatrix()

      p.translate(xx * -1, 0)
      createSections(2, 4).forEach(bustBursts(color2))
      p.resetMatrix()
    })

    counter.tick()
    offsetCounter.tick()

    if (p.frameCount % 3 === 0) {
      countCounter.tick()
    }
    if (p.frameCount % 2 === 0) {
      sizeCounter.tick()
    }
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
