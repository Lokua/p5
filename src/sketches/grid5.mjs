import ControlPanel, { Range } from '../ControlPanel/index.mjs'
import { FRAMERATE_BPM_130, BidirectionalCounter } from '../util.mjs'
import Counter from '../Counter.mjs'

export default function grid5(p) {
  const [w, h] = [500, 500]
  const frameRate = FRAMERATE_BPM_130 * 2
  const strokeDeciders = []
  const fillDeciders = []
  const xCounter = new BidirectionalCounter(2, 24, 24)
  const yCounter = new BidirectionalCounter(2, 16, 16)

  const counterConfig = {
    min: 0,
    max: 255,
    step: 1,
  }
  const strokeMinCounter = new Counter(counterConfig)
  const strokeMaxCounter = new Counter(counterConfig)
  const fillMinCounter = new Counter(counterConfig)
  const fillMaxCounter = new Counter(counterConfig)
  let phaseIndex = 0
  const phases = [
    fillMaxCounter,
    strokeMaxCounter,
    strokeMinCounter,
    fillMaxCounter,
    strokeMaxCounter,
    fillMaxCounter,
    strokeMinCounter,
    fillMinCounter,
    strokeMaxCounter,
  ]

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
    const { count } = controlPanel.values()

    if (p.frameCount % 4 === 0) {
      p.background(0)

      const n = Math.floor(w / count)
      let i = 0

      for (let x = 0; x < w; x += n) {
        for (let y = 0; y < h; y += n) {
          strokeDeciders[i] < 0.3
            ? p.stroke(p.random(strokeMinCounter.count, strokeMaxCounter.count))
            : p.stroke(strokeMinCounter.count)

          fillDeciders[i] < 0.1
            ? p.fill(p.random(fillMinCounter.count, fillMaxCounter.count))
            : p.fill(fillMaxCounter.count)

          const rb = () => Boolean(p.noise(x) > 0.5)
          p.strokeWeight(rb() ? 1 : rb() ? 3 : 4)

          const hn = n / 2 - 4
          const r = () => p.noise(hn * x * y) * hn

          p.rect(x - r(), y - r(), r() * xCounter.count, r() * yCounter.count)

          i++

          xCounter.tick()
          yCounter.tick()
        }
      }
    }

    phases[phaseIndex].tick()

    if (p.frameCount % 255 === 0) {
      phaseIndex = (phaseIndex + 1) % phases.length
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
