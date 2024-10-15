import Control from './Control.mjs'

export default class Select extends Control {
  constructor({ name, value, hasLabelValue, options }) {
    super({
      name,
      value,
      hasLabelValue,
    })
    this.options = options
  }

  html() {
    return super.html(`
      <select  
        id="${this.id}" 
        value="${this.value}"
      >
        ${this.options.map(
          (value) => `<option value="${value}">${value}</option>`,
        )}
      </select>
    `)
  }

  bind() {
    document.getElementById(this.id).addEventListener('change', this.onChange)
  }

  addInputListener(fn) {
    super.addInputListener(fn)
    document.getElementById(this.id).addEventListener('change', fn)
  }

  onChange = (e) => {
    this.setValue(e.target.value)
  }

  setValue(value) {
    this.value = value
    document.getElementById(this.id).value = value
  }
}
