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
    this.addInteraction([EntityTypes.FLOW_PARTICLE], this.seduce)
    this.addInteraction([EntityTypes.POLLINATOR], this.xRay)
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

  getOverlapCircular(entity) {
    const radius = entity.radius || entity.diameter / 2
    const numPoints = 36
    let pointsInside = 0

    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * 2 * Math.PI
      const x = entity.position.x + radius * Math.cos(angle)
      const y = entity.position.y + radius * Math.sin(angle)

      if (
        x > this.position.x - this.w / 2 &&
        x < this.position.x + this.w / 2 &&
        y > this.position.y - this.h / 2 &&
        y < this.position.y + this.h / 2
      ) {
        pointsInside++
      }
    }

    return pointsInside / numPoints
  }

  seduce(entity) {
    if (this.contains(entity)) {
      entity.velocity.mult(-0.5)
      entity.marked = true
    }
  }

  xRay(entity) {
    if (this.contains(entity) && this.getOverlapCircular(entity) >= 0.1) {
      entity.addQuirk('xRay')
    } else {
      entity.removeQuirk('xRay')
    }
  }
}
