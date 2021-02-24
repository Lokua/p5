import { p5Utils, mapTimes } from './util.mjs'

export default function (p) {
  const { randomBool } = p5Utils(p)
  const canvasSize = 500

  function setup() {
    const canvas = p.createCanvas(canvasSize, canvasSize)
    p.noLoop()

    return {
      canvas,
    }
  }

  function draw() {
    p.background(255)
    p.ellipseMode(p.CENTER)
    p.noStroke()

    mapTimes(canvasSize, (i) => {
      const rColor = () => p.random(128, 200)

      p.fill(
        rColor(),
        randomBool() ? 100 : rColor(),
        randomBool() ? 200 : rColor(),
      )

      const x = p.random(canvasSize)
      const y = p.random(canvasSize)
      const size = p.random(2, i % 40)
      p.ellipse(x, y, size, size)
      p.ellipse(y, x, size / 2, size / 2)
    })
  }

  return {
    setup,
    draw,
  }
}
