import { interpolators } from '../../lib/scaling.mjs'
import { inheritStaticProperties, callAtInterval } from '../../util.mjs'
import EntityTypes from './EntityTypes.mjs'
import Attractor from './Attractor.mjs'
import Quirks, { QuirkModes } from './Quirks.mjs'

export default class BlackHole extends Attractor {
  static {
    inheritStaticProperties(this, Attractor)
  }

  static entityType = EntityTypes.BLACK_HOLE

  constructor({ radius = 50, ...rest }) {
    super({ radius, ...rest })
    this.addInteraction(EntityTypes.FLOW_PARTICLE, this.pullParticle)
    this.addInteraction(EntityTypes.POLLINATOR, this.pullPollinator)
    this.addInteraction(EntityTypes.FLOW_FIELD, this.muteFlowFieldMagnitude)
  }

  display() {
    if (this.active) {
      this.buffer.noStroke()
      for (let i = this.diameter; i > 0; i -= this.diameter / 10) {
        this.buffer.fill(0, this.p.map(i, 0, this.diameter, 1, 0))
        this.buffer.circle(this.position.x, this.position.y, i)
      }
    }
  }

  pullParticle(particle, outputForce) {
    if (this.active) {
      const blackHoleForce = this.vectorPool.get()
      this.applyForceTo(particle, blackHoleForce)
      outputForce.add(blackHoleForce)
      this.vectorPool.release(blackHoleForce)
    }

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

  pullPollinator(pollinator, outputForce) {
    if (this.active) {
      const blackHoleForce = this.vectorPool.get()
      this.applyForceTo(pollinator, blackHoleForce)
      outputForce.add(blackHoleForce)
      this.vectorPool.release(blackHoleForce)
    }

    pollinator.updateQuirkFromSource({
      quirk: Quirks.BLACK_HOLED,
      shouldHaveQuirk: this.active && this.contains(pollinator),
      source: this,
      context: {
        originalRadius: pollinator.radius,
      },
      exit(context) {
        pollinator.radius = context.originalRadius
      },
    })
  }

  muteFlowFieldMagnitude(flowField) {
    flowField.updateQuirkFromSource({
      quirk: Quirks.BLACK_HOLED,
      mode: QuirkModes.ADD_UPDATE_NO_REMOVE,
      shouldHaveQuirk: this.active,
      source: this,
      context: {
        progress: 0,
        forceMagnitude: 0.01,
      },
      update: (context) => {
        if (!this.active && context.forceMagnitude < flowField.forceMagnitude) {
          context.progress = Math.min(context.progress + 0.005, 1)
          context.forceMagnitude = this.p.map(
            interpolators.exponential(context.progress, 5),
            0,
            1,
            context.forceMagnitude,
            flowField.forceMagnitude,
          )
        } else if (
          flowField.hasQuirk(Quirks.BLACK_HOLED) &&
          context.forceMagnitude === flowField.forceMagnitude
        ) {
          flowField.removeQuirk(Quirks.BLACK_HOLED)
        }
      },
    })
  }
}
