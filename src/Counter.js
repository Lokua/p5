export default class Counter {
  #direction = 1

  constructor({ min, max, initialValue = min, step = 1 }) {
    this.min = min
    this.max = max
    this.initialValue = initialValue
    this.step = step
    this.count = initialValue
  }

  get direction() {
    return this.#direction
  }

  tick() {
    if (this.count === this.min) {
      this.direction = 1
    } else if (this.count === this.max) {
      this.direction = -1
    }
    this.count += this.step * this.direction
  }
}
