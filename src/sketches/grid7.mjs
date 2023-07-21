import ControlPanel, {
  Range,
} from '../ControlPanel/index.mjs'
import { fromXY, isPrime, isEven } from '../util.mjs'

export default function (p) {
  const [w, h] = [500, 500]
  const metadata = {
    name: 'grid7',
  }

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
      mod: new Range({
        name: 'mod',
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
    const canvas = p.createCanvas(w, h)
    controlPanel.init()

    p.rectMode(p.CENTER)

    return {
      canvas,
    }
  }

  function draw() {
    p.background(230, 240, 240)

    const n = Math.floor(w / 20)
    for (let x = n, i = 0; x < w; x += n, i++) {
      for (let y = n, j = 0; y < h; y += n, j++) {
        const index = fromXY(i, j, w)
        const offs = p.noise(i, j)
        const size = index % n
        p.rect((x + offs) % w, (y + offs) % h, size, size)
      }
    }
  }

  return {
    setup,
    draw,
    metadata,
  }
}
