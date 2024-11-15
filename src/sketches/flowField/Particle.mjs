import { onScreen } from '../../util.mjs'
import Entity from './Entity.mjs'

export default class Particle extends Entity {
  static EdgeMode = {
    WRAP: 'WRAP',
    BOUND: 'BOUND',
    RESPAWN: 'RESPAWN',
  }

  /**
   * @param {Object} options
   * @param {import('p5')} options.p
   * @param {import('p5')} [options.buffer]
   * @param {number} [options.w]
   * @param {number} [options.h]
   * @param {{ get: () => import('p5').Vector }} [options.vectorPool]
   * @param {import('p5').Vector} [options.position]
   * @param {Particle.EdgeMode} [options.edgeMode]
   * @param {boolean} [options.active]
   * @param {number} [options.maxSpeed]
   */
  constructor({
    p,
    buffer = p,
    w = p.width,
    h = p.height,
    vectorPool,
    position,
    edgeMode = Particle.EdgeMode.WRAP,
    active = false,
    maxSpeed,
  }) {
    super()
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
    if (this.edgeMode === Particle.EdgeMode.WRAP) {
      this.position.x > this.w && (this.position.x = 0)
      this.position.x < 0 && (this.position.x = this.w)
      this.position.y > this.h && (this.position.y = 0)
      this.position.y < 0 && (this.position.y = this.h)
    } else if (this.edgeMode === Particle.EdgeMode.BOUND) {
      this.position.x = this.p.constrain(this.position.x, 0, this.w)
      this.position.y = this.p.constrain(this.position.y, 0, this.h)
    } else if (this.edgeMode === Particle.EdgeMode.RESPAWN) {
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
