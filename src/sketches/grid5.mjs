import ControlPanel, {
  Range,
} from '../ControlPanel/index.mjs'
import {
  FRAMERATE_BPM_130,
  BidirectionalCounter,
} from '../util.mjs'

export default function grid5(p) {
  const [w, h] = [500, 500]
  const frameRate = FRAMERATE_BPM_130 / 4
  const strokeDeciders = []
  const fillDeciders = []
  const xCounter = new BidirectionalCounter(2, 24, 24)
  const yCounter = new BidirectionalCounter(2, 16, 16)

  const controlPanel = new ControlPanel({
    id: 'grid5',
    attemptReload: true,
    controls: {
      count: new Range({
        name: 'count',
        value: 38,
        min: 2,
        max: 64,
      }),
      strokeMin: new Range({
        name: 'strokeMin',
        value: 0,
        min: 0,
        max: 255,
      }),
      strokeMax: new Range({
        name: 'strokeMax',
        value: 255,
        min: 0,
        max: 255,
      }),
      fillMin: new Range({
        name: 'fillMin',
        value: 255,
        min: 0,
        max: 255,
      }),
      fillMax: new Range({
        name: 'fillMax',
        value: 255,
        min: 0,
        max: 255,
      }),
    },
    inputHandler() {
      !p.isLooping() && draw()
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    p.rectMode(p.CORNER)
    p.noiseSeed(9)
    p.frameRate(frameRate)

    const n = Math.floor(w / 38)
    for (let x = 0; x < w; x += n) {
      for (let y = 0; y < h; y += n) {
        strokeDeciders.push(p.random())
        fillDeciders.push(p.random())
      }
    }

    return {
      canvas,
    }
  }

  function draw() {
    const {
      count,
      strokeMin,
      strokeMax,
      fillMin,
      fillMax,
    } = controlPanel.values()
    p.background(0)

    const n = Math.floor(w / count)
    let i = 0

    for (let x = 0; x < w; x += n) {
      for (let y = 0; y < h; y += n) {
        strokeDeciders[i] < 0.3
          ? p.stroke(p.random(strokeMin, strokeMax))
          : p.stroke(strokeMin)

        fillDeciders[i] < 0.1
          ? p.fill(p.random(fillMin, fillMax))
          : p.fill(fillMax)

        const rb = () => Boolean(p.noise(x) > 0.5)
        p.strokeWeight(rb() ? 1 : rb() ? 3 : 4)

        const hn = n / 2 - 4
        const r = () => p.noise(hn * x * y) * hn

        p.rect(
          x - r(),
          y - r(),
          r() * xCounter.count,
          r() * yCounter.count,
        )

        i++

        xCounter.tick()
        yCounter.tick()
      }
    }
  }

  return {
    setup,
    draw,
    destroy() {
      controlPanel.destroy()
    },
    metadata: {
      name: 'grid5',
      frameRate,
    },
  }
}
