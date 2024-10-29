import Control from './Control.mjs'

export default class Checkbox extends Control {
  constructor({ name, value = false }) {
    super({
      name,
      value,
      hasLabelValue: false,
      type: 'checkbox',
    })
  }

  html() {
    return super.html(`
      <input 
        id="${this.id}" 
        type="checkbox" 
        checked="${this.value}"
      >
    `)
  }

  bind() {
    document.getElementById(this.id).addEventListener('change', this.onChange)
  }

  addInputListener(fn) {
    super.addInputListener(fn)
    document.getElementById(this.id).addEventListener('change', fn)
  }

  onChange = () => {
    this.setValue(!this.value)
  }

  setValue(value) {
    this.value = value
  }
}
