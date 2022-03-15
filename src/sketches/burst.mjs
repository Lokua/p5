import ControlPanel, {
  Range,
} from '../ControlPanel/index.mjs'
import { BidirectionalCounter } from '../util.mjs'

export default function burst(p) {
  const [w, h] = [500, 500]
  const counter = new BidirectionalCounter(1, 100)
  const sizeCounter = new BidirectionalCounter(1, 80)
  const offsetCounter = new BidirectionalCounter(1, 100)
  const rb = () => p.random() < 0.5

  const controlPanel = new ControlPanel({
    id: 'burst',
    attemptReload: true,
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
    // p.noLoop()

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

    counter.tick()
    if (p.frameCount % 2 === 0) {
      sizeCounter.tick()
    }
    if (p.frameCount % 3 === 0) {
      offsetCounter.tick()
    }
  }

  function burst({ count, x, y, size, offset }) {
    p.noStroke()

    for (let i = 0; i < count; i++) {
      p.fill(p.random(200, 255), 0, counter.value, 200)

      const randomOffset = () =>
        p.noise(offset * i) * (counter.value + offset) +
        offsetCounter.value

      const xx = rb()
        ? x + randomOffset()
        : x - randomOffset()

      const yy = rb()
        ? y + randomOffset()
        : y - randomOffset()

      p.ellipse(
        yy,
        xx,
        p.noise(size * i + x) * (size + sizeCounter.value),
        p.noise(size * i + y) * (size + sizeCounter.value),
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
      name: 'burst',
    },
  }
}
