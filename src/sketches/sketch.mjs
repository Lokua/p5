import ControlPanel, {
  Range,
} from '../ControlPanel/index.mjs'
import { BidirectionalCounter } from '../util.mjs'

export default function sketch(p, { pushPop }) {
  const [w, h] = [500, 500]
  const counter = new BidirectionalCounter(0, 100)

  const controlPanel = new ControlPanel({
    controls: {
      count: new Range({
        name: 'count',
        value: 100,
        min: 1,
        max: 500,
      }),
      a: new Range({
        name: 'a',
        value: 60,
        min: 1,
        max: 100,
      }),
      b: new Range({
        name: 'b',
        value: 70,
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

    p.noStroke()

    return {
      canvas,
    }
  }

  function draw() {
    const { a } = controlPanel.values()
    p.background(255)
    p.fill(255, 127, 63)

    pushPop(() => {
      p.translate(w / 2, h / 2)
      p.rotate(p.radians(45))
      p.circle(0, 0, a + counter.count)
    })

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
