import Entity from './Entity.mjs'
import EntityTypes from './EntityTypes.mjs'

export default class Obstacle extends Entity {
  static entityTypes = [EntityTypes.OBSTACLE]

  /**
   * @param {Object} options
   * @param {import('p5')} options.p
   */
  constructor({ p, buffer = p, x, y, w, h }) {
    super()
    this.p = p
    this.buffer = buffer
    this.position = p.createVector(x, y)
    this.w = w
    this.h = h
    this.addInteraction([EntityTypes.PARTICLE], this.attemptToTrapParticle)
  }

  display() {
    this.buffer.noStroke()
    this.buffer.fill(50, 0.3)
    this.buffer.rectMode(this.p.CENTER)
    this.buffer.rect(this.position.x, this.position.y, this.w, this.h)
  }

  contains(particle) {
    return (
      particle.position.x > this.position.x - this.w / 2 &&
      particle.position.x < this.position.x + this.w / 2 &&
      particle.position.y > this.position.y - this.h / 2 &&
      particle.position.y < this.position.y + this.h / 2
    )
  }

  attemptToTrapParticle(particle) {
    if (this.contains(particle)) {
      particle.velocity.mult(-0.5)
      particle.marked = true
    }
  }
}
