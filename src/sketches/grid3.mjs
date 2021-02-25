import { cross, isEven, randomBool, times } from '../util.mjs'

export default function grid3(p) {
  const [w, h] = [500, 500]

  function setup() {
    const canvas = p.createCanvas(w, h)
    p.noLoop()

    return {
      canvas,
    }
  }

  function draw() {
    p.background(0)
    p.rectMode(p.CENTER)
    p.noiseSeed(p.random(100))

    const n = Math.floor(w / 20)

    const rc = () => p.random(3, 5)

    for (let x = n; x < w; x += n) {
      for (let y = n; y < h; y += n) {
        const rb = () => Boolean(p.noise(x) > 0.5)
        p.stroke(0)
        p.strokeWeight(rb() ? 1 : rb() ? 3 : 4)
        const hn = n / 2 - 4
        const r = () => p.noise(hn * x * y) * hn
        p.fill(255)
        const rect1 = [x - r(), y - r(), r() * 2, r() * 2]
        const rect2 = [x + r(), y - r(), r() * 2, r() * 2]
        p.rect(...rect1)
        p.rect(...rect2)

        p.noFill()
        p.stroke(255)
        p.strokeWeight(1)
        p.rect(
          Math.max(rect1[0], rect2[0]),
          Math.max(rect1[1], rect2[1]),
          Math.max(rect1[2], rect2[2]) + 12,
          Math.max(rect1[3], rect2[3]) + 12,
        )
      }
    }
  }

  return {
    setup,
    draw,
    metadata: {
      name: 'grid3',
    },
  }
}
