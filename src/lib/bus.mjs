class Bus {
  handlers = {}

  on(event, handler) {
    this.handlers[event] = this.handlers[event] || []
    this.handlers[event].push(handler)
  }

  emit(event, ...args) {
    ;(this.handlers[event] || []).forEach((fn) => {
      fn(...args)
    })
  }
}

export default new Bus()
