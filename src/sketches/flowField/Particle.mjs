import { callAtInterval, onScreen } from '../../util.mjs'
import VectorPool from './VectorPool.mjs'
import Entity from './Entity.mjs'
import EntityTypes from './EntityTypes.mjs'

export default class Particle extends Entity {
  static entityTypes = [EntityTypes.PARTICLE]

  /**
   * @typedef {keyof typeof EdgeModes} EdgeMode
   */
  static EdgeModes = {
    WRAP: 'WRAP',
    BOUND: 'BOUND',
    RESPAWN: 'RESPAWN',
  }

  /**
   * @typedef {Object} VectorPool
   * @property {() => import('p5').Vector} get
   * @property {(v: import('p5').Vector) => void} release
   *
   * @param {Object} options
   * @param {import('p5')} options.p
   * @param {import('p5')} [options.buffer]
   * @param {number} [options.w]
   * @param {number} [options.h]
   * @param {VectorPool} [options.vectorPool]
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
    edgeMode = Particle.EdgeModes.WRAP,
    active = false,
    maxSpeed,
  }) {
    super()
    this.p = p
    this.buffer = buffer
    this.w = w
    this.h = h
    this.vectorPool = vectorPool || VectorPool.stubPool(p)
    this.position = position
    this.velocity = vectorPool.get()
    this.acceleration = vectorPool.get()
    this.maxSpeed = maxSpeed || p.random(1, 5)
    this.edgeMode = edgeMode
    this.active = active
  }

  updateState(updates) {
    Object.assign(this, updates)
  }

  applyForce(force) {
    this.acceleration.add(force)
  }

  updatePhysics() {
    this.velocity.add(this.acceleration)
    this.velocity.limit(this.maxSpeed)
    this.position.add(this.velocity)
    this.acceleration.mult(0)
  }

  update() {
    this.updatePhysics()
  }

  display() {
    if (this.active) {
      this.buffer.noFill()
      this.buffer.stroke('red')
      this.buffer.point(this.position.x, this.position.y)
    }
  }

  edges() {
    if (this.edgeMode === Particle.EdgeModes.WRAP) {
      this.position.x > this.w && (this.position.x = 0)
      this.position.x < 0 && (this.position.x = this.w)
      this.position.y > this.h && (this.position.y = 0)
      this.position.y < 0 && (this.position.y = this.h)
    } else if (this.edgeMode === Particle.EdgeModes.BOUND) {
      if (this.position.x <= 0 || this.position.x >= this.p.width) {
        this.velocity.x *= -1
      }
      if (this.position.y <= 0 || this.position.y >= this.p.height) {
        this.velocity.y *= -1
      }
      this.position.x = this.p.constrain(this.position.x, 0, this.w)
      this.position.y = this.p.constrain(this.position.y, 0, this.h)
    } else if (this.edgeMode === Particle.EdgeModes.RESPAWN) {
      if (!onScreen(this.position, this.w, this.h)) {
        this.#assignRandomPosition()
      }
    }
  }

  reset(position) {
    this.position.set(position)
    this.velocity.mult(0)
    this.acceleration.mult(0)
    this.active = true
  }

  destroy() {
    this.active = false
    this.vectorPool.release(this.position)
    this.vectorPool.release(this.acceleration)
    this.vectorPool.release(this.velocity)
  }

  #assignRandomPosition() {
    this.position = this.vectorPool
      .get()
      .set(this.p.random(this.w), this.p.random(this.h))
  }
}
