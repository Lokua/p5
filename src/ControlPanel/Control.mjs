export default class Control {
  #inputListeners = []

  constructor({ name, value }) {
    this.id = `${name}--${Date.now()}`
    this.name = name
    this.value = value
  }

  html(children) {
    return `
      <div class="control ${this.id}-control">
        <label>${this.name} (<span>${this.value}</span>)</label>
        ${children}
      </div>
    `
  }

  bind() {
    this.#getElement().addEventListener(
      'input',
      this.#onInput,
    )
  }

  destroy() {
    const element = this.#getElement()
    element.parentNode.removeChild(element)
  }

  addInputListener(fn) {
    this.#inputListeners.push(fn)
    this.#getElement().addEventListener('input', fn)
  }

  #getElement = () => {
    return document.querySelector(`.${this.id}-control`)
  }

  #onInput = (e) => {
    this.value = e.target.valueAsNumber
    this.#getElement().querySelector(
      'span',
    ).textContent = this.value
  }
}
