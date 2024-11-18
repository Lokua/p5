import { callAtInterval, inheritStaticProperties } from '../../util.mjs'
import EntityTypes from './EntityTypes.mjs'
import Quirks from './Quirks.mjs'
import Attractor from './Attractor.mjs'

export default class Pollinator extends Attractor {
  static {
    inheritStaticProperties(this, Attractor)
  }

  static entityType = EntityTypes.POLLINATOR

  constructor({ p, colorScale, ...rest }) {
    super({
      p,
      mode: Attractor.Modes.HYBRID,
      active: true,
      maxSpeed: 3,
      radius: 12,
      ...rest,
    })

    this.color = colorScale(p.random())
    this.debug = false

    this.addInteraction(EntityTypes.FLOW_PARTICLE, this.infectParticle)
    this.addInteraction(EntityTypes.POLLINATOR, this.avoidNeighbor)
  }

  update() {
    const time = this.p.frameCount * 0.01
    const noiseScale = 0.01
    const noiseX = this.p.noise(this.position.x * noiseScale, time) * 2 - 1
    const noiseY = this.p.noise(this.position.y * noiseScale, time) * 2 - 1
    const force = this.vectorPool.get().set(noiseX, noiseY)
    const magnitude = this.p.random(0.1, 0.3)
    force.mult(magnitude)
    this.applyForce(force)
    this.vectorPool.release(force)
    super.update()
  }

  display() {
    if (this.hasQuirk(Quirks.X_RAY)) {
      for (let i = this.diameter; i > 0; i -= this.diameter / 4) {
        const alpha = this.p.map(i, 0, this.diameter, 0.7, 0.1)
        const color = this.color.saturate(1).alpha(alpha).rgba()
        this.buffer.noStroke()
        this.buffer.fill(color)
        this.buffer.circle(this.position.x, this.position.y, i)
      }
    } else if (this.hasQuirk(Quirks.BLACK_HOLED)) {
      for (let i = this.diameter; i > 0; i -= this.diameter / 10) {
        const alpha = this.p.map(i, 0, this.diameter, 0.7, 0.1)
        const color = this.color.alpha(alpha).rgba()
        this.buffer.noStroke()
        this.buffer.fill(color)
        this.buffer.circle(this.position.x, this.position.y, i)
      }
    } else {
      for (let i = this.diameter; i > 0; i -= this.diameter / 10) {
        const alpha = this.p.map(i, 0, this.diameter, 0.7, 0.1)
        const color = this.color.alpha(alpha).rgba()
        this.buffer.noStroke()
        this.buffer.fill(color)
        this.buffer.circle(this.position.x, this.position.y, i)
      }
    }
    if (this.debug) {
      this.buffer.stroke('yellow')
      this.buffer.line(
        this.position.x,
        this.position.y,
        this.position.x + this.velocity.x * 10,
        this.position.y + this.velocity.y * 10,
      )
    }
  }

  infectParticle(particle, outputForce) {
    const attractorForce = this.vectorPool.get()
    this.applyForceTo(particle, attractorForce)
    outputForce.add(attractorForce)
    this.vectorPool.release(attractorForce)

    if (this.contains(particle)) {
      particle.color = this.color
    }
  }

  avoidNeighbor(otherPollinator, outputForce) {
    outputForce.set(this.position).sub(otherPollinator.position)
    const distance = Math.max(outputForce.mag(), 0.0001)
    const strength = (-this.strength * 5) / (distance * distance)
    outputForce.normalize().mult(strength)
    otherPollinator.applyForce(outputForce)
  }
}
