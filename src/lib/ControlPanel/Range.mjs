import Control from './Control.mjs'

export default class Range extends Control {
  static float = {
    value: 0.5,
    min: 0,
    max: 1,
    step: 0.001,
  }

  constructor({ name, value = 0, min = 0, max = 100, step = 1, ...rest }) {
    super({
      name,
      value,
      ...rest,
    })
    this.min = min
    this.max = max
    this.step = step
  }

  html() {
    return super.html(`
      <input 
        id="${this.id}" 
        type="range" 
        min="${this.min}" 
        max="${this.max}" 
        step="${this.step}"
        value="${this.value}"
      >
    `)
  }
}
