import { mapTimes, randomBool } from '../util.mjs'

export default function sketch(p) {
  function setup() {
    const canvas = p.createCanvas(500, 500)
    p.noLoop()

    return {
      canvas,
    }
  }

  function draw() {
    const w = p.width
    const h = p.height

    p.background(255)
    p.ellipseMode(p.CENTER)
    p.noStroke()

    mapTimes(w * 2, (i) => {
      const rColor = () => p.random(128, 200)

      p.fill(
        rColor(),
        randomBool() ? 100 : rColor(),
        randomBool() ? 200 : rColor(),
      )

      const x = p.random(w)
      const y = p.random(h)
      const size = p.random(2, i % (w / 12))
      p.ellipse(x, y, size, size)
      p.ellipse(y, x, size / 2, size / 2)
    })
  }

  return {
    setup,
    draw,
    metadata: {
      name: 'sketch',
    },
  }
}
