import chroma from 'chroma-js'
import { callAtInterval } from '../../util.mjs'
import Entity from './Entity.mjs'
import EntityTypes from './EntityTypes.mjs'
import Quirks from './Quirks.mjs'

export default class FlowField extends Entity {
  static entityType = EntityTypes.FLOW_FIELD

  static Modes = {
    ALGORITHMIC: 'ALGORITHMIC',
    GRID: 'GRID',
  }

  /**
   * @param {Object} options
   * @param {import('p5')} options.p
   */
  constructor({
    p,
    w = p.width,
    h = p.height,
    resolution = 20,
    vectorPool,
    noiseScale = 0.01,
    forceMagnitude = 1,
    angleOffset = 0,
    zOffset = 0,
    mode = FlowField.Modes.ALGORITHMIC,
    visualize = false,
  }) {
    super()
    this.p = p
    this.w = w
    this.h = h
    this.resolution = resolution
    this.vectorPool = vectorPool

    this.noiseScale = noiseScale
    this.forceMagnitude = forceMagnitude
    this.angleOffset = angleOffset
    this.zOffset = zOffset
    this.mode = mode
    this.visualize = visualize

    this.cols = Math.floor(w / resolution)
    this.rows = Math.floor(h / resolution)

    this.grid = new Array(this.cols * this.rows)
    for (let i = 0; i < this.grid.length; i++) {
      this.grid[i] = p.createVector()
    }

    this.totalGridWidth = this.cols * resolution
    this.totalGridHeight = this.rows * resolution
    this.xOffset = (w - this.totalGridWidth) / 2
    this.yOffset = (h - this.totalGridHeight) / 2
  }

  updateState(state) {
    Object.assign(this, state)
  }

  update() {
    if (this.mode === FlowField.Modes.GRID) {
      const { resolution: r } = this
      for (let y = 0; y < this.rows; y++) {
        for (let x = 0; x < this.cols; x++) {
          const index = x + y * this.cols
          const position = this.vectorPool.get()
          const gridPosX = x * r + this.xOffset + r / 2
          const gridPosY = y * r + this.yOffset + r / 2
          position.set(gridPosX - this.w / 2, gridPosY - this.h / 2)
          this.#angleForPosition(position, this.grid[index])
          this.vectorPool.release(position)
        }
      }
    }
  }

  applyForceTo(position, outputVector) {
    if (this.mode === FlowField.Modes.GRID) {
      const adjustedX = position.x - this.xOffset
      const adjustedY = position.y - this.yOffset

      const x = Math.floor(adjustedX / this.resolution)
      const y = Math.floor(adjustedY / this.resolution)

      if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) {
        return outputVector.set(0, 0)
      }

      const index = x + y * this.cols
      const point = this.grid[index]
      return outputVector.set(point.x, point.y)
    }

    return this.#angleForPosition(position, outputVector)
  }

  display() {
    if (!this.visualize) {
      return
    }

    const color = chroma('magenta').rgba()

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const position = this.vectorPool.get()
        position.set(
          x * this.resolution + this.xOffset + this.resolution / 2,
          y * this.resolution + this.yOffset + this.resolution / 2,
        )

        const force = this.vectorPool.get()
        this.applyForceTo(position, force)
        const scaledForce = force.copy().mult(this.resolution * 2)

        const angle = force.heading()
        const angleOffset = this.p.radians(30)
        const arrowSize = 5

        const arrowTip = p5.Vector.add(position, scaledForce)
        const arrowBase = p5.Vector.sub(
          arrowTip,
          p5.Vector.mult(force, arrowSize),
        )

        this.p.stroke(color)
        this.p.strokeWeight(1)
        this.p.line(position.x, position.y, arrowBase.x, arrowBase.y)

        const x1 = arrowTip.x - arrowSize * Math.cos(angle - angleOffset)
        const y1 = arrowTip.y - arrowSize * Math.sin(angle - angleOffset)
        const x2 = arrowTip.x - arrowSize * Math.cos(angle + angleOffset)
        const y2 = arrowTip.y - arrowSize * Math.sin(angle + angleOffset)

        this.p.noStroke()
        this.p.fill(color)
        this.p.triangle(arrowTip.x, arrowTip.y, x1, y1, x2, y2)

        this.vectorPool.release(position)
        this.vectorPool.release(force)
      }
    }
  }

  #angleForPosition(position, outputVector) {
    const x = position.x * this.noiseScale
    const y = position.y * this.noiseScale

    const angle =
      this.p.map(this.p.noise(x, y, this.zOffset), 0, 1, 0, this.p.TWO_PI) +
      this.p.sin(this.p.radians(this.angleOffset))

    outputVector.set(this.p.cos(angle), this.p.sin(angle))

    outputVector.setMag(
      this.hasQuirk(Quirks.BLACK_HOLED)
        ? this.quirks.get(Quirks.BLACK_HOLED).context.forceMagnitude
        : this.forceMagnitude,
    )

    return outputVector
  }
}
