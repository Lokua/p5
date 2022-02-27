import { mapTimes } from '../util.mjs'

export default function (p) {
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

    p.background(0)
    p.strokeWeight(2)
    p.rectMode(p.CENTER)
    p.noFill()

    const topLeft = (i) => {
      const size = 10 * i
      p.stroke(100, 0, 200 - i * 4)
      p.rect(w / 4, h / 4, size, size)
    }
    const topRight = (i) => {
      const size = 10 * i
      p.stroke(0, 100, 200 - i * 4)
      p.rect(w / 2 + w / 4, h / 4, size, size)
    }
    const bottomLeft = (i) => {
      const size = 10 * i
      p.stroke(0, 100, 200 - i * 4)
      p.rect(w / 4, h / 2 + h / 4, size, size)
    }
    const bottomRight = (i) => {
      const size = 10 * i
      p.stroke(100, 0, 200 - i * 4)
      p.rect(w / 2 + w / 4, h / 2 + h / 4, size, size)
    }

    mapTimes(26, (i) => {
      topLeft(i)
      topRight(i)
      bottomLeft(i)
      bottomRight(i)
    })
  }

  return {
    setup,
    draw,
    metadata: {
      name: 'rects',
    },
  }
}
