// https://www.youtube.com/watch?v=EYLWxwo1Ed8&list=WL&index=24&t=1120s
import ControlPanel, { Range } from '../ControlPanel/index.mjs'
import { isEven } from '../util.mjs'

export default function collatzSketch(p) {
  const [w, h] = [500, 500]

  const controlPanel = new ControlPanel({
    controls: {
      count: new Range({
        name: 'count',
        value: 3000,
        min: 1,
        max: 10000,
      }),
      angle: new Range({
        name: 'angle',
        value: 18,
        min: 1,
        max: 100,
      }),
      length: new Range({
        name: 'length',
        value: 6,
        min: 1,
        max: 100,
      }),
    },
    inputHandler() {
      !p.isLooping() && draw()
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    p.colorMode(p.HSB, 1)
    p.noLoop()

    return {
      canvas,
    }
  }

  function draw() {
    const { count, angle: a, length } = controlPanel.values()

    p.background(1)

    const angle = a * 0.01

    for (let i = 1; i < count; i++) {
      p.translate(w / 2, h)
      const sequence = []
      let n = i
      do {
        sequence.push(n)
        n = collatz(n)
      } while (n !== 1)
      sequence.push(1)
      sequence.reverse()

      p.resetMatrix()
      p.translate(w / 2, h)

      for (let j = 0; j < sequence.length; j++) {
        const v = sequence[j]
        p.stroke(0, 0.05)
        p.rotate(isEven(v) ? angle : -angle)
        p.line(0, 0, 0, -length)
        p.translate(0, -length)
        p.push()

        if (j % 3 === 0) {
          p.stroke(0, 0.1, 1, 0.1)
          p.rotate(angle / 2)
          p.push()
          p.line(0, 0, 0, -length * 5)
          p.pop()

          // p.stroke(0, 0.1, 1, 0.1)
          // p.rotate(-angle * 2)
          // p.push()
          // p.line(0, 0, 0, -length * 10)
          // p.pop()
        }
        p.pop()
      }
    }
  }

  function collatz(n) {
    return isEven(n) ? n / 2 : (n * 3 + 1) / 2
  }

  return {
    setup,
    draw,
    destroy() {
      controlPanel.destroy()
    },
    metadata: {
      name: 'collatz',
    },
  }
}
