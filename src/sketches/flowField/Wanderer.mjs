import Attractor from './Attractor.mjs'
import { inheritStaticProperties } from '../../util.mjs'

/**
 * @param {import('p5')} p
 */
export default class Wanderer extends Attractor {
  static {
    inheritStaticProperties(this, Attractor)
  }

  constructor({ p, colorScale, ...rest }) {
    super({
      p,
      mode: Attractor.Mode.HYBRID,
      active: true,
      ...rest,
    })

    this.color = colorScale(p.random())
  }

  update() {
    const force = this.vectorPool
      .get()
      .set(this.p.random(-1, 1), this.p.random(-1, 1))
      .normalize()
      .mult(this.strength)

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
  }
}
