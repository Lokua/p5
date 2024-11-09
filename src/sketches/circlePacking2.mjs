// https://thecodingtrain.com/challenges/50-animated-circle-packing
import chroma from 'chroma-js'
import ControlPanel, { Range, Select } from '../lib/ControlPanel/index.mjs'

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const metadata = {
    name: 'circlePacking2',
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
        value: 'cmk',
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
        min: 1,
        max: 100,
      }),
      total: new Range({
        name: 'total',
        value: 5,
        min: 1,
        max: 20,
      }),
    },
  })

  const circles = []
  const buffer = 1
  let done = false

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    p.colorMode(p.RGB, 255, 255, 255, 1)
    p.noLoop()

    console.group('Setup')
    console.time('Execution time')
    console.log('Creating circles')
    while (!done) {
      done = generateCircles()
    }
    console.log({ circles })
    console.log('Done')
    console.timeEnd('Execution time')
    console.groupEnd('Setup')

    return {
      canvas,
    }
  }

  function draw() {
    p.background(255)

    circles.forEach((circle) => {
      circle.show()
    })
  }

  function generateCircles() {
    const { colorScheme, mode, minRadius, total } = controlPanel.values()

    let count = 0
    const maxFailedAttempts = 10_000
    let failedAttempts = 0
    let finished = false
    const pad = 20
    const box = {
      x: pad,
      y: pad,
      w: w - pad * 2,
      h: h - pad * 2,
    }

    while (count < total) {
      let valid = true
      const x = p.random(box.x, box.x + box.w)
      const y = p.random(box.y, box.y + box.h)

      for (let i = 0; i < circles.length; i++) {
        const circle = circles[i]
        const d = p.dist(x, y, circle.x, circle.y)
        if (d < circle.r + minRadius + buffer) {
          valid = false
          break
        }
      }

      if (valid) {
        const color = schemes[colorScheme]()
        const circle = new Circle(x, y, color, mode, minRadius, box)
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
      circle.grow()
    }

    return finished
  }

  class Circle {
    constructor(x, y, color, mode, minRadius, box) {
      this.x = x
      this.y = y
      this.r = minRadius
      this.growing = true
      this.color = color
      this.strokeWeight = 1
      this.mode = mode
      this.box = box
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
      const { x, y, w, h } = this.box
      return (
        this.x - this.r > x &&
        this.x + this.r < x + w &&
        this.y - this.r > y &&
        this.y + this.r < y + h
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
