import ControlPanel, {
  Range,
  Toggle,
  createBlendMode,
} from '../ControlPanel/index.mjs'

export default function lines(p) {
  const [w, h] = [500, 500]

  const metadata = {
    name: 'lineStudy4',
  }

  const controlPanel = new ControlPanel({
    id: metadata.name,
    attemptReload: true,
    controls: {
      nLines: new Range({
        name: 'nLines',
        value: 8,
        min: 2,
        max: 100,
        step: 2,
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
      strokeWeight,
      blendMode,
      debug,
    } = controlPanel.values()
    p.blendMode(p[blendMode])
    p.background(1, 0.02, 1)
    p.fill(0)
    p.strokeWeight(strokeWeight)

    drawLines({
      nLines,
      debug,
      color: p.color(1, 1, 0.5),
    })

    p.push()
    p.translate(w, 0)
    p.rotate(p.PI / 2)
    drawLines({
      nLines,
      debug,
      color: p.color(0.5, 1, 0.5),
    })
    p.pop()
  }

  function drawLines({
    nLines,
    debug,
    color = p.color(0),
  }) {
    for (let y = 0, i = 0; y < h; y += h / nLines, i++) {
      if (i !== 0) {
        p.stroke(color)
        drawLine({
          x: 0,
          y,
          length: w,
        })
      }
    }

    if (debug) {
      p.stroke(0.5, 1, 1, 0.5)
      p.strokeWeight(3)
      drawLine({
        x: 0,
        y: h / 2,
        length: w / 2,
      })
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
