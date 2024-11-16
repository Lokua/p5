import { inheritStaticProperties } from '../../util.mjs'
import EntityTypes from './EntityTypes.mjs'
import Particle from './Particle.mjs'

export default class Attractor extends Particle {
  static {
    inheritStaticProperties(this, Particle)
  }

  static entityTypes = [EntityTypes.PARTICLE]

  static Mode = {
    ATTRACT: 'ATTRACT',
    REPEL: 'REPEL',
    HYBRID: 'HYBRID',
  }

  constructor({
    edgeMode = Attractor.EdgeMode.BOUND,
    mode = Attractor.Mode.ATTRACT,
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

    if (this.mode === Attractor.Mode.HYBRID) {
      if (distance < this.radius) {
        strength *= -1
      }
    } else if (this.mode === Attractor.Mode.REPEL) {
      strength *= -1
    }

    return outputVector.normalize().mult(strength)
  }

  display() {
    this.buffer.noStroke()
    this.buffer.fill(255, 0, 0, 100)
    this.buffer.circle(this.position.x, this.position.y, this.radius * 2)
  }
}
