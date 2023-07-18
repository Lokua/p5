import ControlPanel, {
  Range,
  Toggle,
  createBlendMode,
} from '../ControlPanel/index.mjs'
import { isEven, mapTimes } from '../util.mjs'

export default function (p) {
  const [w, h] = [500, 500]

  const metadata = {
    name: 'lineStudy3',
  }

  const randomInts = mapTimes(1000, (n) => p.noise(n) * 30)
  const noises = mapTimes(1000, (n) => p.noise(n))

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

    drawLines({
      nSegments,
      noise,
    })

    p.push()
    p.translate(w, 0)
    p.rotate(p.PI / 2)
    drawLines({
      nSegments,
      noise,
    })
    p.pop()
  }

  function drawLines({ nSegments, noise }) {
    drawLine({
      nSegments,
      noise,
      y: h / 4,
    })
    drawLine({
      nSegments,
      noise,
      y: h / 4,
      up: true,
      iOffset: 3,
    })

    drawLine({
      nSegments,
      noise,
      y: h / 2,
      iOffset: 6,
    })
    drawLine({
      nSegments,
      noise,
      y: h / 2,
      up: true,
      iOffset: 9,
    })

    drawLine({
      nSegments,
      noise,
      y: h / 2 + h / 4,
      iOffset: 12,
    })
    drawLine({
      nSegments,
      noise,
      y: h / 2 + h / 4,
      up: true,
      iOffset: 15,
    })
  }

  function drawLine({
    nSegments,
    noise,
    y,
    iOffset = 0,
    up = false,
  }) {
    const segmentLength = Math.floor(w / nSegments)
    for (
      let x = 0, i = iOffset;
      x <= w;
      x += segmentLength, i++
    ) {
      const even = isEven(i)
      p.stroke(even ? 0 : 0.5)
      const ii = even ? i : i - 1
      const r =
        arrayModLookup(randomInts, ii) +
        arrayModLookup(noises, ii) * noise
      const pivot = up ? y - r : y + r
      const [y1, y2] = even ? [y, pivot] : [pivot, y]
      p.line(x, y1, x + segmentLength, y2)
    }
  }

  function arrayModLookup(array, index) {
    return array[index % array.length]
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
