import ControlPanel, { Range } from '../ControlPanel/index.mjs'
import Counter from '../Counter.mjs'
import { createQuintants, times } from '../util.mjs'

export default function (p) {
  const [w, h] = [500, 500]
  const metadata = {
    name: 'burst3Animation',
  }

  const max = 200
  const sizeCounter = new Counter({
    min: 1,
    max: max,
  })
  const offsetCounter = new Counter({
    min: 1,
    max: max,
    direction: -1,
  })

  const controlPanel = new ControlPanel({
    id: metadata.name,
    attemptReload: true,
    controls: {
      size: new Range({
        name: 'size',
        value: 50,
        min: 1,
        max: 500,
      }),
      offset: new Range({
        name: 'offset',
        value: 70,
        min: 1,
        max: 500,
      }),
      count: new Range({
        name: 'count',
        value: 20,
        min: 1,
        max: 500,
      }),
      rotations: new Range({
        name: 'rotations',
        value: 8,
        min: 1,
        max: 32,
      }),
      alpha: new Range({
        name: 'alpha',
        value: 30,
        min: 1,
        max: 255,
      }),
    },
    inputHandler() {
      !p.isLooping() && draw()
    },
  })

  const color1 = () =>
    p.color(0, p.random(100, 127), p.random(255), controlPanel.get('alpha'))
  const color2 = () =>
    p.color(p.random(200, 255), p.random(127), 0, controlPanel.get('alpha'))
  const colors = [color1, color2]

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    p.rectMode(p.CENTER)
    p.ellipseMode(p.CENTER)

    return {
      canvas,
    }
  }

  function pushPop(fn) {
    p.push()
    fn()
    p.pop()
  }

  function draw() {
    p.background(255)
    p.noiseSeed(p.random(100))

    pushPop(() => {
      rocket(4, 8)
    })
    pushPop(() => {
      p.translate(w / 2, 0)
      rocket(4, 8)
    })
    pushPop(() => {
      p.translate(0, h / 2)
      rocket(4, 8)
    })
    pushPop(() => {
      p.translate(w / 2, h / 2)
      rocket(4, 8)
    })
    pushPop(() => {
      rocket(2, 4)
    })

    sizeCounter.tick()
    offsetCounter.tick()
  }

  function rocket(x, y) {
    const { count, offset, size, rotations } = controlPanel.values()

    createQuintants(w, h, x, y).forEach(([x, y]) => {
      p.push()
      p.translate(x, y)

      p.push()
      p.scale(1.3, 1.3)
      times(rotations, (i) => {
        p.push()
        p.rotate((p.TWO_PI * i) / rotations)
        burst({
          count,
          size: size + sizeCounter.count,
          offset: offset + offsetCounter.count,
        })
        p.pop()
      })
      p.pop()

      times(rotations, (i) => {
        p.push()
        p.rotate((p.TWO_PI * i) / rotations)
        burst({
          count,
          size: size + sizeCounter.count,
          offset: offset + offsetCounter.count,
        })
        p.pop()
      })
      p.pop()
    })
  }

  function burst({ count, size, offset }) {
    p.noiseSeed(p.random(1, 100))

    for (let i = 0; i < count; i++) {
      p.stroke(colors[i % colors.length]())
      p.fill(255, 100)
      const r = () => p.noise(i) * p.random(1, 10)
      p.triangle(0, offset + r(), offset, offset + r(), size, size)
    }
  }

  return {
    setup,
    draw,
    destroy() {
      controlPanel.destroy()
    },
    metadata,
  }
}
