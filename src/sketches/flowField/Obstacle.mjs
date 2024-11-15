import Entity from './Entity.mjs'
/**
 * @param {import('p5')} p
 */
export default class Obstacle extends Entity {
  constructor({ p, buffer = p, x, y, w, h }) {
    super()
    this.p = p
    this.buffer = buffer
    this.position = p.createVector(x, y)
    this.w = w
    this.h = h
  }

  display() {
    this.buffer.noStroke()
    this.buffer.fill(50, 0.3)
    this.buffer.rectMode(this.p.CENTER)
    this.buffer.rect(this.position.x, this.position.y, this.w, this.h)
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
