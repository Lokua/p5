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

  static ALGORITHMS = {
    DEFAULT: 'DEFAULT',
    MULTI_ANGLE: 'MULTI_ANGLE',
    HARMONIC_PATTERN: 'HARMONIC_PATTERN',
    VORTEX_INFLUENCE: 'VORTEX_INFLUENCE',
    WAVE_INTERFERENCE: 'WAVE_INTERFERENCE',
    MATH_1: 'MATH_1',
    MAGNETIC: 'MAGNETIC',
    SOFT_BODY: 'SOFT_BODY',
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
    algorithm = FlowField.ALGORITHMS.DEFAULT,
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
    this.algorithm = algorithm

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
    if (this.algorithm === FlowField.ALGORITHMS.DEFAULT) {
      const x = position.x * this.noiseScale
      const y = position.y * this.noiseScale

      const angle =
        this.p.map(this.p.noise(x, y, this.zOffset), 0, 1, 0, this.p.TWO_PI) +
        this.#getSinOfAngleOffset()

      outputVector.set(this.p.cos(angle), this.p.sin(angle))
      outputVector.setMag(this.#getForceMagnitude())
      return outputVector
    } else if (this.algorithm === FlowField.ALGORITHMS.MULTI_ANGLE) {
      const x = position.x * this.noiseScale
      const y = position.y * this.noiseScale

      const baseAngle = this.p.noise(x, y, this.zOffset)
      const mediumAngle = this.p.noise(x * 2, y * 2, this.zOffset * 1.5) * 0.5
      const fineAngle = this.p.noise(x * 4, y * 4, this.zOffset * 2) * 0.25

      const angle =
        this.p.map(
          baseAngle + mediumAngle + fineAngle,
          0,
          1.75,
          0,
          this.p.TWO_PI,
        ) + this.#getSinOfAngleOffset()

      outputVector.set(this.p.cos(angle), this.p.sin(angle))
      outputVector.setMag(this.#getForceMagnitude())
      return outputVector
    } else if (this.algorithm === FlowField.ALGORITHMS.HARMONIC_PATTERN) {
      const x = position.x * this.noiseScale
      const y = position.y * this.noiseScale

      this.harmonicFreq1 = 0.03
      this.harmonicFreq2 = this.harmonicFreq1 * 1.618
      this.harmonicAmp1 = 0.6
      this.harmonicAmp2 = this.harmonicAmp1 * 0.6

      const distance = this.p.sqrt(x * x + y * y)
      const harmonicPattern =
        this.p.sin(distance * this.harmonicFreq1) * this.harmonicAmp1 +
        this.p.sin(distance * this.harmonicFreq2) * this.harmonicAmp2

      const totalAmp = Math.abs(this.harmonicAmp1) + Math.abs(this.harmonicAmp2)

      const angle =
        this.p.map(
          this.p.noise(x, y, this.zOffset) + harmonicPattern,
          -totalAmp,
          1 + totalAmp,
          0,
          this.p.TWO_PI,
        ) + this.#getSinOfAngleOffset()

      outputVector.set(this.p.cos(angle), this.p.sin(angle))
      outputVector.setMag(this.#getForceMagnitude())
      return outputVector
    } else if (this.algorithm === FlowField.ALGORITHMS.VORTEX_INFLUENCE) {
      this.vortexPoints = this.vortexPoints || [
        {
          position: this.p.createVector(this.w / 2, this.h / 2),
          strength: 200,
          radius: 100,
        },
      ]

      const vortexInfluence = this.p.createVector(0, 0)

      this.vortexPoints.forEach((vortex) => {
        const diff = p5.Vector.sub(position, vortex.position)
        const distance = diff.mag()
        if (distance < vortex.radius) {
          const strength = this.p.map(
            distance,
            0,
            vortex.radius,
            vortex.strength,
            0,
          )
          diff.rotate(this.p.HALF_PI)
          vortexInfluence.add(diff.setMag(strength))
        }
      })

      const x = position.x * this.noiseScale
      const y = position.y * this.noiseScale
      const noiseAngle =
        this.p.map(this.p.noise(x, y, this.zOffset), 0, 1, 0, this.p.TWO_PI) +
        this.#getSinOfAngleOffset()

      outputVector.set(this.p.cos(noiseAngle), this.p.sin(noiseAngle))
      outputVector.add(vortexInfluence)
      outputVector.setMag(this.#getForceMagnitude())
      return outputVector
    } else if (this.algorithm === FlowField.ALGORITHMS.WAVE_INTERFERENCE) {
      const x = position.x * this.noiseScale
      const y = position.y * this.noiseScale

      const waveSources = [
        { x: 0, y: 0, frequency: 0.05, amplitude: 1 },
        { x: this.w, y: 0, frequency: 0.03, amplitude: 0.8 },
        { x: this.w / 2, y: this.h, frequency: 0.04, amplitude: 0.9 },
      ]

      let waveValue = 0
      waveSources.forEach((source) => {
        const dx = position.x - source.x
        const dy = position.y - source.y
        const distance = this.p.sqrt(dx * dx + dy * dy)
        waveValue += this.p.sin(distance * source.frequency) * source.amplitude
      })

      const angle =
        this.p.map(
          this.p.noise(x, y, this.zOffset) + waveValue,
          -waveSources.reduce((sum, s) => sum + s.amplitude, 0),
          1 + waveSources.reduce((sum, s) => sum + s.amplitude, 0),
          0,
          this.p.TWO_PI,
        ) + this.#getSinOfAngleOffset()

      outputVector.set(this.p.cos(angle), this.p.sin(angle))
      outputVector.setMag(this.#getForceMagnitude())
      return outputVector
    } else if (this.algorithm === FlowField.ALGORITHMS.MATH_1) {
      // Normalize coordinates to -1 to 1 range
      const nx = (position.x - this.w / 2) / (this.w / 2)
      const ny = (position.y - this.h / 2) / (this.h / 2)

      const re = nx * nx - ny * ny
      const im = 2 * nx * ny

      const angle = this.p.atan2(im, re)

      const noiseAngle =
        this.p.map(
          this.p.noise(
            position.x * this.noiseScale,
            position.y * this.noiseScale,
            this.zOffset,
          ),
          0,
          1,
          0,
          this.p.TWO_PI,
        ) + this.#getSinOfAngleOffset()

      const blendedAngle = this.p.lerp(angle, noiseAngle, 0.5)

      outputVector.set(this.p.cos(blendedAngle), this.p.sin(blendedAngle))
      outputVector.setMag(this.#getForceMagnitude())
      return outputVector
    } else if (this.algorithm === FlowField.ALGORITHMS.MAGNETIC) {
      const poles = [
        {
          position: this.p.createVector(this.w / 3, this.h / 2),
          strength: 1,
        },
        {
          position: this.p.createVector((2 * this.w) / 3, this.h / 2),
          strength: -1,
        },
      ]
      outputVector.set(0, 0)
      poles.forEach((pole) => {
        const r = p5.Vector.sub(position, pole.position)
        const rSquared = r.magSq()
        // Perpendicular to create circular field
        r.rotate(this.p.HALF_PI)
        // Add 1 to avoid division by zero
        r.setMag(pole.strength / (rSquared + 1))
        outputVector.add(r)
      })

      const x = position.x * this.noiseScale
      const y = position.y * this.noiseScale
      const noiseAngle =
        this.p.map(this.p.noise(x, y, this.zOffset), 0, 1, 0, this.p.TWO_PI) +
        this.#getSinOfAngleOffset()

      const noiseVector = this.p.createVector(
        this.p.cos(noiseAngle),
        this.p.sin(noiseAngle),
      )

      outputVector.lerp(noiseVector, 0.3)
      outputVector.setMag(this.#getForceMagnitude())
      return outputVector
    } else if (this.algorithm === FlowField.ALGORITHMS.SOFT_BODY) {
      this.metaballs = this.metaballs || [
        {
          position: this.p.createVector(this.w / 2, this.h / 2),
          radius: 100,
        },
        {
          position: this.p.createVector(this.w / 3, this.h / 3),
          radius: 80,
        },
        {
          position: this.p.createVector((2 * this.w) / 3, (2 * this.h) / 3),
          radius: 120,
        },
      ]

      let totalInfluence = 0
      this.metaballs.forEach((ball) => {
        const dist = position.dist(ball.position)
        totalInfluence += (ball.radius * ball.radius) / (dist * dist)
      })

      const baseAngle =
        this.p.map(
          this.p.noise(
            position.x * this.noiseScale * totalInfluence,
            position.y * this.noiseScale * totalInfluence,
            this.zOffset,
          ),
          0,
          1,
          0,
          this.p.TWO_PI,
        ) + this.#getSinOfAngleOffset()

      outputVector.set(this.p.cos(baseAngle), this.p.sin(baseAngle))
      outputVector.setMag(
        this.#getForceMagnitude() * (totalInfluence > 1 ? 2 : 1),
      )
      return outputVector
    }
  }

  #getSinOfAngleOffset() {
    return this.p.sin(this.p.radians(this.angleOffset))
  }

  #getForceMagnitude() {
    return this.hasQuirk(Quirks.BLACK_HOLED)
      ? this.quirks.get(Quirks.BLACK_HOLED).context.forceMagnitude
      : this.forceMagnitude
  }
}
