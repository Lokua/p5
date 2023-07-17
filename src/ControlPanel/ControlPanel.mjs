export default class ControlPanel {
  static defaultSelector = '#dynamic-controls'

  constructor({
    id,
    controls,
    selector = ControlPanel.defaultSelector,
    inputHandler,
    attemptReload = false,
  }) {
    this.id = id
    this.controls = controls
    this.validateControls()
    this.selector = selector
    this.inputHandler = inputHandler
    this.attemptReload = attemptReload

    if (this.attemptReload && !this.id) {
      throw new Error('Cannot attemptReload without an id.')
    }
  }

  validateControls() {
    Object.entries(this.controls).forEach(
      ([key, { name }]) => {
        if (key !== name) {
          throw new Error(
            `Invalid control name "${name}" provided for key "${key}"`,
          )
        }
      },
    )
  }

  init() {
    this.html()
    this.#mapControls((control) => control.bind())
    this.inputHandler && this.onInput(this.inputHandler)
    if (this.attemptReload && this.id) {
      console.info(
        '[ControlPanel] restoring from localStorage',
      )
      this.localStorageKey = `ControlPanel-${this.id}`
      this.#reloadControls()
    }
  }

  html() {
    this.#getElement().innerHTML = this.#mapControls(
      (control) => control.html(),
    ).join('\n')
  }

  onInput(fn) {
    this.#mapControls((control) => {
      control.addInputListener((e) => {
        fn(e)
        if (this.attemptReload && this.id) {
          localStorage.setItem(
            this.localStorageKey,
            JSON.stringify(this.values()),
          )
        }
      })
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

  #reloadControls = () => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(this.localStorageKey),
      )
      this.#mapControls((control) => {
        const value = saved[control.name]
        if (value !== undefined && value !== null) {
          control.setValue(value)
        } else {
          console.warn(
            '[ControlPanel] skipping nil value for',
            control.name,
          )
        }
      })
    } catch (error) {
      console.error(error)
      console.warn(
        '[ControlPanel] failed to restore from localStorage',
      )
    }
  }
}
