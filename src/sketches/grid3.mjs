import { fromXY } from '../util.mjs'

export default function (p) {
  const [w, h] = [500, 500]
  const metadata = {
    name: 'grid3',
  }

  function setup() {
    const canvas = p.createCanvas(w, h)

    p.noLoop()
    p.rectMode(p.CORNER)
    p.noiseSeed(14)

    return {
      canvas,
    }
  }

  function draw() {
    p.background(0)
    p.rectMode(p.CENTER)

    p.translate(-5, 4)

    const n = Math.floor(w / 20)

    for (let x = n; x < w; x += n) {
      for (let y = n; y < h; y += n) {
        const index = fromXY(w, x, y)
        const rb = Boolean(p.noise(x, y) > 0.5)

        p.stroke(0)
        p.strokeWeight(rb ? 1 : rb ? 3 : 4)
        const hn = n / 2 - 4
        const r = () => p.noise(index) * hn
        p.fill(255)
        const rect2 = [x + r(), y - r(), r() * 2, r() * 2]
        p.rect(...rect2)

        p.noFill()
        p.stroke(255)
        p.strokeWeight(1)
        p.rect(
          rect2[0] + p.noise(index) * 4 * (rb ? 1 : -1),
          rect2[1],
          rect2[2] + 12,
          rect2[3] + rb ? 12 : -12,
        )
      }
    }
    p.resetMatrix()
  }

  return {
    setup,
    draw,
    metadata,
  }
}
