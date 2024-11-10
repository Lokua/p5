import Control from './Control.mjs'

export default class File extends Control {
  constructor({ name, handler, ...rest }) {
    super({
      name,
      value: null,
      hasLabelValue: false,
      hasLabel: false,
      type: 'file',
      ...rest,
    })
    this.handler = handler
    this.hasActualFile = false
  }

  html() {
    return super.html(`
      <input 
        type="file" 
        id="${this.id}-file-input" 
        accept="image/png, image/jpg, image/jpeg"
      >
      <button type="file" id="${this.id}">
        ${this.hasActualFile ? this.value : this.name}
      </button>
    `)
  }

  #getFileInput() {
    return document.getElementById(`${this.id}-file-input`)
  }

  bind() {
    const element = document.getElementById(this.id)
    element.addEventListener('click', this.onClick)
    this.#getFileInput().addEventListener('change', this.onClickFile)
  }

  addInputListener(fn) {
    document.getElementById(this.id).addEventListener('click', fn)
  }

  onClick = () => {
    this.#getFileInput().click()
  }

  onClickFile = (e) => {
    const file = e.target.files[0]
    this.setValue(file.name)
    document.getElementById(this.id).textContent = this.value
    this.handler?.(file)
  }

  setValue(value) {
    this.value = value
  }
}
