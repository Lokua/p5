export default class VectorPool {
  static stubPool(p) {
    return {
      get: () => p.createVector(0, 0),
      release() {},
    }
  }

  constructor(p) {
    this.p = p
    this.vectors = []
  }

  get() {
    const vector = this.vectors.pop() || this.p.createVector(0, 0)
    vector._debugId = Math.random()
    return vector
  }

  release(vector) {
    if (!vector._debugId) {
      console.warn('Releasing vector not created from this pool!')
    }
    vector.set(0, 0)
    this.vectors.push(vector)
  }
}
