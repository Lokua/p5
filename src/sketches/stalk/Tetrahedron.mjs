export default class Tetrahedron {
  /**
   * @param {Object} params
   * @param {import('p5')} params.p
   */
  constructor({ p, sizes = [1, 1, 1, 1], colors, orientation = 'base' }) {
    this.p = p
    this.sizes = sizes
    this.vertices = this.#computeVertices()
    this.colors = colors
    this.orientation = orientation
  }

  update({ sizes, orientation, ...state }) {
    Object.assign(this, state)
    if (sizes || orientation) {
      this.sizes = sizes || this.sizes
      this.orientation = orientation || this.orientation
      this.vertices = this.#computeVertices()
    }
  }

  draw(x = 0, y = 0, z = 0) {
    this.p.push()
    this.p.translate(x, y, z)
    if (this.orientation === 'tip') {
      this.p.rotateX(this.p.PI)
      this.p.translate(0, 0, -this.sizes[0])
    }
    this.p.beginShape(this.p.TRIANGLES)
    const [v0, v1, v2, v3] = this.vertices
    const faces = [
      [v0, v1, v2, this.colors?.[0]],
      [v0, v1, v3, this.colors?.[1]],
      [v0, v2, v3, this.colors?.[2]],
      [v1, v2, v3, this.colors?.[3]],
    ]
    for (const args of faces) {
      this.#drawFace(...args)
    }
    this.p.endShape()
    this.p.pop()
  }

  #computeVertices() {
    const [top, left, right, front] = this.sizes
    return [
      [0, 0, top],
      [-left, -left, 0],
      [right, -right, 0],
      [0, front, 0],
    ]
  }

  #drawFace(v1, v2, v3, color) {
    if (color) {
      this.p.fill(color)
    }
    this.p.vertex(...v1)
    this.p.vertex(...v2)
    this.p.vertex(...v3)
  }
}
