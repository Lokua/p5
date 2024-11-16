import { callAtInterval, inheritStaticProperties } from '../../util.mjs'
import EntityTypes from './EntityTypes.mjs'
import Attractor from './Attractor.mjs'

export default class Pollinator extends Attractor {
  static {
    inheritStaticProperties(this, Attractor)
  }

  static entityTypes = [EntityTypes.PARTICLE, EntityTypes.ATTRACTOR]

  constructor({ p, colorScale, ...rest }) {
    super({
      p,
      mode: Attractor.Mode.HYBRID,
      active: true,
      maxSpeed: 3,
      ...rest,
    })

    this.color = colorScale(p.random())
    this.debug = false

    this.addInteraction([EntityTypes.PARTICLE], this.infectParticle)
    this.addInteraction([EntityTypes.ATTRACTOR], this.avoidNeighbor)
  }

  update() {
    const time = this.p.frameCount * 0.01
    const noiseX = this.p.noise(this.position.x * 0.01, time) * 2 - 1
    const noiseY = this.p.noise(this.position.y * 0.01, time) * 2 - 1
    const force = this.vectorPool
      .get()
      .set(noiseX, noiseY)
      .mult(this.p.random(0.5, 1))
    this.applyForce(force)
    this.vectorPool.release(force)
    super.update()
  }

  display() {
    this.buffer.noStroke()
    for (let i = this.radius; i > 0; i -= this.radius / 10) {
      const alpha = this.p.map(i, 0, this.radius, 0.7, 0.1)
      this.buffer.fill(this.color.alpha(alpha).rgba())
      this.buffer.circle(this.position.x, this.position.y, i)
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
    const strength = (-this.strength * 2) / (distance * distance)
    outputForce.normalize().mult(strength)
    otherPollinator.applyForce(outputForce)
  }
}
