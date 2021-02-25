import { cross, isEven, randomBool, times } from '../util.mjs'

export default function (p) {
  const [w, h] = [500, 500]

  function setup() {
    const canvas = p.createCanvas(w, h)
    p.noLoop()

    return {
      canvas,
    }
  }

  function draw() {
    p.background(255)
    p.rectMode(p.CENTER)

    const n = Math.floor(w / 20)

    for (let x = n; x < w; x += n) {
      for (let y = n; y < h; y += n) {
        p.stroke(0)
        p.rect(x, y, n, n)
        p.stroke(255, 0, 0)
        const hn = n / 2 - 4
        p.line(x - hn, y - hn, x + hn, y + hn)
        p.line(x + hn, y - hn, x - hn, y + hn)
      }
    }
  }

  return {
    setup,
    draw,
    metadata: {
      name: 'gridTemplate',
    },
  }
}
