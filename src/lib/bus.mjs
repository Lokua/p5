class Bus {
  handlers = {}

  on(event, handler) {
    this.handlers[event] = this.handlers[event] || []
    this.handlers[event].push(handler)
    return () => {
      this.off(event, handler)
    }
  }

  off(event, handler) {
    if (this.handlers[event]) {
      this.handlers[event] = this.handlers[event].filter((fn) => fn !== handler)
      if (this.handlers[event].length === 0) {
        delete this.handlers[event]
      }
    }
  }

  emit(event, ...args) {
    ;(this.handlers[event] || []).forEach((fn) => {
      fn(...args)
    })
  }
}

export default new Bus()
