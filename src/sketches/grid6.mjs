import ControlPanel, {
  Range,
} from '../ControlPanel/index.mjs'
import { fromXY, isPrime } from '../util.mjs'

export default function (p) {
  const [w, h] = [500, 500]
  const metadata = {
    name: 'grid6',
  }

  let counter = Number.MAX_SAFE_INTEGER

  const controlPanel = new ControlPanel({
    id: metadata.name,
    attemptReload: true,
    controls: {
      offset: new Range({
        name: 'offset',
        value: 0,
        min: 0,
        max: 1000,
      }),
    },
    inputHandler() {
      !p.isLooping() && draw()
    },
  })

  function setup() {
    const canvas = p.createCanvas(w, h)
    controlPanel.init()

    p.rectMode(p.CENTER)

    return {
      canvas,
    }
  }

  function draw() {
    p.background(230, 240, 240)

    p.push()
    p.scale(0.5)
    render()
    p.pop()

    p.push()
    p.scale(0.5)
    p.translate(w, 0)
    render()
    p.pop()

    p.push()
    p.scale(0.5)
    p.translate(0, h)
    render()
    p.pop()

    p.push()
    p.scale(0.5)
    p.translate(w, h)
    render()
    p.pop()
  }

  function render() {
    const n = Math.floor(w / 20)
    for (let x = n, i = 0; x < w; x += n, i++) {
      for (let y = n, j = 0; y < h; y += n, j++) {
        const index = fromXY(i, j, w)
        const offs = p.noise(i, j) * p.frameCount + counter
        const size = isPrime(index) ? n * 2 : n
        p.stroke(128)
        p.fill(255)
        if (isPrime(index)) {
          p.fill(200)
        }
        if (index % 3 === 0) {
          p.fill(210, 255, 240)
        }
        p.rect((x + offs) % w, (y + offs) % h, size, size)
      }
    }
    if (p.frameCount % 10 === 0) {
      counter--
    }
  }

  return {
    setup,
    draw,
    metadata,
  }
}
