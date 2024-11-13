/**
 * @param {import('p5')} p
 */
export default class Attractor {
  constructor(p, position, strength = 1.5, mode = 'hybrid') {
    this.p = p
    this.position = position
    this.strength = strength
    this.zone = 20
    this.mode = mode
  }

  getForce(particle) {
    const force = p5.Vector.sub(this.position, particle.position)
    const distance = force.mag()
    let strength = this.strength / distance ** 2

    if (this.mode === 'hybrid') {
      if (distance < this.zone) {
        strength *= -1
      }
    } else if (this.mode === 'repel') {
      strength *= -1
    }

    return force.normalize().mult(strength)
  }

  display() {
    this.p.noStroke()
    if (this.mode === 'repel') {
      for (let i = this.zone; i > 0; i -= this.zone / 10) {
        this.p.fill(50, this.p.map(i, 0, this.zone, 0.7, 0.1))
        this.p.circle(this.position.x, this.position.y, i)
      }
    } else {
      this.p.fill(50, 0.5)
      this.p.circle(this.position.x, this.position.y, this.zone)
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