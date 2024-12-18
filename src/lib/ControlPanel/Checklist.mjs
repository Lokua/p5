import Control from './Control.mjs'

export default class Checklist extends Control {
  constructor({ name, options, ...rest }) {
    super({
      name,
      value: options,
      type: 'checklist',
      hasLabelValue: false,
      labelHasFor: false,
      ...rest,
    })
  }

  get options() {
    return this.value
  }

  html() {
    return super.html(
      ` <!-- dummy input to silence chrome warning about label for/id missing -->
        <!-- ^ DOESN'T WORK -->
        <input id="${this.id}" type="hidden">
        ${Object.entries(this.options)
          .map(
            ([label, value]) =>
              `<fieldset>
                <label for="${this.id}-${label}">
                  <input 
                    id="${this.id}-${label}" 
                    type="checkbox" 
                    ${value ? 'checked' : ''}
                    data-label="${label}"
                  >
                  ${label}
                </label>
              </fieldset>
            `,
          )
          .join('\n')}
      `,
      `id="${this.id}"`,
    )
  }

  bind() {
    Object.entries(this.options).forEach(([option]) => {
      document
        .getElementById(`${this.id}-${option}`)
        .addEventListener('change', this.onChange)
    })
  }

  addInputListener(fn) {
    Object.entries(this.options).forEach(([option]) => {
      document
        .getElementById(`${this.id}-${option}`)
        .addEventListener('change', fn)
    })
  }

  onChange = (e) => {
    this.options[e.target.getAttribute('data-label')] = e.target.checked
  }

  setValue(incomingValue) {
    const incomingKeys = Object.keys(incomingValue)
    this.value = Object.entries(this.value).reduce(
      (options, [label, value]) => {
        const checked = incomingValue[label]

        if (!incomingKeys.includes(label) || typeof checked !== 'boolean') {
          console.warn(
            `[Checklist] ignoring invalid value for ${label}. Using default.`,
          )
          return {
            ...options,
            [label]: value,
          }
        }

        const checkbox = document.getElementById(`${this.id}-${label}`)
        if (checkbox) {
          checkbox.checked = checked
        }

        return {
          ...options,
          [label]: checked,
        }
      },
      {},
    )
  }
}
