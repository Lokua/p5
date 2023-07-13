export default class Counter {
  constructor({
    min,
    max,
    initialValue = min,
    step = 1,
    direction = 1,
  }) {
    this.min = min
    this.max = max
    this.initialValue = initialValue
    this.step = step
    this.count = initialValue
    this.direction = direction
  }

  #internalTick = (count) => {
    if (count === this.min) {
      this.direction = 1
    } else if (count === this.max) {
      this.direction = -1
    }

    return count + this.direction
  }

  tick(step) {
    let count = this.count
    for (let i = 0; i < (step || this.step); i++) {
      count = this.#internalTick(count)
    }
    this.count = count
  }
}
