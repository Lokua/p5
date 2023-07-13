import ControlPanel, {
  Range,
} from '../ControlPanel/index.mjs'
import Counter from '../Counter.mjs'

export default function lines(p) {
  const [w, h] = [500, 500]

  // eslint-disable-next-line no-unused-vars
  const frameCounter = new Counter({
    min: 0,
    max: 1000,
  })

  const controlPanel = new ControlPanel({
    controls: {
      foo: new Range({
        name: 'foo',
        value: 1000,
        min: 1,
        max: 5000,
      }),
    },
    inputHandler() {
      !p.isLooping() && draw()
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    p.colorMode(p.HSB, 1)
    p.noStroke()

    return {
      canvas,
    }
  }

  function draw() {
    p.background(1, 0.02, 1)
    p.fill(0)
    p.stroke(0)

    const nLines = 100

    for (let y = 0; y < h; y += h / nLines) {
      drawLine(0, y, w)
    }
  }

  function drawLine(lineX, lineY, length) {
    for (let x = lineX; x < lineX + length; x++) {
      p.point(x, lineY)
    }
  }

  return {
    setup,
    draw,
    destroy() {
      controlPanel.destroy()
    },
    metadata: {
      name: 'lines',
    },
  }
}
