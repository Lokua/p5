import ControlPanel, {
  Range,
} from '../ControlPanel/index.mjs'

export default function sketch(p, { pushPop }) {
  const [w, h] = [500, 500]

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

    p.noLoop()
    p.noFill()

    return {
      canvas,
    }
  }

  function draw() {
    const { a, b } = controlPanel.values()
    p.background(255)
    p.stroke(0, 40)

    pushPop(() => {
      p.translate(w / 2, h / 2)
      shape(2 * a)
    })
    pushPop(() => {
      p.translate(w / 2, h / 2)
      p.rotate(p.radians(45))
      shape(3 * b)
    })
  }

  function shape(circleSize, squareSize = circleSize) {
    p.circle(0, 0, circleSize)
    p.square(0, 0, squareSize)
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
