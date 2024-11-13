import chroma from 'chroma-js'
import { onScreen } from '../../util.mjs'

/**
 * @param {import('p5')} p
 */
export default class Particle {
  constructor({
    p,
    buffer,
    w,
    h,
    colorScale,
    position,
    edgeMode = 'wrap',
    opacity = 0,
    applyRandomForce = false,
    maxHistory = 5,
    active = false,
  }) {
    this.p = p
    this.buffer = buffer
    this.w = w
    this.h = h
    this.colorScale = colorScale
    this.position = position.copy()
    this.velocity = p.createVector(0, 0)
    this.acceleration = p.createVector(0, 0)
    this.maxSpeed = p.random(1, 5)
    this.color = colorScale(p.random())
    this.edgeMode = edgeMode
    this.applyRandomForce = applyRandomForce
    this.opacity = opacity
    this.maxOpacity = 0.9
    this.diameter = p.random(0.25, 3)
    this.history = []
    this.maxHistory = maxHistory
    this.lifespan = 255
    this.dieOnWrap = false
    this.active = active
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
      this.opacity = this.p.constrain(this.opacity + 0.01, 0, this.maxOpacity)
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
      const distance = this.p.dist(position.x, position.y, prev.x, prev.y)
      const threshold = Math.min(this.w, this.h) / 2

      if (distance < threshold) {
        const value = this.maxHistory - index
        const opacity = this.p.map(value, 0, this.maxHistory, 0, this.opacity)
        this.buffer.stroke(baseColor.alpha(opacity).rgba())
        this.buffer.line(prev.x, prev.y, position.x, position.y)
      }

      prev = position
    }

    const color = baseColor.alpha(this.opacity).rgba()
    this.buffer.fill(color)
    this.buffer.stroke(color)
    this.buffer.circle(this.position.x, this.position.y, this.diameter)
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

      if (this.position.x > this.w) {
        this.position.x = 0
        wrapped = true
      }
      if (this.position.x < 0) {
        this.position.x = this.w
        wrapped = true
      }
      if (this.position.y > this.h) {
        this.position.y = 0
        wrapped = true
      }
      if (this.position.y < 0) {
        this.position.y = this.h
        wrapped = true
      }

      if (wrapped && this.dieOnWrap) {
        this.lifespan = -1
      }
    } else if (this.edgeMode === 'respawn') {
      if (!this.onScreen()) {
        this.#assignRandomPosition()
        this.opacity = 0
      }
    }
  }

  onScreen() {
    return onScreen(this.position, this.w, this.h)
  }

  reset(position) {
    this.position = position.copy()
    this.velocity.mult(0)
    this.acceleration.mult(0)
    this.lifespan = 255
    this.dieOnWrap = false
    this.history = []
  }

  #assignRandomPosition() {
    this.position = this.p.createVector(
      this.p.random(this.w),
      this.p.random(this.h),
    )
  }
}
