import ControlPanel, {
  Range,
} from '../ControlPanel/index.mjs'
import { BidirectionalCounter, isEven } from '../util.mjs'

/* @see https://processing.org/examples/sinewave.html */

export default function (p) {
  const [w, h] = [500, 500]
  const ampCounter = new BidirectionalCounter(0, h / 2)
  let xx = 0

  const metadata = {
    name: 'sin3b',
  }

  const controlPanel = new ControlPanel({
    id: metadata.name,
    attemptReload: true,
    controls: {
      size: new Range({
        name: 'size',
        value: 100,
        min: 1,
        max: w,
      }),
      period: new Range({
        name: 'period',
        value: 496,
        min: 2,
        max: 1000,
      }),
    },
    inputHandler() {
      !p.isLooping() && draw()
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    p.ellipseMode(p.CENTER)
    // p.noLoop()

    return {
      canvas,
    }
  }

  function draw() {
    const { size, period } = controlPanel.values()
    p.clear()
    p.background(0)

    const n = Math.floor(w / size)
    const dx = ((Math.PI * 2) / period) * n

    for (let x = -n; x < w - n; x += n) {
      const yCenter = h / 2
      const yOffset = p.sin(xx % x) * ampCounter.count
      const vc = p.map(x, 0, w, 0, 127)
      p.fill(Math.abs(yOffset) + 10, vc, 100, 230)
      p.stroke(Math.abs(yOffset), vc, 66)
      if (isEven(x)) {
        p.ellipse(
          w - x,
          h - yCenter + yOffset,
          x / 4,
          x / 4,
        )
      } else {
        p.ellipse(x, yCenter + yOffset, x / 4, x / 4)
      }
      xx += dx
    }

    ampCounter.tick()
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
