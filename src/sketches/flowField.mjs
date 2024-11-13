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
  const attractors = []
  let blackHole
  let particleBuffer
  const resolution = 20
  const cols = Math.floor(w / resolution)
  const rows = Math.floor(h / resolution)
  const flowField = []

  const colorScale = chroma.scale(['navy', 'turquoise', 'purple', 'yellow'])
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
        name: 'history',
        value: 4,
        min: 1,
        max: 100,
        step: 1,
      },
      {
        type: 'Range',
        name: 'noiseScale',
        value: 0.0001,
        min: 0.0001,
        max: 0.05,
        step: 0.0001,
      },
      {
        type: 'Range',
        name: 'forceMagnitude',
        value: 0.1,
        min: 0.01,
        max: 1,
        step: 0.001,
      },
      {
        type: 'Range',
        name: 'zOffsetMultiplier',
        value: 0.01,
        min: 0.001,
        max: 1,
        step: 0.001,
      },
      {
        type: 'Range',
        name: 'angleOffset',
        value: 0,
        min: 0,
        max: 360,
        step: 1,
      },
      {
        type: 'Range',
        name: 'blackHoleStrength',
        value: 1000,
        min: 1,
        max: 10_000,
        step: 1,
      },
      {
        type: 'Range',
        name: 'attractorStrength',
        value: 1000,
        min: 0.1,
        max: 100,
        step: 0.1,
      },
      {
        type: 'Select',
        name: 'edgeMode',
        value: 'wrap',
        options: ['wrap', 'respawn'],
      },
      {
        type: 'Select',
        name: 'forceMode',
        value: 'grid',
        options: [
          'grid',
          'algorithmic',
          'combinedAdditive',
          'combinedAveraged',
        ],
      },
      {
        type: 'Checkbox',
        name: 'showParticles',
        value: true,
      },
      {
        type: 'Checkbox',
        name: 'applyRandomForce',
        value: false,
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
        name: 'showObstacles',
        value: false,
      },
      {
        type: 'Checkbox',
        name: 'showBlackHole',
        value: false,
      },
      {
        type: 'Checkbox',
        name: 'showAttractors',
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

    const { blackHoleStrength } = controlPanel.values()

    updateFlowField()
    initializeObstacles()
    updateAttractors()

    blackHole = new BlackHoleAttractor(
      p.createVector(center.x, center.y),
      blackHoleStrength,
    )

    return {
      canvas,
    }
  }

  function draw() {
    const {
      count,
      showSwatches,
      visualizeField,
      blackHoleStrength,
      backgroundAlpha,
      edgeMode,
      forceMode,
      applyRandomForce,
      showParticles,
      showObstacles,
      showBlackHole,
      showAttractors,
      history,
    } = controlPanel.values()

    p.background(0)
    particleBuffer.background(chroma('black').alpha(backgroundAlpha).rgba())

    if (particles.length < count) {
      while (particles.length < count) {
        let position
        while (!position) {
          position = p.createVector(p.random(w), p.random(h))
          if (showObstacles) {
            for (const obstacle of obstacles) {
              if (obstacle.contains({ position })) {
                position = null
                break
              }
            }
            if (position && showBlackHole) {
              if (blackHole.contains({ position })) {
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

    if (forceMode !== 'algorithmic') {
      updateFlowField()
    }

    for (const particle of particles) {
      particle.edgeMode = edgeMode
      particle.applyRandomForce = applyRandomForce
      particle.maxHistory = history

      if (showObstacles) {
        for (const obstacle of obstacles) {
          if (obstacle.contains(particle)) {
            particle.velocity.mult(-0.5)
            particle.dieOnWrap = true
          }
        }
      }

      const force = getFlowForce(particle.position)
      if (showBlackHole) {
        blackHole.strengh = blackHoleStrength
        force.add(blackHole.getForce(particle))
        if (blackHole.contains(particle)) {
          particle.velocity.mult(-1)
          particle.dieOnWrap = true
        }
      }
      if (showAttractors) {
        for (const attractor of attractors) {
          force.add(attractor.getForce(particle))
        }
      }
      particle.applyForce(force)
      particle.update()
      particle.edges()
      particle.display()
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      if (particles[i].isDead()) {
        particles.splice(i, 1)
      }
    }

    if (showParticles) {
      p.image(particleBuffer, 0, 0, w, h)
    }
    if (showObstacles) {
      for (const obstacle of obstacles) {
        obstacle.display()
      }
    }
    if (visualizeField) {
      visualizeFlowField()
    }
    if (showBlackHole) {
      blackHole.display()
    }
    if (showAttractors) {
      updateAttractors()
    }
    if (showSwatches) {
      renderSwatches({ p, w, scales: [colorScale] })
    }
  }

  function getZOffset() {
    return ah.getTotalBeatsElapsed() * controlPanel.get('zOffsetMultiplier')
  }

  function angleForPosition(position) {
    const noiseScale = controlPanel.get('noiseScale')
    const x = position.x * noiseScale
    const y = position.y * noiseScale
    const value = p.noise(x, y, getZOffset())
    const angle =
      p.map(value, 0, 1, 0, p.TWO_PI) +
      p.sin(p.radians(controlPanel.get('angleOffset')))
    const force = p5.Vector.fromAngle(angle)
    force.setMag(controlPanel.get('forceMagnitude'))
    return force
  }

  function updateFlowField() {
    const totalGridWidth = cols * resolution
    const totalGridHeight = rows * resolution
    const xOffset = (w - totalGridWidth) / 2
    const yOffset = (h - totalGridHeight) / 2

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const index = x + y * cols

        const gridPosX = x * resolution + xOffset + resolution / 2
        const gridPosY = y * resolution + yOffset + resolution / 2

        const force = angleForPosition({
          x: gridPosX - w / 2,
          y: gridPosY - h / 2,
        })

        flowField[index] = force
      }
    }
  }

  const forceModes = {
    grid(position) {
      const totalGridWidth = cols * resolution
      const totalGridHeight = rows * resolution
      const xOffset = (w - totalGridWidth) / 2
      const yOffset = (h - totalGridHeight) / 2
      const adjustedX = position.x - xOffset
      const adjustedY = position.y - yOffset
      const x = Math.floor(adjustedX / resolution)
      const y = Math.floor(adjustedY / resolution)
      if (x < 0 || x >= cols || y < 0 || y >= rows) {
        return p.createVector(0, 0)
      }
      const index = x + y * cols
      const force = flowField[index].copy()
      return force
    },
    algorithmic: angleForPosition,
    combinedAdditive(position) {
      const force1 = forceModes.grid(position)
      const force2 = forceModes.algorithmic(position)
      return p5.Vector.add(force1, force2)
    },
    combinedAveraged(position) {
      const force1 = forceModes.grid(position)
      const force2 = forceModes.algorithmic(position)
      return p5.Vector.add(force1, force2).mult(0.5)
    },
  }

  function getFlowForce(position) {
    return forceModes[controlPanel.get('forceMode')](position)
  }

  function visualizeFlowField() {
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

        const force = getFlowForce(position)
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

  function initializeObstacles() {
    const size = 100
    // obstacles.push(new Obstacle(center.x, center.y, size, size))
    obstacles.push(new Obstacle(center.x / 2, center.y / 2, size, size))
    obstacles.push(new Obstacle(center.x * 1.5, center.y / 2, size, size))
    obstacles.push(new Obstacle(center.x / 2, center.y * 1.5, size, size))
    obstacles.push(new Obstacle(center.x * 1.5, center.y * 1.5, size, size))
  }

  function updateAttractors() {
    const strength = controlPanel.get('attractorStrength')
    const grid = 4
    const spacingX = w / (grid + 1)
    const spacingY = h / (grid + 1)
    let index = 0
    for (let i = 0; i < grid; i++) {
      for (let j = 0; j < grid; j++) {
        const x = (i + 1) * spacingX
        const y = (j + 1) * spacingY
        const v = p.createVector(x, y)
        attractors[index] =
          attractors[index] || new Attractor(v, strength, 'repel')
        attractors[index].position = v
        attractors[index].display()
        index++
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
      this.maxOpacity = 0.9
      this.diameter = p.random(0.25, 3)
      this.history = []
      this.maxHistory = maxHistory
      this.lifespan = 255
      this.dieOnWrap = false
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

      if (this.opacity < this.maxOpacity) {
        this.opacity = p.constrain(this.opacity + 0.01, 0, this.maxOpacity)
      }

      if (this.applyRandomForce) {
        const randomForce = p5.Vector.random2D()
        randomForce.setMag(0.2)
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
      if (this.isDead()) {
        return
      }

      const baseColor = this.dieOnWrap
        ? chroma.mix(this.color, 'magenta', 0.2)
        : this.color

      let prev = this.position
      for (const [index, position] of this.history.entries()) {
        const distance = p.dist(position.x, position.y, prev.x, prev.y)
        const threshold = Math.min(w, h) / 2
        if (distance < threshold) {
          const value = this.maxHistory - index
          const opacity = p.map(value, 0, this.maxHistory, 0, this.opacity)
          particleBuffer.stroke(baseColor.alpha(opacity).rgba())
          particleBuffer.line(prev.x, prev.y, position.x, position.y)
        }
        prev = position
      }

      const color = baseColor.alpha(this.opacity).rgba()
      particleBuffer.fill(color)
      particleBuffer.stroke(color)
      particleBuffer.circle(this.position.x, this.position.y, this.diameter)
    }

    die() {
      this.lifespan = -1
    }

    isDead() {
      return this.lifespan < 0
    }

    edges() {
      if (this.edgeMode === 'wrap') {
        let wrapped = false

        if (this.position.x > w) {
          this.position.x = 0
          wrapped = true
        }
        if (this.position.x < 0) {
          this.position.x = w
          wrapped = true
        }
        if (this.position.y > h) {
          this.position.y = 0
          wrapped = true
        }
        if (this.position.y < 0) {
          this.position.y = h
          wrapped = true
        }

        if (wrapped && this.dieOnWrap) {
          this.lifespan = -1
        }
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
      p.noStroke()
      p.fill(50, 0.3)
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

  class BlackHoleAttractor {
    constructor(position, strength = 1.5) {
      this.position = position
      this.strength = strength
      this.zone = 100
    }
    getForce(particle) {
      const force = p5.Vector.sub(this.position, particle.position)
      const distance = force.mag()
      force.normalize()
      const strengh = this.strength / distance ** 2
      force.mult(strengh)
      return force
    }
    display() {
      p.noStroke()
      for (let i = this.zone; i > 0; i -= this.zone / 10) {
        p.fill(0, p.map(i, 0, this.zone, 1, 0))
        p.circle(this.position.x, this.position.y, i)
      }
    }
    contains(particle) {
      const distance = p.dist(
        particle.position.x,
        particle.position.y,
        this.position.x,
        this.position.y,
      )
      return distance < this.zone / 2
    }
  }

  class Attractor {
    constructor(position, strength = 1.5, mode = 'hybrid') {
      this.position = position
      this.strength = strength
      this.zone = 20
      this.mode = mode
    }

    getForce(particle) {
      const force = p5.Vector.sub(this.position, particle.position)
      const distance = force.mag()
      let strength = this.strength / distance ** 2

      if (this.mode === 'hybrid') {
        if (distance < this.zone) {
          strength *= -1
        }
      } else if (this.mode === 'repel') {
        strength *= -1
      }

      return force.normalize().mult(strength)
    }

    display() {
      p.noStroke()
      if (this.mode === 'repel') {
        for (let i = this.zone; i > 0; i -= this.zone / 10) {
          p.fill(50, p.map(i, 0, this.zone, 0.7, 0.1))
          p.circle(this.position.x, this.position.y, i)
        }
      } else {
        p.fill(50, 0.5)
        p.circle(this.position.x, this.position.y, this.zone)
      }
    }

    contains(particle) {
      const distance = p.dist(
        particle.position.x,
        particle.position.y,
        this.position.x,
        this.position.y,
      )
      return distance < this.zone / 2
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
