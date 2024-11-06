export default class Control {
  #inputListeners = []

  constructor({
    name,
    value,
    hasLabel = true,
    hasLabelValue = true,
    type = 'default',
    disabled = false,
  }) {
    this.id = `${name}--${Date.now()}`
    this.name = name
    this.value = value
    this.hasLabel = hasLabel
    this.hasLabelValue = hasLabelValue
    this.type = type
    this.disabled = disabled
  }

  html(children, containerAttributes = '') {
    const labelValue = this.hasLabelValue ? `<span>${this.value}</span>` : ''
    const label = this.hasLabel
      ? `<label for="${this.id}">${this.name} ${labelValue}</label>`
      : ''
    return `
      <div 
        class="control ${this.id}-control control-${this.type}" 
        ${containerAttributes}
      >
        ${label}
        ${children}
      </div>
    `
  }

  bind() {
    this.getElement().addEventListener('input', this.#onInput)
  }

  addInputListener(fn) {
    this.#inputListeners.push(fn)
    this.getElement().addEventListener('input', fn)
  }

  getElement = () => {
    return document.querySelector(`.${this.id}-control`)
  }

  #onInput = (e) => {
    this.value = e.target.valueAsNumber
    if (this.hasLabelValue) {
      this.getElement().querySelector('span').textContent = this.value
    }
  }

  setValue(value) {
    this.value = value
    const element = this.getElement()
    element.querySelector('span').textContent = value
    element.querySelector('input').value = value
  }
}
