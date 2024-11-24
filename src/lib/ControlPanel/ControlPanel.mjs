import { formatLog, logInfo } from '../../util.mjs'

export default class ControlPanel {
  static defaultSelector = '#dynamic-controls'

  constructor({
    p,
    id,
    controls,
    selector = ControlPanel.defaultSelector,
    attemptReload = true,
    autoRedraw = true,
    onChange = null,
    compact = false,
  }) {
    this.p = p
    this.id = id
    this.controls = Object.fromEntries(
      Object.entries(controls).filter(([, control]) => !control.disabled),
    )
    this.#validateControls()
    this.selector = selector
    this.attemptReload = attemptReload
    this.autoRedraw = autoRedraw
    this.onChange = onChange
    this.compact = compact

    if (this.attemptReload && !this.id) {
      throw new Error('Cannot attemptReload without an id.')
    }

    this.#defineControlProperties()
  }

  #defineControlProperties() {
    for (const [key, control] of Object.entries(this.controls)) {
      if (key in this) {
        throw new Error(
          formatLog(`
            Control key "${key}" conflicts with an existing property 
            or method on ControlPanel. Please use a unique name.
          `),
        )
      }

      Object.defineProperty(this, key, {
        get() {
          return control.value
        },
        set(newValue) {
          control.setValue(newValue)
        },
        enumerable: true,
        configurable: true,
      })
    }
  }

  init() {
    this.html()
    this.#mapControls((control) => {
      control.bind()
      control.addInputListener(() => {
        if (this.onChange) {
          this.onChange()
        }
        if (this.autoRedraw && !this.p.isLooping()) {
          this.p.redraw()
        }
        if (this.attemptReload && this.id) {
          localStorage.setItem(
            this.localStorageKey,
            JSON.stringify(this.values()),
          )
        }
      })
    })
    if (this.attemptReload && this.id) {
      logInfo('[ControlPanel] restoring from localStorage')
      this.localStorageKey = `@lokua/p5/controlPanel/${this.id}`
      this.#reloadControls()
    }
    if (this.compact) {
      const elements = Array.from(
        this.#getElement().querySelectorAll('.control'),
      )
      elements.forEach((element) => {
        element.classList.add('control-compact')
      })
    }
  }

  html() {
    this.#getElement().innerHTML = this.#mapControls((control) =>
      control.html(),
    ).join('\n')
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
    this.#mapControls((control) => {
      control?.destroy?.()
    })
  }

  #validateControls() {
    Object.entries(this.controls).forEach(([key, { name }]) => {
      if (key !== name) {
        throw new Error(
          formatLog(`
            Invalid control name "${name}" provided for key "${key}". 
            Please make sure key and name match.
          `),
        )
      }
    })
  }

  #getElement() {
    return document.querySelector(this.selector)
  }

  #mapControls(fn) {
    return Object.values(this.controls).map(fn)
  }

  #reloadControls() {
    try {
      const saved = JSON.parse(localStorage.getItem(this.localStorageKey))
      this.#mapControls((control) => {
        const value = saved[control.name]
        if (value !== undefined && value !== null) {
          control.setValue(value)
        } else if (control.type !== 'button' && control.type !== 'file') {
          console.warn('[ControlPanel] skipping nil value for', control.name)
        }
      })
    } catch {
      console.warn('[ControlPanel] failed to restore from localStorage')
    }
  }
}
