import ControlPanel, {
  Range,
  createBlendMode,
} from '../ControlPanel/index.mjs'
import { isEven } from '../util.mjs'

/* @see https://processing.org/examples/sinewave.html */

export default function (p) {
  const [w, h] = [500, 500]
  let xx = 0

  const metadata = {
    name: 'sin3',
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
      amplitude: new Range({
        name: 'amplitude',
        value: 100,
        min: 0,
        max: h / 2,
      }),
      frameRate: new Range({
        name: 'frameRate',
        value: 30,
        min: 1,
        max: 30,
      }),
      blendMode: createBlendMode(),
    },
    inputHandler() {
      !p.isLooping() && draw()
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    p.ellipseMode(p.CENTER)
    p.noLoop()

    return {
      canvas,
    }
  }

  function draw() {
    const {
      size,
      period,
      amplitude,
      frameRate,
      blendMode,
    } = controlPanel.controls
    p.clear()
    p.background(0)
    p.frameRate(frameRate.value)
    p.blendMode(p[blendMode] || p.BLEND)

    const n = Math.floor(w / size.value)
    const dx = ((Math.PI * 2) / period.value) * n

    for (let x = -n; x < w - n; x += n) {
      const yCenter = h / 2
      const yOffset = p.sin(xx) * amplitude.value
      const vc = p.map(x, 0, w, 0, 127)
      p.fill(Math.abs(yOffset) + 10, vc, 100, 230)
      p.stroke(Math.abs(yOffset), vc, 50)
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
