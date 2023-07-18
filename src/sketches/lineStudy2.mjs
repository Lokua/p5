import ControlPanel, {
  Range,
  Toggle,
  createBlendMode,
} from '../ControlPanel/index.mjs'
import { isEven, mapTimes } from '../util.mjs'

export default function (p) {
  const [w, h] = [500, 500]

  const metadata = {
    name: 'lineStudy2',
  }

  const randomInts = mapTimes(100, (n) => p.noise(n) * 30)
  const noises = mapTimes(100, (n) => p.noise(n))

  const controlPanel = new ControlPanel({
    id: metadata.name,
    attemptReload: true,
    controls: {
      blendMode: createBlendMode(),
      debug: new Toggle({
        name: 'debug',
        value: false,
      }),
      nSegments: new Range({
        name: 'nSegments',
        value: 8,
        min: 1,
        max: 100,
        step: 1,
      }),
      strokeWeight: new Range({
        name: 'strokeWeight',
        value: 1,
        min: 1,
        max: 20,
      }),
      noise: new Range({
        name: 'noise',
        value: 0,
        min: 0,
        max: 100,
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
    p.strokeCap(p.PROJECT)

    return {
      canvas,
    }
  }

  function draw() {
    const {
      blendMode,
      strokeWeight,
      nSegments,
      noise,
    } = controlPanel.values()
    p.blendMode(p[blendMode])
    p.background(1, 0.04, 1)
    p.fill(0)
    p.strokeWeight(strokeWeight)

    const segmentLength = Math.floor(w / nSegments)
    for (let x = 0, i = 0; x < w; x += segmentLength, i++) {
      const even = isEven(i)
      p.stroke(even ? 0 : 0.75)
      const ii = even ? i : i - 1
      const y = h / 2
      const r = randomInts[ii] + noises[ii] * noise
      const pivot = y + r // `y - r` to point up
      const [y1, y2] = even ? [y, pivot] : [pivot, y]
      p.line(x, y1, x + segmentLength, y2)
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
