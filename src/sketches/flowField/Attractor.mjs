/**
 * @param {import('p5')} p
 */
export default class Attractor {
  constructor({
    p,
    w,
    h,
    colorScale,
    position,
    strength = 1.5,
    mode = 'hybrid',
    vectorPool,
  }) {
    this.p = p
    this.w = w
    this.h = h
    this.vectorPool = vectorPool
    this.position = position
    this.strength = strength
    this.zone = 50
    this.mode = mode
    this.maxSpeed = 2
    this.color = colorScale(p.random())
  }

  getForce(particle, outputVector) {
    outputVector.set(this.position).sub(particle.position)

    const distance = outputVector.mag()
    let strength = this.strength / distance ** 2

    if (this.mode === 'hybrid') {
      if (distance < this.zone) {
        strength *= -1
      }
    } else if (this.mode === 'repel') {
      strength *= -1
    }

    // Dafuq? Is this because distance is 0?
    if (!Number.isFinite(strength)) {
      console.warn('[Attractor#getForce] `strength` is not finite:', {
        strength,
        particle,
        outputVector,
        distance,
        this: this,
      })
    }

    return outputVector.normalize().mult(strength)
  }

  display() {
    this.p.noStroke()
    for (let i = this.zone; i > 0; i -= this.zone / 10) {
      const alpha = this.p.map(i, 0, this.zone, 0.7, 0.1)
      this.p.fill(this.color.alpha(alpha).rgba())
      this.p.circle(this.position.x, this.position.y, i)
    }
  }

  edges() {
    if (this.position.x > this.w) {
      this.position.x = this.w
    }
    if (this.position.x < 0) {
      this.position.x = 0
    }
    if (this.position.y > this.h) {
      this.position.y = this.h
    }
    if (this.position.y < 0) {
      this.position.y = 0
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
