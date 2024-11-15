import { inheritStaticProperties } from '../../util.mjs'
import Attractor from './Attractor.mjs'
import FlowParticle from './FlowParticle.mjs'

/**
 * @param {import('p5')} p
 */
export default class BlackHole extends Attractor {
  static {
    inheritStaticProperties(this, Attractor)
  }

  constructor(...args) {
    super(...args)
    this.addInteraction([FlowParticle], this.pullParticle)
  }

  display() {
    this.buffer.noStroke()
    for (let i = this.radius; i > 0; i -= this.radius / 10) {
      this.buffer.fill(0, this.p.map(i, 0, this.radius, 1, 0))
      this.buffer.circle(this.position.x, this.position.y, i)
    }
  }

  pullParticle(particle, force) {
    const blackHoleForce = this.vectorPool.get()
    this.applyForceTo(particle, blackHoleForce)
    force.add(blackHoleForce)
    this.vectorPool.release(blackHoleForce)

    if (this.contains(particle)) {
      particle.velocity.mult(-1)
      particle.marked = true
    }
  }
}
