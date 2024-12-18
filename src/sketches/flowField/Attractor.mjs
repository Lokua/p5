import { inheritStaticProperties } from '../../util.mjs'
import EntityTypes from './EntityTypes.mjs'
import Particle from './Particle.mjs'

export default class Attractor extends Particle {
  static {
    inheritStaticProperties(this, Particle)
  }

  static entityType = EntityTypes.ATTRACTOR

  static Modes = {
    ATTRACT: 'ATTRACT',
    REPEL: 'REPEL',
    HYBRID: 'HYBRID',
  }

  constructor({
    edgeMode = Attractor.EdgeModes.BOUND,
    mode = Attractor.Modes.ATTRACT,
    strength = 1.5,
    radius = 25,
    ...rest
  }) {
    super({
      edgeMode,
      maxSpeed: 2,
      ...rest,
    })

    this.mode = mode
    this.strength = strength
    this.radius = radius
  }

  get diameter() {
    return this.radius * 2
  }

  set diameter(diameter) {
    this.radius = diameter / 2
  }

  contains(particle) {
    const distance = this.p.dist(
      particle.position.x,
      particle.position.y,
      this.position.x,
      this.position.y,
    )
    return distance < this.radius
  }

  applyForceTo(particle, outputVector) {
    outputVector.set(this.position).sub(particle.position)
    const distance = Math.max(outputVector.mag(), 0.0001)
    let strength = this.strength / distance ** 2

    if (this.mode === Attractor.Modes.HYBRID) {
      if (distance < this.radius) {
        strength *= -1
      }
    } else if (this.mode === Attractor.Modes.REPEL) {
      strength *= -1
    }

    return outputVector.normalize().mult(strength)
  }

  display() {
    this.buffer.noStroke()
    this.buffer.fill(255, 0, 0, 100)
    this.buffer.circle(this.position.x, this.position.y, this.diameter)
  }
}
