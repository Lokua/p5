import { inheritStaticProperties } from '../../util.mjs'
import EntityTypes from './EntityTypes.mjs'
import Attractor from './Attractor.mjs'

export default class BlackHole extends Attractor {
  static {
    inheritStaticProperties(this, Attractor)
  }

  static entityTypes = [EntityTypes.ATTRACTOR]

  constructor({ radius = 50, ...rest }) {
    super({ radius, ...rest })
    this.addInteraction([EntityTypes.PARTICLE], this.pullParticle)
  }

  display() {
    this.buffer.noStroke()
    for (let i = this.diameter; i > 0; i -= this.diameter / 10) {
      this.buffer.fill(0, this.p.map(i, 0, this.diameter, 1, 0))
      this.buffer.circle(this.position.x, this.position.y, i)
    }
  }

  pullParticle(particle, outputForce) {
    const blackHoleForce = this.vectorPool.get()
    this.applyForceTo(particle, blackHoleForce)
    outputForce.add(blackHoleForce)
    this.vectorPool.release(blackHoleForce)

    if (this.contains(particle)) {
      particle.velocity.mult(-1)
      particle.marked = true
    }
  }
}
