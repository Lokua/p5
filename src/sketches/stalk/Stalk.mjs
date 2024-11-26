export default class Stalk {
  /**
   * @param {Object} params
   * @param {import('p5')} params.p
   */
  constructor({
    p,
    w = p.width,
    h = p.height,
    amplitudeY,
    amplitudeZ,
    frequency,
    scale,
    color,
    buds = [],
    setPhase,
  }) {
    this.p = p
    this.w = w
    this.h = h
    this.amplitudeY = amplitudeY
    this.amplitudeZ = amplitudeZ
    this.frequency = frequency
    this.scale = scale
    this.color = color
    this.buds = buds
    this.phase = 0
    this.setPhase = setPhase
    this.margin = 50
    this.xStart = -w / 2 - this.margin
    this.xEnd = w / 2 + this.margin
  }

  addBud(bud) {
    this.buds.push(bud)
  }

  update(state) {
    Object.assign(this, state)
    for (const bud of this.buds) {
      bud.update()
    }
  }

  draw() {
    this.p.noFill()
    this.p.stroke(this.color)

    this.p.$.shape(() => {
      for (let x = this.xStart; x <= this.xEnd; x += 1) {
        const theta = x / this.scale + this.phase
        const y = this.amplitudeY * Math.cos(this.frequency * theta)
        const z = this.amplitudeZ * Math.sin(this.frequency * theta)
        this.p.vertex(x, y, z)
      }
    })

    for (const bud of this.buds) {
      const budX = this.p.lerp(this.xStart, this.xEnd, bud.position % 1)
      const theta = budX / this.scale + this.phase
      const y = this.amplitudeY * Math.cos(this.frequency * theta)
      const z = this.amplitudeZ * Math.sin(this.frequency * theta)

      this.p.$.pushPop(() => {
        this.p.translate(budX, y, z)
        bud.draw()
      })
    }

    this.phase = this.setPhase(this.phase)
  }
}
