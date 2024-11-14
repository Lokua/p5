import { onScreen } from '../../util.mjs'

/**
 * @param {import('p5')} p
 */
export default class BaseParticle {
  constructor({
    p,
    buffer = p,
    w = p.width,
    h = p.height,
    vectorPool,
    position,
    edgeMode = 'wrap',
    active = false,
    maxSpeed,
  }) {
    this.p = p
    this.buffer = buffer
    this.w = w
    this.h = h
    this.vectorPool = vectorPool || {
      get: () => p.createVector(0, 0),
    }
    this.position = position
    this.velocity = vectorPool.get()
    this.acceleration = vectorPool.get()
    this.maxSpeed = maxSpeed || p.random(1, 5)
    this.edgeMode = edgeMode
    this.active = active
  }

  applyForce(force) {
    this.acceleration.add(force)
  }

  update() {
    this.velocity.add(this.acceleration)
    this.velocity.limit(this.maxSpeed)
    this.position.add(this.velocity)
    this.acceleration.mult(0)
  }

  display() {
    if (this.active) {
      this.buffer.noFill()
      this.buffer.stroke('red')
      this.buffer.point(this.position.x, this.position.y)
    }
  }

  edges() {
    if (this.edgeMode === 'wrap') {
      if (this.position.x > this.w) {
        this.position.x = 0
      }
      if (this.position.x < 0) {
        this.position.x = this.w
      }
      if (this.position.y > this.h) {
        this.position.y = 0
      }
      if (this.position.y < 0) {
        this.position.y = this.h
      }
    } else if (this.edgeMode === 'respawn') {
      if (!this.onScreen()) {
        this.#assignRandomPosition()
      }
    }
  }

  onScreen() {
    return onScreen(this.position, this.w, this.h)
  }

  reset(position) {
    this.position.set(position)
    this.velocity.mult(0)
    this.acceleration.mult(0)
    this.active = true
  }

  #assignRandomPosition() {
    this.position = this.vectorPool
      .get()
      .set(this.p.random(this.w), this.p.random(this.h))
  }
}
