import ControlPanel, {
  Range,
} from '../ControlPanel/index.mjs'
// import Counter from '../Counter.mjs'
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
        min: 1,
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

    return {
      canvas,
    }
  }

  function draw() {
    const { nLines } = controlPanel.values()

    p.background(1, 0.02, 1)
    p.fill(0)

    for (let y = 0; y < h; y += Math.floor(h / nLines)) {
      drawLine(0, y, w, n)
    }

    n = (n + 1) % Number.MAX_SAFE_INTEGER
  }

  function drawLine(lineX, lineY, length, yNoiseRange) {
    for (let x = lineX; x < lineX + length; x++) {
      const r = randoms[lineY * x]
      const noiseForY = p.noise(x % r)
      let y = lineY + noiseForY * yNoiseRange

      p.stroke(p.noise(lineY * r), r / 10, p.noise(r * r))
      p.strokeWeight(Math.floor(r / 3))
      p.point(x, y % h)

      // p.stroke(p.noise(lineY * r), 0.1)
      // p.strokeWeight(Math.floor(r / 3) * 2)
      // p.point(x - 10, y % h)

      // p.strokeWeight(Math.floor(r / 3) * 2)
      // p.point(x + 10, y % h)
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
