/**
 * @param {import('p5')} p
 */
export default class BlackHoleAttractor {
  constructor(p, position, strength = 1.5, vectorPool) {
    this.p = p
    this.vectorPool = vectorPool
    this.position = position
    this.strength = strength
    this.zone = 100
  }

  getForce(particle, outputVector) {
    outputVector.set(this.position).sub(particle.position)
    const distance = outputVector.mag()
    outputVector.normalize()
    const strength = this.strength / distance ** 2
    outputVector.mult(strength)
    return outputVector
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
