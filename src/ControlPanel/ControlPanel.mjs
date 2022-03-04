export default class ControlPanel {
  static defaultSelector = '#dynamic-controls'

  constructor({
    controls,
    selector = ControlPanel.defaultSelector,
    inputHandler,
  }) {
    this.controls = controls
    this.selector = selector
    this.inputHandler = inputHandler
  }

  init() {
    this.html()
    this.#mapControls((control) => control.bind())
    this.inputHandler && this.onInput(this.inputHandler)
  }

  html() {
    this.#getElement().innerHTML = this.#mapControls(
      (control) => control.html(),
    ).join('\n')
  }

  onInput(fn) {
    this.#mapControls((control) => {
      control.addInputListener(fn)
    })
  }

  values() {
    return Object.entries(this.controls).reduce(
      (acc, [key, { value }]) => ({
        ...acc,
        [key]: value,
      }),
      {},
    )
  }

  get(key) {
    return this.controls[key].value
  }

  destroy() {
    this.#getElement().innerHTML = ''
  }

  #getElement = () => document.querySelector(this.selector)

  #mapControls = (fn) =>
    Object.values(this.controls).map(fn)
}
