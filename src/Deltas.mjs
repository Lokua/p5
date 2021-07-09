import { average } from './util.mjs'

export default class Deltas {
  #values = []

  constructor(size) {
    this.size = size
    this.#values = []
  }

  get(index) {
    return this.#values[index]
  }

  getValues() {
    return this.#values.slice()
  }

  push(value) {
    if (this.#values.length === this.size) {
      this.#values.shift()
    }
    this.#values.push(value)
  }

  average() {
    return average(this.#values)
  }
}
