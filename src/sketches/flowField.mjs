import chroma from 'chroma-js'
import { createControlPanel } from '../lib/ControlPanel/index.mjs'
import AnimationHelper from '../lib/AnimationHelper.mjs'
import { renderSwatches } from '../lib/colors.mjs'
import { onScreen } from '../util.mjs'

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const metadata = {
    name: 'flowField',
    frameRate: 30,
    pixelDensity: 6,
  }
  const [w, h] = [500, 500]
  const center = p.createVector(w / 2, h / 2)
  const obstacles = []
  const particles = []
  let particleBuffer
  const resolution = 50
  const cols = Math.floor(w / resolution)
  const rows = Math.floor(h / resolution)
  const flowField = []

  const colorScale = chroma.scale('Spectral')
  const ah = new AnimationHelper({ p, frameRate: metadata.frameRate, bpm: 130 })

  const controlPanel = createControlPanel({
    p,
    id: metadata.name,
    controls: [
      {
        type: 'Range',
        name: 'count',
        value: 100,
        min: 1,
        max: 10_000,
      },
      {
        type: 'Range',
        name: 'backgroundAlpha',
        value: 0.62,
        min: 0,
        max: 1,
        step: 0.001,
      },
      {
        type: 'Range',
        name: 'noiseScale',
        value: 0.0001,
        min: 0.0001,
        max: 1,
        step: 0.0001,
      },
      {
        type: 'Range',
        name: 'history',
        value: 4,
        min: 0,
        max: 20,
        step: 1,
      },
      {
        type: 'Select',
        name: 'edgeMode',
        value: 'wrap',
        options: ['wrap', 'respawn'],
      },
      {
        type: 'Checkbox',
        name: 'showParticles',
        value: true,
      },
      {
        type: 'Checkbox',
        name: 'showSwatches',
        value: false,
      },
      {
        type: 'Checkbox',
        name: 'visualizeField',
        value: false,
      },
      {
        type: 'Checkbox',
        name: 'useGridField',
        value: false,
      },
      {
        type: 'Checkbox',
        name: 'showObstacles',
        value: false,
      },
      {
        type: 'Checkbox',
        name: 'applyRandomForce',
        value: false,
      },
    ],
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)
    p.colorMode(p.RGB, 255, 255, 255, 1)
    p.randomSeed(39)
    p.noiseSeed(39)
    particleBuffer = p.createGraphics(w, h)
    particleBuffer.colorMode(p.RGB, 255, 255, 255, 1)

    updateFlowField()
    obstacles.push(new Obstacle(center.x, center.y, 100, 100))

    return {
      canvas,
    }
  }

  function draw() {
    const {
      count,
      showSwatches,
      visualizeField,
      backgroundAlpha,
      edgeMode,
      noiseScale,
      applyRandomForce,
      showParticles,
      showObstacles,
      useGridField,
      history,
    } = controlPanel.values()

    p.background(0)
    particleBuffer.background(chroma('black').alpha(backgroundAlpha).rgba())

    if (showObstacles) {
      for (const obstacle of obstacles) {
        obstacle.display()
      }
    }

    if (particles.length < count) {
      while (particles.length < count) {
        let position
        while (!position) {
          position = p.createVector(p.random(w), p.random(h))
          if (showObstacles) {
            for (const obstacle of obstacles) {
              if (obstacle.contains({ position })) {
                position = null
              }
            }
          }
        }
        particles.push(
          new Particle({
            position,
            edgeMode,
            applyRandomForce,
            maxHistory: history,
          }),
        )
      }
    } else if (particles.length > count) {
      particles.splice(count, particles.length - count)
    }

    particles.forEach((particle) => {
      particle.edgeMode = edgeMode
      particle.applyRandomForce = applyRandomForce
      particle.maxHistory = history
    })

    useGridField && updateFlowField()

    for (const particle of particles) {
      if (showObstacles) {
        for (const obstacle of obstacles) {
          if (obstacle.contains(particle)) {
            particle.velocity.mult(-1)
          }
        }
      }

      particle.applyForce(
        getFlowForce(particle.position, noiseScale, useGridField),
      )
      particle.update()
      particle.edges()
      particle.display()
    }

    showParticles && p.image(particleBuffer, 0, 0, w, h)
    visualizeField && visualizeFlowField(noiseScale, useGridField)
    showSwatches && renderSwatches({ p, w, scales: [colorScale] })
  }

  function updateFlowField() {
    const zOffset = ah.getTotalBeatsElapsed()

    const totalGridWidth = cols * resolution
    const totalGridHeight = rows * resolution
    const xOffset = (w - totalGridWidth) / 2
    const yOffset = (h - totalGridHeight) / 2

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const index = x + y * cols
        const noiseScale = 0.1

        const gridPosX = x * resolution + xOffset + resolution / 2
        const gridPosY = y * resolution + yOffset + resolution / 2

        const nx = (gridPosX - w / 2) * noiseScale
        const ny = (gridPosY - h / 2) * noiseScale

        const value = p.noise(nx, ny, zOffset)
        const angle = p.map(value, 0, 1, 0, p.TWO_PI)
        const force = p5.Vector.fromAngle(angle)
        force.setMag(0.1)
        flowField[index] = force
      }
    }
  }

  function getFlowForce(position, noiseScale, useGridField) {
    if (useGridField) {
      // Calculate offsets to center the grid
      const totalGridWidth = cols * resolution
      const totalGridHeight = rows * resolution
      const xOffset = (w - totalGridWidth) / 2
      const yOffset = (h - totalGridHeight) / 2

      // Adjust position by subtracting offsets
      const adjustedX = position.x - xOffset
      const adjustedY = position.y - yOffset

      const x = Math.floor(adjustedX / resolution)
      const y = Math.floor(adjustedY / resolution)

      // Ensure indices are within bounds
      if (x < 0 || x >= cols || y < 0 || y >= rows) {
        return p5.Vector.mult(p.createVector(0, 0), 0)
      }

      const index = x + y * cols
      const force = flowField[index].copy()
      return force
    }

    const zOffset = ah.getTotalBeatsElapsed()
    const x = position.x * noiseScale
    const y = position.y * noiseScale
    const value = p.noise(x, y, zOffset)
    const angle = p.map(value, 0, 1, 0, p.TWO_PI)
    const force = p5.Vector.fromAngle(angle)
    force.setMag(0.1)
    return force
  }

  function visualizeFlowField(noiseScale, useGridField) {
    const useAngleBasedColor = false
    const baseColor = chroma('magenta').rgba()

    const totalGridWidth = cols * resolution
    const totalGridHeight = rows * resolution
    const xOffset = (w - totalGridWidth) / 2
    const yOffset = (h - totalGridHeight) / 2

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const position = p.createVector(
          x * resolution + xOffset + resolution / 2,
          y * resolution + yOffset + resolution / 2,
        )

        const force = getFlowForce(position, noiseScale, useGridField)
        const scaledForce = p5.Vector.mult(force, resolution * 2)

        const angle = force.heading()
        const angleOffset = p.radians(30)
        const arrowSize = 5

        const color = useAngleBasedColor
          ? chroma.hsv(p.degrees(angle) % 360, 100, 100).rgba()
          : baseColor

        const arrowTip = p5.Vector.add(position, scaledForce)
        const arrowBase = p5.Vector.sub(
          arrowTip,
          p5.Vector.mult(force, arrowSize),
        )

        p.stroke(color)
        p.strokeWeight(1)
        p.line(position.x, position.y, arrowBase.x, arrowBase.y)

        const x1 = arrowTip.x - arrowSize * p.cos(angle - angleOffset)
        const y1 = arrowTip.y - arrowSize * p.sin(angle - angleOffset)
        const x2 = arrowTip.x - arrowSize * p.cos(angle + angleOffset)
        const y2 = arrowTip.y - arrowSize * p.sin(angle + angleOffset)

        p.noStroke()
        p.fill(color)
        p.triangle(arrowTip.x, arrowTip.y, x1, y1, x2, y2)
      }
    }
  }

  class Particle {
    constructor({
      position,
      edgeMode = 'wrap',
      opacity = 0,
      applyRandomForce = false,
      maxHistory = 5,
    }) {
      this.position = position.copy()
      this.velocity = p.createVector(0, 0)
      this.acceleration = p.createVector(0, 0)
      this.maxSpeed = p.random(1, 5)
      this.color = colorScale(p.random())
      this.edgeMode = edgeMode
      this.useVelocityBasedColorScaling = false
      this.applyRandomForce = applyRandomForce
      this.opacity = opacity
      this.diameter = p.random(0.25, 3)
      this.history = []
      this.maxHistory = maxHistory
      this.lifespan = 255
    }

    applyForce(force) {
      this.acceleration.add(force)
    }

    update() {
      this.history.unshift(this.position.copy())

      this.velocity.add(this.acceleration)
      this.velocity.limit(this.maxSpeed)
      this.position.add(this.velocity)
      this.acceleration.mult(0)
      this.lifespan -= 2

      if (this.opacity < 1) {
        this.opacity = p.constrain(this.opacity + 0.01, 0, 1)
      }

      if (this.applyRandomForce) {
        const randomForce = p5.Vector.random2D()
        randomForce.setMag(0.05)
        this.applyForce(randomForce)
      }

      const maxIndex = this.maxHistory - 1
      if (this.history.length > maxIndex) {
        while (this.history.length > maxIndex) {
          this.history.pop()
        }
      }
    }

    display() {
      particleBuffer.noStroke()

      // TODO: this is broken now that we have history
      // Keeping this here to remind me it could be cool
      if (this.useVelocityBasedColorScaling) {
        const speed = this.velocity.mag()
        const color = colorScale(speed / this.maxSpeed)
          .alpha(this.opacity)
          .rgba()
        particleBuffer.fill(color)
        particleBuffer.stroke(color)
      } else {
        const color = this.color.alpha(this.opacity).rgba()
        particleBuffer.fill(color)
        particleBuffer.stroke(color)
      }

      let prev = this.position
      for (const [index, position] of this.history.entries()) {
        const distance = p.dist(position.x, position.y, prev.x, prev.y)
        const threshold = Math.min(w, h) / 2
        if (distance < threshold) {
          const value = this.maxHistory - index
          const opacity = p.map(value, 0, this.maxHistory, 0, this.opacity)
          particleBuffer.stroke(this.color.alpha(opacity).rgba())
          particleBuffer.line(prev.x, prev.y, position.x, position.y)
        }
        prev = position
      }

      particleBuffer.circle(this.position.x, this.position.y, this.diameter)
    }

    isDead() {
      return this.lifespan < 0
    }

    edges() {
      if (this.edgeMode === 'wrap') {
        this.position.x > w && (this.position.x = 0)
        this.position.x < 0 && (this.position.x = w)
        this.position.y > h && (this.position.y = 0)
        this.position.y < 0 && (this.position.y = h)
      } else if (this.edgeMode === 'respawn') {
        if (!this.onScreen()) {
          this.position = p.createVector(p.random(w), p.random(h))
          this.opacity = 0
        }
      }
    }

    onScreen() {
      return onScreen(this.position, w, h)
    }

    reset() {
      this.position = p.createVector(p.random(w), p.random(h))
      this.lifespan = 255
      this.velocity.mult(0)
      this.opacity = 0
    }
  }

  class Obstacle {
    constructor(x, y, w, h) {
      this.position = p.createVector(x, y)
      this.w = w
      this.h = h
    }

    display() {
      p.fill('black')
      p.noStroke()
      p.rectMode(p.CENTER)
      p.rect(this.position.x, this.position.y, this.w, this.h)
    }

    contains(particle) {
      return (
        particle.position.x > this.position.x - this.w / 2 &&
        particle.position.x < this.position.x + this.w / 2 &&
        particle.position.y > this.position.y - this.h / 2 &&
        particle.position.y < this.position.y + this.h / 2
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
