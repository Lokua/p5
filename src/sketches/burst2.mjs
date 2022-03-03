import ControlPanel, {
  Range,
} from '../ControlPanel/index.mjs'

export default function grid4(p) {
  const [w, h] = [500, 500]

  const rb = () => p.random() < 0.5

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
        value: 147,
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
    p.noLoop()

    return {
      canvas,
    }
  }

  function draw() {
    const { count, offset, size } = controlPanel.values()
    p.background(0)
    p.noiseSeed(p.random(100))

    // center
    burst({
      count,
      x: w / 2,
      y: h / 2,
      size,
      offset,
    })
    // top left
    burst({
      count,
      x: w / 4,
      y: h / 4,
      size,
      offset,
    })
    //top right
    burst({
      count,
      x: w / 2 + w / 4,
      y: h / 4,
      size,
      offset,
    })
    //bottom left
    burst({
      count,
      x: w / 4,
      y: h / 2 + h / 4,
      size,
      offset,
    })
    //bottom right
    burst({
      count,
      x: w / 2 + w / 4,
      y: h / 2 + h / 4,
      size,
      offset,
    })
  }

  function burst({ count, x, y, size, offset }) {
    p.noStroke()

    for (let i = 0; i < count; i++) {
      p.fill(255, 0, 0, 180)

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
