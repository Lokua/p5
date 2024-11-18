import Entity from './Entity.mjs'
import EntityTypes from './EntityTypes.mjs'
import Quirks from './Quirks.mjs'
import { isPointInRect } from '../../util.mjs'

export default class Obstacle extends Entity {
  static entityType = EntityTypes.OBSTACLE

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
    this.addInteraction(EntityTypes.FLOW_PARTICLE, this.seduce)
    this.addInteraction(EntityTypes.POLLINATOR, this.xRay)
    this.id = Math.random()
  }

  display() {
    this.buffer.noStroke()
    this.buffer.fill(50, 0.3)
    this.buffer.rectMode(this.p.CENTER)
    this.buffer.rect(this.position.x, this.position.y, this.w, this.h)
  }

  contains(particle) {
    return isPointInRect(particle.position, this)
  }

  getOverlapCircular(particle) {
    const radius = particle.radius || particle.diameter / 2
    const numPoints = 36
    let pointsInside = 0

    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * 2 * Math.PI
      const x = particle.position.x + radius * Math.cos(angle)
      const y = particle.position.y + radius * Math.sin(angle)

      if (isPointInRect({ x, y }, this)) {
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

  xRay(pollinator) {
    const overlapPercentage = this.getOverlapCircular(pollinator)

    pollinator.updateQuirkFromSource({
      quirk: Quirks.X_RAY,
      source: this,
      shouldHaveQuirk: overlapPercentage >= 0.5,
      context: {
        overlapPercentage,
      },
    })
  }
}
