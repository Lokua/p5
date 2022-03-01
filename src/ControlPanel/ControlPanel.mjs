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
    this.inputHandler ?? this.onInput(this.inputHandler)
  }

  html() {
    this.#getElement().innerHTML = this.#mapControls(
      (control) => control.html(),
    ).join('\n')
  }

  destroy() {
    this.#getElement().innerHTML = ''
  }

  onInput(fn) {
    this.#mapControls((control) => {
      control.addInputListener(fn)
    })
  }

  #getElement = () => document.querySelector(this.selector)

  #mapControls = (fn) =>
    Object.values(this.controls).map(fn)
}
