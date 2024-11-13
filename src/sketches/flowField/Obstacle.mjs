/**
 * @param {import('p5')} p
 */
export default class Obstacle {
  constructor(p, x, y, w, h) {
    this.p = p
    this.position = p.createVector(x, y)
    this.w = w
    this.h = h
  }

  display() {
    this.p.noStroke()
    this.p.fill(50, 0.3)
    this.p.rectMode(this.p.CENTER)
    this.p.rect(this.position.x, this.position.y, this.w, this.h)
  }

  contains(particle) {
    return (
      particle.position.x > this.position.x - this.w / 2 &&
      particle.position.x < this.position.x + this.w / 2 &&
      particle.position.y > this.position.y - this.h / 2 &&
      particle.position.y < this.position.y + this.h / 2
    )
  }
}
