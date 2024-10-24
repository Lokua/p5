// https://www.youtube.com/watch?v=MJNy2mdCt20&list=PLeCiJGCSl7jc5UWvIeyQAvmCNc47IuwkM&index=24

import ControlPanel from '../ControlPanel/index.mjs'

/**
 * @param {import("p5")} p
 */
export default function (p) {
  class Particle {
    constructor({ width, height, cellSize, flowField }) {
      this.width = width
      this.height = height
      this.x = p.floor(p.random(this.width))
      this.y = p.floor(p.random(this.height))
      this.maxLength = p.random(20, 200)
      this.angle = 0
      this.cellSize = cellSize
      this.flowField = flowField
      this.speedModifier = p.random(1, 4)
      this.timer = this.maxLength * 2
      this.history = [
        {
          x: this.x,
          y: this.y,
        },
      ]
    }

    update() {
      this.timer--
      if (this.timer >= 1) {
        const x = p.floor(this.x / this.cellSize)
        const y = p.floor(this.y / this.cellSize)
        const n = p.floor(this.width / this.cellSize)
        const index = y * n + x

        if (index >= 0 && index < this.flowField.length) {
          this.angle = this.flowField[index]
        }

        this.speedX = p.cos(this.angle)
        this.speedY = p.sin(this.angle)
        this.x += this.speedX * this.speedModifier
        this.y += this.speedY * this.speedModifier

        if (this.x > this.width || this.x < 0) {
          this.x = p.random(this.width)
        }
        if (this.y > this.height || this.y < 0) {
          this.y = p.random(this.height)
        }

        this.history.push({
          x: this.x,
          y: this.y,
        })
        if (this.history.length > this.maxLength) {
          this.history.shift()
        }
      } else if (this.history.length > 1) {
        this.history.shift()
      } else {
        this.reset()
      }
    }

    draw() {
      p.point(this.x, this.y)
      for (const particle of this.history) {
        if (!(isNaN(particle.x) || isNaN(particle.y))) {
          p.point(particle.x, particle.y)
        }
      }
    }

    reset() {
      this.x = p.floor(p.random(this.width))
      this.y = p.floor(p.random(this.height))
      this.history = [
        {
          x: this.x,
          y: this.y,
        },
      ]
      this.timer = this.maxLength * 2
      this.speedModifier = p.random(1, 4)
    }
  }

  const [w, h] = [500, 500]

  const metadata = {
    name: 'flowField7',
    frameRate: 30,
  }

  const particleCount = 1000
  const particles = []

  const cellSize = 10
  const flowField = []
  const curve = 10
  const zoom = 100

  const controlPanel = new ControlPanel({
    id: metadata.name,
    attemptReload: true,
    controls: {},
    inputHandler() {
      !p.isLooping() && draw()
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    p.colorMode(p.HSB, 100)

    const rows = p.floor(h / cellSize)
    const cols = p.floor(w / cellSize)
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const angle = (p.cos(x * zoom) + p.sin(y * zoom)) * curve
        flowField.push(angle)
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(
        new Particle({
          width: w,
          height: h,
          cellSize,
          flowField,
        }),
      )
    }

    return {
      canvas,
    }
  }

  function draw() {
    p.background(100, 70)
    p.stroke(0, 50)
    p.strokeWeight(1)

    for (let i = 0; i < particleCount; i++) {
      const particle = particles[i]
      particle.draw()
      particle.update()
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
