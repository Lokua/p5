import { fromXY } from '../util.mjs'

export default function hsbStudy(p) {
  const [w, h] = [500, 500]
  const lastXY = fromXY(w, w, h)

  function setup() {
    const canvas = p.createCanvas(w, h)
    p.noLoop()
    p.rectMode(p.CENTER)
    p.colorMode(p.HSB, 360, 100, 100)

    return {
      canvas,
    }
  }

  function draw() {
    p.background(255)

    const n = Math.floor(w / 20)

    for (let x = n; x < w; x += n) {
      for (let y = n; y < h; y += n) {
        p.fill(
          p.map(fromXY(w, x, y), 0, lastXY, 0, 360),
          100,
          100,
        )
        p.rect(x, y, n, n)
      }
    }
  }

  return {
    setup,
    draw,
    metadata: {
      name: 'hsbStudy',
    },
  }
}
