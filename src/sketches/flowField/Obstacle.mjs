import Entity from './Entity.mjs'
import EntityTypes from './EntityTypes.mjs'
import Quirks, { QuirkModes } from './Quirks.mjs'
import { isPointInRect } from '../../util.mjs'

export default class Obstacle extends Entity {
  static entityType = EntityTypes.OBSTACLE

  /**
   * @param {Object} options
   * @param {import('p5')} options.p
   */
  constructor({ p, buffer = p, x, y, w, h, active }) {
    super()
    this.p = p
    this.buffer = buffer
    this.position = p.createVector(x, y)
    this.w = w
    this.h = h
    this.active = active
    this.addInteraction(EntityTypes.FLOW_PARTICLE, this.seduce)
    this.addInteraction(EntityTypes.POLLINATOR, this.xRay)
  }

  updateState(update) {
    Object.assign(this, update)
  }

  display() {
    if (this.active) {
      this.buffer.noStroke()
      this.buffer.fill(50, 0.3)
      this.buffer.rectMode(this.p.CENTER)
      this.buffer.rect(this.position.x, this.position.y, this.w, this.h)
    }
  }

  contains(particle) {
    return this.active && isPointInRect(particle.position, this)
  }

  getOverlapCircular(particle) {
    if (this.active) {
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

    return 0
  }

  seduce(particle) {
    particle.updateQuirkFromSource({
      quirk: Quirks.MARKED_FOR_DEATH,
      mode: QuirkModes.ADD_NO_UPDATE_NO_REMOVE,
      source: this,
      shouldHaveQuirk: this.active && this.contains(particle),
      update() {
        particle.velocity.mult(-0.5)
      },
    })
  }

  xRay(pollinator) {
    const overlapPercentage = this.getOverlapCircular(pollinator)

    pollinator.updateQuirkFromSource({
      quirk: Quirks.X_RAY,
      source: this,
      shouldHaveQuirk: this.active && overlapPercentage >= 0.5,
      context: {
        overlapPercentage,
      },
    })
  }
}
