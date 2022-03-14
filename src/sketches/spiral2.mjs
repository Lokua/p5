// code forked from https://editor.p5js.org/MaximSchoemaker/sketches/hSUoBvPJB
import ControlPanel, {
  Range,
} from '../ControlPanel/index.mjs'
import { FRAMERATE_BPM_130, PHI } from '../util.mjs'

export default function spiral2(p) {
  const [w, h] = [500, 500]
  const frameRate = FRAMERATE_BPM_130

  const controlPanel = new ControlPanel({
    controls: {
      count: new Range({
        name: 'count',
        value: 2000,
        min: 1,
        max: 5000,
      }),
      size: new Range({
        name: 'size',
        value: 0.5,
        min: 0,
        max: 1,
        step: 0.01,
      }),
      radius: new Range({
        name: 'radius',
        value: 1,
        min: 0,
        max: 1,
        step: 0.01,
      }),
      frame: new Range({
        name: 'frame',
        value: 300,
        min: 1,
        max: 1000,
      }),
    },
    inputHandler() {
      !p.isLooping() && draw()
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(500, 500)

    p.colorMode(p.HSB, 1)
    p.noStroke()
    p.frameRate(34.67)

    return {
      canvas,
      frameRate,
    }
  }

  function draw() {
    const {
      count,
      size,
      radius: radiusControl,
    } = controlPanel.values()

    p.push()
    p.scale(w, h)
    p.background(1, 0.02, 1)
    p.fill(1)

    const radius = Math.sqrt(radiusControl)
    const t = p.fract(p.frameCount / 500)

    for (let i = 1; i < count * invCosn(t); i++) {
      const f = i / count
      const angle = i * PHI
      const dist = f * radius

      const x = 0.5 + p.cos(angle * p.TWO_PI) * dist
      const y = 0.5 + p.sin(angle * p.TWO_PI) * dist

      const sig = p.pow(cosn(f - t), 2)
      const r = f * sig * size

      const hue = p.fract(t + f * 0.5)
      const sat = 1
      const light = 0.6 * sig + 0.25
      const color = p.color(hue, sat, light, 0.5)
      p.fill(color)

      p.circle(x, y, r)
    }

    p.pop()
  }

  function cosn(v) {
    return p.cos(v * p.TWO_PI) * 0.5 + 0.5
  }

  function invCosn(v) {
    return 1 - cosn(v)
  }

  return {
    setup,
    draw,
    destroy() {
      controlPanel.destroy()
    },
    metadata: {
      name: 'spiral2',
      frameRate,
    },
  }
}
