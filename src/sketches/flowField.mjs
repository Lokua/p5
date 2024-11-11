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
  const center = p.createVector(w / 2, h / 2)
  const agents = []
  const colorScale = chroma.scale(['white'])
  const ah = new AnimationHelper({ p, frameRate: metadata.frameRate, bpm: 130 })
  let agentBuffer

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
        name: 'flowForceType',
        value: 'y',
        options: ['x', 'y', 'perlinNoise', 'radial', 'sinusoidal'],
      },
      {
        type: 'Select',
        name: 'edgeMode',
        value: 'wrap',
        options: ['wrap', 'respawn'],
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

    const { count, edgeMode } = controlPanel.values()
    for (let i = 0; i < count; i++) {
      agents.push(
        new Agent({
          position: p.createVector(p.random(w), p.random(h)),
          edgeMode,
        }),
      )
    }

    return {
      canvas,
    }
  }

  function draw() {
    const {
      count,
      flowForceType,
      showSwatches,
      visualizeField,
      backgroundAlpha,
      edgeMode,
      noiseScale,
      applyRandomForce,
    } = controlPanel.values()
    p.background(0)
    agentBuffer.background(chroma('black').alpha(backgroundAlpha).rgba())

    if (agents.length < count) {
      while (agents.length < count) {
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
      agent.applyForce(getFlowForce(agent.position, flowForceType, noiseScale))
      agent.update()
      agent.edges()
      agent.display()
    }

    p.image(agentBuffer, 0, 0, w, h)

    visualizeField && visualizeFlowField(flowForceType, noiseScale)
    showSwatches && renderSwatches({ p, w, scales: [colorScale] })
  }

  function getFlowForce(position, flowForceType, noiseScale) {
    const zOffset = ah.getTotalBeatsElapsed() / 8
    let angle

    if (flowForceType === 'x') {
      angle = p.map(position.x, 0, w, 0, p.TWO_PI)
    } else if (flowForceType === 'y') {
      angle = p.map(position.y, 0, h, 0, p.TWO_PI)
    } else if (flowForceType === 'perlinNoise') {
      const value = p.noise(
        position.x * noiseScale,
        position.y * noiseScale,
        zOffset,
      )
      angle = p.map(value, 0, 1, 0, p.TWO_PI)
    } else if (flowForceType === 'radial') {
      angle = p.atan2(position.y - center.y, position.x - center.x)
      angle += p.sin(zOffset)
    } else if (flowForceType === 'sinusoidal') {
      angle = p.sin(position.y / noiseScale + zOffset) * p.PI
    }

    const force = p5.Vector.fromAngle(angle)
    force.setMag(0.25)
    return force
  }

  function visualizeFlowField(flowForceType, noiseScale) {
    const useAngleBasedColor = false
    const color = chroma('magenta').rgba()
    const gridSize = 25
    const gridSizeX = w / gridSize
    const gridSizeY = h / gridSize

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const x = i * gridSizeX + gridSizeX / 2
        const y = j * gridSizeY + gridSizeY / 2

        const pos = p.createVector(x, y)
        const force = getFlowForce(pos, flowForceType, noiseScale)
        const scaledForce = p5.Vector.mult(force, 50)

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
      this.maxSpeed = 3
      this.color = colorScale(p.random())
      this.edgeMode = edgeMode
      this.useVelocityBasedColorScaling = false
      this.applyRandomForce = applyRandomForce
      this.opacity = opacity
      this.diameter = p.random(0.25, 1)
      this.history = []
    }

    applyForce(force) {
      this.acceleration.add(force)
    }

    update() {
      this.velocity.add(this.acceleration)
      this.velocity.limit(this.maxSpeed)
      this.position.add(this.velocity)
      this.acceleration.mult(0)

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
        agentBuffer.fill(
          colorScale(speed / this.maxSpeed)
            .alpha(this.opacity)
            .rgba(),
        )
      } else {
        agentBuffer.fill(this.color.alpha(this.opacity).rgba())
      }

      agentBuffer.circle(this.position.x, this.position.y, this.diameter)
    }

    edges() {
      if (this.edgeMode === 'wrap') {
        this.position.x > w && (this.position.x = 0)
        this.position.x < 0 && (this.position.x = w)
        this.position.y > h && (this.position.y = 0)
        this.position.y < 0 && (this.position.y = h)
      } else if (this.edgeMode === 'respawn') {
        if (!this.onScreen()) {
          this.position = p.createVector(p.random(w), p.random(h))
          this.opacity = 0
        }
      }
    }

    onScreen() {
      return onScreen(this.position, w, h)
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
