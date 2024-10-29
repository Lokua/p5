import Control from './Control.mjs'

export default class Toggle extends Control {
  constructor({
    name,
    value = false,
    onText = 'ON',
    offText = 'OFF',
    ...rest
  }) {
    super({
      name,
      value,
      ...rest,
    })
    this.onText = onText
    this.offText = offText
  }

  html() {
    return super.html(`
      <button 
        id="${this.id}" 
        type="button" 
      >
        ${this.value ? this.onText : this.offText}
      </button>
    `)
  }

  bind() {
    document.getElementById(this.id).addEventListener('click', this.onClick)
  }

  addInputListener(fn) {
    super.addInputListener(fn)
    document.getElementById(this.id).addEventListener('click', fn)
  }

  onClick = () => {
    this.setValue(!this.value)
  }

  setValue(value) {
    this.value = value
    const element = this.getElement()
    element.querySelector('span').textContent = this.getText()
    element.querySelector('button').textContent = this.getText()
  }

  getText() {
    return this.value ? this.onText : this.offText
  }
}
