import Control from './Control.mjs'

export default class Button extends Control {
  constructor({ name, handler, shortcut, ...rest }) {
    super({
      name,
      value: null,
      hasLabelValue: false,
      hasLabel: false,
      type: 'button',
      ...rest,
    })
    this.shortcut = shortcut
    this.handler = handler
  }

  html() {
    const shortcut = this.shortcut ? `[${this.shortcut}]` : ''
    return super.html(`
      <button id="${this.id}">
        ${this.name} ${shortcut}
      </button>
    `)
  }

  bind() {
    const element = document.getElementById(this.id)
    element.addEventListener('click', this.onClick)
    if (this.shortcut) {
      this.keyHandler = (e) => {
        if (e.key === this.shortcut) {
          element.click()
        }
      }
      document.addEventListener('keyup', this.keyHandler)
    }
  }

  addInputListener(fn) {
    document.getElementById(this.id).addEventListener('click', fn)
  }

  onClick = () => {
    this.handler?.()
    this.setValue(true)
    this.setValue(null)
  }

  setValue(value) {
    this.value = value
  }

  destroy() {
    document.removeEventListener('keyup', this.keyHandler)
  }
}
