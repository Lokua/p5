import ControlPanel, {
  Range,
  Toggle,
  createBlendMode,
} from '../ControlPanel/index.mjs'
import { isEven } from '../util.mjs'

export default function lines(p) {
  const [w, h] = [500, 500]

  const metadata = {
    name: 'lineStudy',
  }

  const controlPanel = new ControlPanel({
    id: metadata.name,
    attemptReload: true,
    controls: {
      nLines: new Range({
        name: 'nLines',
        value: 10,
        min: 1,
        max: 100,
        step: 1,
      }),
      lineSpacing: new Range({
        name: 'lineSpacing',
        value: 10,
        min: 1,
        max: 100,
      }),
      strokeWeight: new Range({
        name: 'strokeWeight',
        value: 1,
        min: 1,
        max: 20,
      }),
      blendMode: createBlendMode(),
      debug: new Toggle({
        name: 'debug',
        value: false,
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
    p.noLoop()

    return {
      canvas,
    }
  }

  function draw() {
    const {
      nLines,
      lineSpacing,
      strokeWeight,
      blendMode,
      debug,
    } = controlPanel.values()
    p.blendMode(p[blendMode])
    p.background(1, 0.02, 1)
    p.fill(0)
    p.stroke(0)
    p.strokeWeight(strokeWeight)

    for (let y = 0, i = 0; y < h; y += h / nLines, i++) {
      drawLine({
        x: 0,
        y: y + lineSpacing * (isEven(i) ? 1 : -1),
        length: w,
      })
    }

    if (debug) {
      p.stroke(0.5, 1, 1, 0.5)
      p.strokeWeight(3)
      drawLine(0, h / 2, w / 2)
    }
  }

  function drawLine({ x: lineX, y: lineY, length }) {
    // < or <= ?
    for (let x = lineX; x <= lineX + length; x++) {
      p.point(x, lineY)
    }
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
