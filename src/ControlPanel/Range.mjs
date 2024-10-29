import Control from './Control.mjs'

export default class Range extends Control {
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
