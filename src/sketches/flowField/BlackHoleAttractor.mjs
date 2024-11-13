/**
 * @param {import('p5')} p
 */
export default class BlackHoleAttractor {
  constructor(p, position, strength = 1.5) {
    this.p = p
    this.position = position
    this.strength = strength
    this.zone = 100
  }

  getForce(particle) {
    const force = p5.Vector.sub(this.position, particle.position)
    const distance = force.mag()
    force.normalize()
    const strengh = this.strength / distance ** 2
    force.mult(strengh)
    return force
  }

  display() {
    this.p.noStroke()
    for (let i = this.zone; i > 0; i -= this.zone / 10) {
      this.p.fill(0, this.p.map(i, 0, this.zone, 1, 0))
      this.p.circle(this.position.x, this.position.y, i)
    }
  }

  contains(particle) {
    const distance = this.p.dist(
      particle.position.x,
      particle.position.y,
      this.position.x,
      this.position.y,
    )
    return distance < this.zone / 2
  }
}
