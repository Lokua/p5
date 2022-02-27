import { cross, isEven, times } from '../util.mjs'

export default function (p) {
  const [w, h] = [500, 500]
  const alphaToss = () => p.random([255, 127, 63])
  const fillAlpha = 12
  let n = 0

  function setup() {
    const canvas = p.createCanvas(w, h)
    p.noLoop()

    return {
      canvas,
    }
  }

  function draw() {
    p.background(255)
    p.ellipseMode(p.CENTER)
    p.rectMode(p.CENTER)
    p.noiseSeed(n)

    const d = Math.floor(w / 16)

    times(d, (x) => {
      times(d, (y) => {
        const rgb = [
          p.random([0, 76]),
          p.noise(x) * 127,
          100,
        ]
        p.fill(...rgb, fillAlpha)
        p.stroke(...rgb, alphaToss())
        p.strokeWeight(2)
        const shape = (isEven(x) ? p.rect : p.ellipse).bind(
          p,
        )
        const minSize = d * 2
        shape(
          x * d,
          y * d,
          p.noise(x * y) * minSize,
          p.noise(x * y) * minSize,
        )

        times(2, (z) => {
          const rgb = [
            p.random([0, 100]),
            p.noise(z) * 200,
            p.random([100, 90, 80]),
          ]
          p.fill(...rgb, fillAlpha)
          p.stroke(...rgb, alphaToss())
          p.strokeWeight(4)
          const zSize = p.noise(x * y * z) * minSize
          shape(x * d, y * d, zSize, zSize)
        })
      })
    })

    n++
  }

  return {
    setup,
    draw,
    metadata: {
      name: 'grid',
    },
  }
}
