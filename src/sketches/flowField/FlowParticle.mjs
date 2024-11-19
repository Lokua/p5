import chroma from 'chroma-js'
import { inheritStaticProperties } from '../../util.mjs'
import EntityTypes from './EntityTypes.mjs'
import Particle from './Particle.mjs'
import Quirks from './Quirks.mjs'

export default class FlowParticle extends Particle {
  static {
    inheritStaticProperties(this, Particle)
  }

  static entityType = EntityTypes.FLOW_PARTICLE

  constructor({
    p,
    colorScale,
    opacity = 0,
    applyRandomForce = false,
    maxHistory = 5,
    ...rest
  }) {
    super({
      p,
      ...rest,
    })
    this.colorScale = colorScale
    this.color = colorScale(p.random())
    this.applyRandomForce = applyRandomForce
    this.opacity = opacity
    this.maxOpacity = 0.9
    this.diameter = p.random(0.25, 3)
    this.history = []
    this.maxHistory = maxHistory
    this.lifespan = 255
  }

  update() {
    this.history.unshift(this.vectorPool.get().set(this.position))

    super.update()

    if (this.opacity < this.maxOpacity) {
      this.opacity = this.p.constrain(this.opacity + 0.01, 0, this.maxOpacity)
    }

    if (this.applyRandomForce) {
      this.applyForce(p5.Vector.random2D().setMag(0.2))
    }

    const maxIndex = this.maxHistory - 1
    if (this.history.length > maxIndex) {
      while (this.history.length > maxIndex) {
        const oldPosition = this.history.pop()
        this.vectorPool.release(oldPosition)
      }
    }
  }

  display() {
    if (!this.active) {
      return
    }

    const baseColor = this.hasQuirk(Quirks.MARKED_FOR_DEATH)
      ? chroma.mix(this.color, 'magenta', 0.2)
      : this.color

    let prev = this.position

    for (const [index, position] of this.history.entries()) {
      const distance = this.p.dist(position.x, position.y, prev.x, prev.y)
      const threshold = Math.min(this.w, this.h) / 2

      if (distance < threshold) {
        const value = this.maxHistory - index
        const opacity = this.p.map(value, 0, this.maxHistory, 0, this.opacity)
        this.buffer.stroke(baseColor.alpha(opacity).rgba())
        this.buffer.line(prev.x, prev.y, position.x, position.y)
      }

      prev = position
    }

    const color = baseColor.alpha(this.opacity).rgba()
    this.buffer.fill(color)
    this.buffer.stroke(color)
    this.buffer.circle(this.position.x, this.position.y, this.diameter)
  }

  edges() {
    if (this.edgeMode === FlowParticle.EdgeModes.WRAP) {
      let wrapped = false

      if (this.position.x > this.w) {
        this.position.x = 0
        wrapped = true
      }
      if (this.position.x < 0) {
        this.position.x = this.w
        wrapped = true
      }
      if (this.position.y > this.h) {
        this.position.y = 0
        wrapped = true
      }
      if (this.position.y < 0) {
        this.position.y = this.h
        wrapped = true
      }

      if (wrapped && this.hasQuirk(Quirks.MARKED_FOR_DEATH)) {
        this.active = false
        this.removeQuirk(Quirks.MARKED_FOR_DEATH)
      }
    } else {
      super.edges()
    }
  }

  reset(position) {
    super.reset(position)
    this.color = this.colorScale(this.p.random())
    this.removeQuirk(Quirks.MARKED_FOR_DEATH)
    this.history.forEach((vector) => {
      this.vectorPool.release(vector)
    })
    this.history = []
  }
}
