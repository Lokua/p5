import Control from './Control.mjs'

export default class Checkbox extends Control {
  constructor({ name, value = false, ...rest }) {
    super({
      name,
      value,
      hasLabelValue: false,
      type: 'checkbox',
      ...rest,
    })
  }

  html() {
    return super.html(`
      <input 
        id="${this.id}" 
        type="checkbox" 
        ${this.value ? 'checked' : ''}
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

  onChange = (e) => {
    this.setValue(e.target.checked)
  }

  setValue(value) {
    this.value = Boolean(value)
    const checkbox = document.getElementById(this.id)
    if (checkbox) {
      checkbox.checked = this.value
    }
  }
}
