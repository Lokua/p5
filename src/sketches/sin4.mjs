import ControlPanel, {
  Range,
} from '../ControlPanel/index.mjs'

/* @see https://processing.org/examples/sinewave.html */

export default function (p) {
  const [w, h] = [500, 500]

  const controlPanel = new ControlPanel({
    controls: {
      size: new Range({
        name: 'size',
        value: 100,
        min: 1,
        max: w,
        step: 1,
      }),
      period: new Range({
        name: 'period',
        value: 496,
        min: 2,
        max: 1000,
        step: 1,
      }),
      amplitude: new Range({
        name: 'amplitude',
        value: 100,
        min: 0,
        max: h / 2,
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
    p.noStroke()
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
    } = controlPanel.controls

    p.clear()
    p.background(0)

    const n = Math.floor(w / size.value)
    const dx = ((Math.PI * 2) / period.value) * n

    sineWave(w, h / 4, n, dx, amplitude.value)
    sineWave(w, h / 2, n, dx, amplitude.value)
    sineWave(w, h / 2 + h / 4, n, dx, amplitude.value)
  }

  function sineWave(w, yCenter, n, dx, amplitude) {
    for (let x = n, xx = 0; x < w; x += n) {
      const yOffset =
        p.sin(xx + p.noise(xx * p.random())) * amplitude
      p.fill(200, 0, Math.abs(yOffset) + 100)
      p.ellipse(x, yCenter + yOffset, n, n)
      xx += dx
    }
  }

  return {
    setup,
    draw,
    destroy() {
      controlPanel.destroy()
    },
    metadata: {
      name: 'sin4',
    },
  }
}
