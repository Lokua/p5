import {
  arrayModLookup,
  fromXY,
  isEven,
  mapTimes,
  randomBool,
} from '../util.mjs'

export default function (p) {
  const [w, h] = [500, 500]
  const randomWeights = mapTimes(
    w * h,
    (n) => p.noise(n) * 5,
  )
  const randomBools = mapTimes(w * h, randomBool)

  function setup() {
    const canvas = p.createCanvas(w, h)
    p.frameRate(8)

    return {
      canvas,
    }
  }

  function draw() {
    p.background(255)
    p.rectMode(p.CENTER)
    p.noFill()

    const n = Math.floor(w / 20)

    for (let x = n; x < w; x += n) {
      for (let y = n; y < h; y += n) {
        const index = fromXY(w, x, y)
        p.stroke(0, 200)
        const weight = arrayModLookup(
          randomWeights,
          index + p.frameCount,
        )
        p.strokeWeight(weight)
        let hn = p.noise(n) * n
        if (isEven(x) && isEven(y)) {
          hn = hn * 3
          p.line(x - p.noise(x), y - p.noise(x) * n, x, y)
          p.line(x, y, x + p.noise(x), y + p.noise(y) * n)
        } else {
          p.line(
            x - hn - p.noise(x) * hn,
            y - hn - p.noise(x) * hn,
            x + hn,
            y + hn,
          )
          p.line(
            x + hn,
            y - hn,
            x - hn + p.noise(x) * hn,
            y + hn + p.noise(y) * hn,
          )
        }
      }
    }
  }

  return {
    setup,
    draw,
    metadata: {
      name: 'grid2',
    },
  }
}
