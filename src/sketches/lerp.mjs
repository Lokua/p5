import ControlPanel, {
  Range,
} from '../ControlPanel/index.mjs'
import { mapTimes } from '../util.mjs'

export default function lerp(p) {
  const [w, h] = [500, 500]

  const randoms = mapTimes(w * h, () => p.random(10))

  let n = 0

  const controlPanel = new ControlPanel({
    id: 'lerp',
    attemptReload: true,
    controls: {
      nLines: new Range({
        name: 'nLines',
        value: 100,
        min: 3,
        max: 100,
      }),
      pointSize: new Range({
        name: 'pointSize',
        value: 1,
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

    return {
      canvas,
    }
  }

  function draw() {
    const { nLines, pointSize } = controlPanel.values()

    p.background(0.5, 0.05, 1)
    p.fill(0)

    for (let y = 0; y < h; y += Math.floor(h / nLines)) {
      drawLine(0, y, w, n, pointSize)
    }

    n = (n + 1) % Number.MAX_SAFE_INTEGER
  }

  function drawLine(
    lineX,
    lineY,
    length,
    yNoiseRange,
    pointSize,
  ) {
    for (let x = lineX; x < lineX + length; x++) {
      const r = randoms[lineY * x]
      const noiseForY = p.noise(x % r)
      let y = lineY + noiseForY * yNoiseRange
      p.stroke(
        p.lerp(p.noise(lineY * r), 0.75, 0.2),
        1,
        0.8,
      )
      p.strokeWeight(Math.floor(r / 3) + pointSize)
      p.point(x, y % h)
    }
  }

  return {
    setup,
    draw,
    destroy() {
      controlPanel.destroy()
    },
    metadata: {
      name: 'lerp',
    },
  }
}
