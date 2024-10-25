export default class Control {
  #inputListeners = []

  constructor({ name, value, hasLabelValue = true }) {
    this.id = `${name}--${Date.now()}`
    this.name = name
    this.value = value
    this.hasLabelValue = hasLabelValue
  }

  html(children) {
    const labelValue = this.hasLabelValue ? `<span>${this.value}</span>` : ''
    return `
      <div class="control ${this.id}-control">
        <label>${this.name} ${labelValue}</label>
        ${children}
      </div>
    `
  }

  bind() {
    this.getElement().addEventListener('input', this.#onInput)
  }

  destroy() {
    const element = this.getElement()
    element.parentNode.removeChild(element)
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
