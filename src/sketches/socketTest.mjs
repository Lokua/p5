import getSocket from '../socket.mjs'
import Deltas from '../Deltas.mjs'
import bus from '../bus.mjs'
import { linearScale } from '../util.mjs'

export default function socketTest(p) {
  const [w, h] = [500, 500]
  const listSize = 16
  const padding = w / 8
  const deltas = new Deltas(listSize)
  const scaleY = linearScale([0, 1], [0, h])
  const scaleC = linearScale([1, listSize], [1, 100])

  bus.on('debug', () => {
    console.log('deltas:', deltas.getValues())
  })

  function setup() {
    const canvas = p.createCanvas(w, h)

    getSocket().on('snapshot', (data) => {
      deltas.push(data)
    })

    p.rectMode(p.CENTER)
    p.noStroke()

    return {
      canvas,
    }
  }

  function draw() {
    p.background(255)
    p.fill(0)
    for (let i = 0; i < listSize; i++) {
      const y = scaleY(deltas.get(i))
      const c = scaleC(i)
      p.fill(0, 0, c / 2, c)
      p.rect(w / 2, y, w - padding * 2, 4)
    }
  }

  return {
    setup,
    draw,
    metadata: {
      name: 'socketTest',
    },
  }
}
