import chroma from 'chroma-js'
import { createControlPanel } from '../lib/ControlPanel/index.mjs'
import AnimationHelper from '../lib/AnimationHelper.mjs'
import { renderSwatches } from '../lib/colors.mjs'
import { onScreen } from '../util.mjs'

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const metadata = {
    name: 'flowField',
    frameRate: 30,
    pixelDensity: 6,
  }
  const [w, h] = [500, 500]
  // eslint-disable-next-line no-unused-vars
  const center = p.createVector(w / 2, h / 2)
  const obstacles = []
  const agents = []
  let agentBuffer

  const colorScale = chroma.scale('Spectral')
  const ah = new AnimationHelper({ p, frameRate: metadata.frameRate, bpm: 130 })

  const controlPanel = createControlPanel({
    p,
    id: metadata.name,
    controls: [
      {
        type: 'Range',
        name: 'count',
        value: 100,
        min: 1,
        max: 10_000,
      },
      {
        type: 'Range',
        name: 'backgroundAlpha',
        value: 0.62,
        min: 0,
        max: 1,
        step: 0.001,
      },
      {
        type: 'Range',
        name: 'noiseScale',
        value: 0.0001,
        min: 0.0001,
        max: 1,
        step: 0.0001,
      },
      {
        type: 'Select',
        name: 'edgeMode',
        value: 'wrap',
        options: ['wrap', 'respawn'],
      },
      {
        type: 'Checkbox',
        name: 'showAgents',
        value: true,
      },
      {
        type: 'Checkbox',
        name: 'showSwatches',
        value: false,
      },
      {
        type: 'Checkbox',
        name: 'visualizeField',
        value: false,
      },
      {
        type: 'Checkbox',
        name: 'applyRandomForce',
        value: false,
      },
      {
        type: 'Checkbox',
        name: 'showObstacles',
        value: false,
      },
    ],
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)
    p.colorMode(p.RGB, 255, 255, 255, 1)
    p.randomSeed(39)
    p.noiseSeed(39)
    agentBuffer = p.createGraphics(w, h)
    agentBuffer.colorMode(p.RGB, 255, 255, 255, 1)

    obstacles.push(new Obstacle(center.x, center.y, 100, 100))

    return {
      canvas,
    }
  }

  function draw() {
    const {
      count,
      showSwatches,
      visualizeField,
      backgroundAlpha,
      edgeMode,
      noiseScale,
      applyRandomForce,
      showAgents,
      showObstacles,
    } = controlPanel.values()

    p.background(0)
    agentBuffer.background(chroma('black').alpha(backgroundAlpha).rgba())

    if (showObstacles) {
      for (const obstacle of obstacles) {
        obstacle.display()
      }
    }

    if (agents.length < count) {
      while (agents.length < count) {
        let position
        while (!position) {
          position = p.createVector(p.random(w), p.random(h))
          if (showObstacles) {
            for (const obstacle of obstacles) {
              if (obstacle.contains({ position })) {
                position = null
              }
            }
          }
        }
        agents.push(
          new Agent({
            position: p.createVector(p.random(w), p.random(h)),
            edgeMode,
            applyRandomForce,
          }),
        )
      }
    } else if (agents.length > count) {
      agents.splice(count, agents.length - count)
    }

    agents.forEach((agent) => {
      agent.edgeMode = edgeMode
      agent.applyRandomForce = applyRandomForce
    })

    for (const agent of agents) {
      if (showObstacles) {
        for (const obstacle of obstacles) {
          if (obstacle.contains(agent)) {
            agent.velocity.mult(-1)
          }
        }
      }
      agent.applyForce(getFlowForce(agent.position, noiseScale))
      agent.update()
      agent.edges()
      // agent.isDead() && agent.reset()
      agent.display()
    }

    showAgents && p.image(agentBuffer, 0, 0, w, h)
    visualizeField && visualizeFlowField(noiseScale)
    showSwatches && renderSwatches({ p, w, scales: [colorScale] })
  }

  function getFlowForce(position, noiseScale) {
    const zOffset = ah.getTotalBeatsElapsed()
    const x = position.x * noiseScale
    const y = position.y * noiseScale
    const value = p.noise(x, y, zOffset)
    const angle = p.map(value, 0, 1, 0, p.TWO_PI)
    const force = p5.Vector.fromAngle(angle)
    force.setMag(0.1)
    return force
  }

  function visualizeFlowField(noiseScale) {
    const useAngleBasedColor = false
    const color = chroma('magenta').rgba()
    const gridSize = 10
    const gridSizeX = w / gridSize
    const gridSizeY = h / gridSize

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const x = i * gridSizeX + gridSizeX / 2
        const y = j * gridSizeY + gridSizeY / 2

        const pos = p.createVector(x, y)
        const force = getFlowForce(pos, noiseScale)
        const scaledForce = p5.Vector.mult(force, 100)

        const angle = force.heading()
        const angleOffset = p.radians(30)
        const arrowSize = 5
        const theColor = useAngleBasedColor
          ? chroma.hsv(p.degrees(angle) % 360, 100, 100).rgba()
          : color

        const arrowTip = p5.Vector.add(pos, scaledForce)
        const arrowBase = p5.Vector.sub(
          arrowTip,
          p5.Vector.mult(force, arrowSize),
        )

        p.stroke(theColor)
        p.strokeWeight(1)
        p.line(pos.x, pos.y, arrowBase.x, arrowBase.y)

        const x1 = arrowTip.x - arrowSize * p.cos(angle - angleOffset)
        const y1 = arrowTip.y - arrowSize * p.sin(angle - angleOffset)
        const x2 = arrowTip.x - arrowSize * p.cos(angle + angleOffset)
        const y2 = arrowTip.y - arrowSize * p.sin(angle + angleOffset)

        p.noStroke()
        p.fill(theColor)
        p.triangle(arrowTip.x, arrowTip.y, x1, y1, x2, y2)
      }
    }
  }

  class Agent {
    constructor({
      position,
      edgeMode = 'wrap',
      opacity = 0,
      applyRandomForce = false,
    }) {
      this.position = position.copy()
      this.velocity = p.createVector(0, 0)
      this.acceleration = p.createVector(0, 0)
      this.maxSpeed = p.random(1, 5)
      this.color = colorScale(p.random())
      this.edgeMode = edgeMode
      this.useVelocityBasedColorScaling = false
      this.applyRandomForce = applyRandomForce
      this.opacity = opacity
      this.diameter = p.random(0.25, 3)
      this.history = []
      this.previousPosition = this.position.copy()
      this.lifespan = 255
    }

    applyForce(force) {
      this.acceleration.add(force)
    }

    update() {
      this.velocity.add(this.acceleration)
      this.velocity.limit(this.maxSpeed)
      this.position.add(this.velocity)
      this.acceleration.mult(0)
      this.lifespan -= 2

      if (this.opacity < 1) {
        this.opacity = p.constrain(this.opacity + 0.01, 0, 1)
      }

      if (this.applyRandomForce) {
        const randomForce = p5.Vector.random2D()
        randomForce.setMag(0.05)
        this.applyForce(randomForce)
      }
    }

    display() {
      agentBuffer.noStroke()

      if (this.useVelocityBasedColorScaling) {
        const speed = this.velocity.mag()
        const color = colorScale(speed / this.maxSpeed)
          .alpha(this.opacity)
          .rgba()
        agentBuffer.fill(color)
        agentBuffer.stroke(color)
      } else {
        const color = this.color.alpha(this.opacity).rgba()
        agentBuffer.fill(color)
        agentBuffer.stroke(color)
      }

      agentBuffer.circle(this.position.x, this.position.y, this.diameter)
      agentBuffer.line(
        this.position.x,
        this.position.y,
        this.previousPosition.x,
        this.previousPosition.y,
      )
      this.previousPosition = this.position.copy()
    }

    isDead() {
      return this.lifespan < 0
    }

    edges() {
      if (this.edgeMode === 'wrap') {
        if (this.position.x > w) {
          this.position.x = 0
          this.previousPosition.x = 0
        }
        if (this.position.x < 0) {
          this.position.x = w
          this.previousPosition.x = w
        }
        if (this.position.y > h) {
          this.position.y = 0
          this.previousPosition.y = 0
        }
        if (this.position.y < 0) {
          this.position.y = h
          this.previousPosition.y = h
        }
      } else if (this.edgeMode === 'respawn') {
        if (!this.onScreen()) {
          this.position = p.createVector(p.random(w), p.random(h))
          this.previousPosition = this.position.copy()
          this.opacity = 0
        }
      }
    }

    onScreen() {
      return onScreen(this.position, w, h)
    }

    reset() {
      this.position = p.createVector(p.random(w), p.random(h))
      this.lifespan = 255
      this.velocity.mult(0)
      this.opacity = 0
    }
  }

  class Obstacle {
    constructor(x, y, w, h) {
      this.position = p.createVector(x, y)
      this.w = w
      this.h = h
    }

    display() {
      p.fill('black')
      p.noStroke()
      p.rectMode(p.CENTER)
      p.rect(this.position.x, this.position.y, this.w, this.h)
    }

    contains(agent) {
      return (
        agent.position.x > this.position.x - this.w / 2 &&
        agent.position.x < this.position.x + this.w / 2 &&
        agent.position.y > this.position.y - this.h / 2 &&
        agent.position.y < this.position.y + this.h / 2
      )
    }
  }

  return {
    setup,
    draw,
    destroy() {
      controlPanel.destroy()
    },
    metadata,
  }
}
