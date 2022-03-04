import ControlPanel, {
  Range,
} from '../ControlPanel/index.mjs'
import {
  createQuintants,
  times,
  setAlpha,
} from '../util.mjs'

export default function grid4(p) {
  const [w, h] = [500, 500]

  const controlPanel = new ControlPanel({
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
    },
    inputHandler() {
      !p.isLooping() && draw()
    },
  })

  const color1 = () =>
    p.color(0, p.random(127), p.random(255), 10)
  const color2 = () =>
    p.color(p.random(255), p.random(127), 0, 10)
  const colors = [color1, color2]

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)
    p.noLoop()
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
  }

  function rocket(x, y) {
    const {
      count,
      offset,
      size,
      rotations,
    } = controlPanel.values()

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
          size,
          offset,
        })
        p.pop()
      })
      p.pop()

      times(rotations, (i) => {
        p.push()
        p.rotate((p.TWO_PI * i) / rotations)
        burst({
          count,
          size,
          offset,
        })
        p.pop()
      })
      p.pop()
    })
  }

  function burst({ count, size, offset }) {
    p.noStroke()
    p.noiseSeed(p.random(1, 100))

    for (let i = 0; i < count; i++) {
      const color = colors[i % colors.length]()
      p.stroke(setAlpha(color, 20))
      p.fill(color)
      const r = () => p.noise(i) * p.random(1, 10)
      p.triangle(
        0,
        offset + r(),
        offset,
        offset + r(),
        size,
        size,
      )
    }
  }

  return {
    setup,
    draw,
    destroy() {
      controlPanel.destroy()
    },
    metadata: {
      name: 'burst3',
    },
  }
}
