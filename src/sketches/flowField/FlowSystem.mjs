import chroma from 'chroma-js'
import FlowField from './FlowField.mjs'
import Particle from './Particle.mjs'
import Pollinator from './Pollinator.mjs'
import VectorPool from './VectorPool.mjs'
import FlowParticle from './FlowParticle.mjs'
import BlackHole from './BlackHole.mjs'
import Obstacle from './Obstacle.mjs'

export default class FlowSystem {
  #particleBuffer
  #vectorPool

  constructor({ p, w = p.width, h = p.height, initialState = {} }) {
    this.p = p
    this.w = w
    this.h = h
    this.center = p.createVector(w / 2, h / 2)

    this.#vectorPool = new VectorPool(p)
    this.#particleBuffer = p.createGraphics(w, h)
    this.#particleBuffer.colorMode(p.RGB, 255, 255, 255, 1)

    this.state = {
      showParticles: true,
      showObstacles: false,
      showBlackHole: false,
      showAttractors: false,
      showField: false,
      edgeMode: Particle.EdgeModes.WRAP,
      applyRandomForce: false,
      particleCount: 3000,
      blackHoleStrength: 1.0,
      history: 5,
      forceMode: FlowField.Modes.ALGORITHMIC,
      noiseScale: 0.01,
      forceMagnitude: 1,
      zOffset: 0,
      angleOffset: 0,
      visualize: false,
      backgroundAlpha: 0.1,
      attractorCount: 0,
      attractorStrength: 1.0,
      ...initialState,
    }

    this.flowField = new FlowField({
      p,
      vectorPool: this.#vectorPool,
      noiseScale: this.state.noiseScale,
      forceMagnitude: this.state.forceMagnitude,
      forceMode: this.state.forceMode,
    })

    this.blackHole = new BlackHole({
      p,
      vectorPool: this.#vectorPool,
      position: p.createVector(this.center.x, this.center.y),
      strength: this.state.blackHoleStrength,
      active: this.state.showBlackHole,
    })

    this.particles = Array.from({ length: 10_001 }).map(
      () =>
        new FlowParticle({
          p,
          buffer: this.#particleBuffer,
          vectorPool: this.#vectorPool,
          colorScale: this.state.colorScale,
          position: p.createVector(p.random(w), p.random(h)),
          edgeMode: this.state.edgeMode,
          applyRandomForce: this.state.applyRandomForce,
          maxHistory: this.state.history,
        }),
    )

    this.obstacles = this.#createObstacles()
    this.attractors = []
  }

  #createObstacles() {
    const size = 100
    const positions = [
      [this.center.x / 2, this.center.y / 2],
      [this.center.x * 1.5, this.center.y / 2],
      [this.center.x * 1.5, this.center.y * 1.5],
      [this.center.x / 2, this.center.y * 1.5],
    ]

    return positions.map(
      ([x, y]) =>
        new Obstacle({
          p: this.p,
          x,
          y,
          w: size,
          h: size,
        }),
    )
  }

  updateState(state) {
    Object.assign(this.state, state)
  }

  update() {
    this.#updateFlowField()
    this.#updateParticles()
    this.#updateAttractors()
    this.blackHole.updateState({
      active: this.state.showBlackHole,
    })
  }

  #updateFlowField() {
    this.flowField.updateState({
      forceMode: this.state.forceMode,
      noiseScale: this.state.noiseScale,
      forceMagnitude: this.state.forceMagnitude,
      zOffset: this.state.zOffset,
      visualize: this.state.showField,
      angleOffset: this.state.angleOffset,
    })
    this.flowField.update()
  }

  #updateParticles() {
    if (this.state.showParticles) {
      let activeCount = 0
      for (const particle of this.particles) {
        if (activeCount >= this.state.particleCount) {
          particle.active = false
          continue
        }

        if (particle.active) {
          this.#updateActiveParticle(particle)
          if (particle.active) {
            activeCount++
          }
        } else if (activeCount < this.state.particleCount) {
          this.#reanimateParticle(particle)
          activeCount++
        }
      }
    }
  }

  #updateActiveParticle(particle) {
    const { edgeMode, applyRandomForce, history } = this.state

    particle.updateState({
      maxHistory: history,
      edgeMode,
      applyRandomForce,
    })

    this.#applyObstacles(particle)
    this.#applyForces(particle)

    particle.update()
    particle.edges()
  }

  #applyObstacles(particle) {
    if (this.state.showObstacles) {
      for (const obstacle of this.obstacles) {
        obstacle.interactWith(particle)
      }
    }
  }

  #applyForces(particle) {
    const force = this.#vectorPool.get()
    this.flowField.applyForceTo(particle.position, force)

    this.blackHole.interactWith(particle, force)

    if (this.state.showAttractors) {
      for (const attractor of this.attractors) {
        attractor.interactWith(particle, force)
      }
    }

    particle.applyForce(force)
    this.#vectorPool.release(force)
  }

  #reanimateParticle(particle) {
    const position = this.#findValidPosition()
    particle.reset(position)
    this.#vectorPool.release(position)
  }

  #findValidPosition() {
    let position

    do {
      const testPosition = this.#vectorPool
        .get()
        .set(this.p.random(this.w), this.p.random(this.h))

      if (this.#isPositionValid(testPosition)) {
        position = testPosition
      } else {
        this.#vectorPool.release(testPosition)
      }
    } while (!position)

    return position
  }

  #isPositionValid(position) {
    if (this.state.showBlackHole && this.blackHole?.contains({ position })) {
      return false
    }

    if (this.state.showObstacles) {
      return !this.obstacles.some((obstacle) => obstacle.contains({ position }))
    }

    return true
  }

  #updateAttractors() {
    if (this.state.showAttractors) {
      this.#createOrRemoveAttractors()

      for (const attractor of this.attractors) {
        attractor.updateState({
          strength: this.state.attractorStrength,
          active: this.state.showAttractors,
        })

        for (const otherAttractor of this.attractors) {
          if (otherAttractor !== attractor) {
            const outputForce = this.#vectorPool.get()
            attractor.interactWith(otherAttractor, outputForce)
            this.#vectorPool.release(outputForce)
          }
        }

        if (this.state.showObstacles) {
          for (const obstacle of this.obstacles) {
            obstacle.interactWith(attractor)
          }
        }

        const force = this.#vectorPool.get()

        const blackHoleForce = this.#vectorPool.get()
        this.blackHole.interactWith(attractor, blackHoleForce)
        force.add(blackHoleForce)

        attractor.applyForce(force)
        this.#vectorPool.release(force)
        attractor.update()
        attractor.edges()
      }
    }
  }

  #createOrRemoveAttractors() {
    if (this.attractors.length < this.state.attractorCount) {
      this.#addAttractors()
    } else if (this.attractors.length > this.state.attractorCount) {
      this.#removeAttractors()
    }
  }

  #addAttractors() {
    while (this.attractors.length < this.state.attractorCount) {
      this.attractors.push(
        new Pollinator({
          p: this.p,
          colorScale: this.state.attractorColorScale,
          position: this.#vectorPool
            .get()
            .set(this.p.random(this.w), this.p.random(this.h)),
          strength: this.state.attractorStrength,
          vectorPool: this.#vectorPool,
        }),
      )
    }
  }

  #removeAttractors() {
    while (this.attractors.length > this.state.attractorCount) {
      this.attractors.pop().destroy()
    }
  }

  display() {
    this.#particleBuffer.background(
      chroma('black').alpha(this.state.backgroundAlpha).rgba(),
    )

    if (this.state.showParticles) {
      for (const particle of this.particles) {
        if (particle.active) {
          particle.display()
        }
      }
      this.p.image(this.#particleBuffer, 0, 0, this.w, this.h)
    }

    if (this.state.showObstacles) {
      for (const obstacle of this.obstacles) {
        obstacle.display()
      }
    }

    this.blackHole.display()

    if (this.state.showAttractors) {
      for (const attractor of this.attractors) {
        attractor.display()
      }
    }

    if (this.state.showField) {
      this.flowField.display()
    }
  }
}
