import Attractor from './Attractor.mjs'
import { inheritStaticProperties } from '../../util.mjs'

/**
 * @param {import('p5')} p
 */
export default class BlackHole extends Attractor {
  static {
    inheritStaticProperties(this, Attractor)
  }

  display() {
    this.buffer.noStroke()
    for (let i = this.radius; i > 0; i -= this.radius / 10) {
      this.buffer.fill(0, this.p.map(i, 0, this.radius, 1, 0))
      this.buffer.circle(this.position.x, this.position.y, i)
    }
  }
}
