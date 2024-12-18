// https://thecodingtrain.com/challenges/50-animated-circle-packing
import chroma from 'chroma-js'
import ControlPanel, { Range, Select } from '../lib/ControlPanel/index.mjs'

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const metadata = {
    name: 'circlePacking',
    frameRate: 30,
    pixelDensity: 6,
  }

  const [w, h] = [500, 500]

  const scales = {
    PiYG: chroma.scale('PiYG'),
    cmk: chroma.scale(['cyan', 'magenta', 'black']),
  }

  const schemes = {
    PiYG: () => scales.PiYG(p.random()).rgba(),
    black: () => 'black',
    cmk: () => scales.cmk(p.random()).rgba(),
  }

  const controlPanel = new ControlPanel({
    p,
    id: metadata.name,
    autoRedraw: false,
    controls: {
      colorScheme: new Select({
        name: 'colorScheme',
        value: 'rgb',
        options: Object.keys(schemes),
      }),
      mode: new Select({
        name: 'mode',
        value: 'stroke',
        options: ['fill', 'stroke'],
      }),
      minRadius: new Range({
        name: 'minRadius',
        value: 2,
        min: 2,
        max: 100,
      }),
      total: new Range({
        name: 'total',
        value: 5,
        min: 1,
        max: 50,
      }),
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    p.colorMode(p.RGB, 255, 255, 255, 1)

    return {
      canvas,
    }
  }

  let done = false

  function draw() {
    if (!done) {
      done = drawCircles()
    } else {
      console.log('Done.')
      p.noLoop()
    }
  }

  const buffer = 1
  const circles = []

  function drawCircles() {
    const { colorScheme, mode, minRadius, total } = controlPanel.values()
    p.background(255)

    let count = 0
    const maxFailedAttempts = 1000
    let failedAttempts = 0
    let finished = false

    while (count < total) {
      let valid = true
      const x = p.random(0, w)
      const y = p.random(0, h)

      for (let i = 0; i < circles.length; i++) {
        const circle = circles[i]
        const d = p.dist(x, y, circle.x, circle.y)
        if (d < circle.r + minRadius + buffer) {
          valid = false
          break
        }
      }

      if (valid) {
        const circle = new Circle(x, y, schemes[colorScheme](), mode, minRadius)
        circles.push(circle)
        count++
      } else {
        failedAttempts++
        if (failedAttempts > maxFailedAttempts) {
          finished = true
          break
        }
      }
    }

    for (let i = 0; i < circles.length; i++) {
      const circle = circles[i]
      if (circle.growing) {
        if (circle.isWithinBoundaries()) {
          for (let j = 0; j < circles.length; j++) {
            const other = circles[j]
            if (circle !== other) {
              const distance = p.dist(circle.x, circle.y, other.x, other.y)
              const combinedRadii = circle.r + other.r + buffer
              if (distance < combinedRadii) {
                circle.growing = false
                break
              }
            }
          }
        } else {
          circle.growing = false
        }
      }
      circle.show()
      circle.grow()
    }

    return finished
  }

  class Circle {
    constructor(x, y, color, mode, minRadius) {
      this.x = x
      this.y = y
      this.r = minRadius
      this.growing = true
      this.color = color
      this.strokeWeight = 1
      this.mode = mode
    }
    grow() {
      if (this.growing) {
        this.r += 1
      }
    }
    show() {
      if (this.mode === 'stroke') {
        p.noFill()
        p.strokeWeight(this.strokeWeight)
        p.stroke(this.color)
      } else {
        p.noStroke()
        p.fill(this.color)
      }
      p.circle(this.x, this.y, this.r * 2)
    }
    isWithinBoundaries() {
      return (
        this.x - this.r > 0 &&
        this.x + this.r < w &&
        this.y - this.r > 0 &&
        this.y + this.r < h
      )
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
