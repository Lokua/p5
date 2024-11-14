import chroma from 'chroma-js'
import AnimationHelper from '../../lib/AnimationHelper.mjs'
import { renderSwatches } from '../../lib/colors.mjs'
import { logAtInterval, getAverageFrameRate } from '../../util.mjs'

import createControlPanel from './createControlPanel.mjs'
import Particle from './Particle.mjs'
import Obstacle from './Obstacle.mjs'
import BlackHoleAttractor from './BlackHoleAttractor.mjs'
import Attractor from './Attractor.mjs'

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
  const obstacles = []
  const particles = []
  const attractors = []
  let blackHole
  let particleBuffer
  const resolution = 20
  const cols = Math.floor(w / resolution)
  const rows = Math.floor(h / resolution)
  const flowField = []

  const vectorPool = {
    vectors: [],
    get() {
      const vector = this.vectors.pop() || p.createVector(0, 0)
      vector._debugId = Math.random()
      return vector
    },
    release(vector) {
      if (!vector._debugId) {
        console.warn('Releasing vector with no debug ID')
      }
      vector.set(0, 0)
      this.vectors.push(vector)
    },
  }

  const colorScale = chroma.scale(['navy', 'turquoise', 'purple', 'yellow'])
  const ah = new AnimationHelper({ p, frameRate: metadata.frameRate, bpm: 130 })
  const controlPanel = createControlPanel(p, metadata)

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)
    p.colorMode(p.RGB, 255, 255, 255, 1)
    p.randomSeed(39)
    p.noiseSeed(39)
    particleBuffer = p.createGraphics(w, h)
    particleBuffer.colorMode(p.RGB, 255, 255, 255, 1)

    const { blackHoleStrength, edgeMode, applyRandomForce, history } =
      controlPanel.values()

    updateFlowField()
    initializeObstacles()
    updateAttractors()

    blackHole = new BlackHoleAttractor(
      p,
      p.createVector(center.x, center.y),
      blackHoleStrength,
      vectorPool,
    )

    for (let i = 0; i < 10_001; i++) {
      particles.push(
        new Particle({
          p,
          buffer: particleBuffer,
          w,
          h,
          vectorPool,
          colorScale,
          position: p.createVector(p.random(w), p.random(h)),
          edgeMode,
          applyRandomForce,
          maxHistory: history,
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
      showSwatches,
      showField,
      blackHoleStrength,
      backgroundAlpha,
      edgeMode,
      forceMode,
      applyRandomForce,
      showParticles,
      showObstacles,
      showBlackHole,
      showAttractors,
      history,
    } = controlPanel.values()

    p.background(0)
    particleBuffer.background(chroma('black').alpha(backgroundAlpha).rgba())

    if (forceMode !== 'algorithmic') {
      updateFlowField()
    }

    let activeCount = 0
    for (const particle of particles) {
      if (activeCount >= count) {
        break
      }

      if (particle.active) {
        updateActiveParticle({
          particle,
          edgeMode,
          applyRandomForce,
          showObstacles,
          showBlackHole,
          blackHoleStrength,
          showAttractors,
          history,
        })

        if (particle.isDead()) {
          particle.active = false
          activeCount--
        } else {
          activeCount++
        }
      } else if (activeCount < count) {
        reanimateParticle({
          particle,
          showBlackHole,
          showObstacles,
        })
        activeCount++
      }
    }

    renderFeatures({
      showParticles,
      showObstacles,
      showField,
      showBlackHole,
      showAttractors,
      showSwatches,
    })

    getAverageFrameRate(p, 600)
  }

  function renderFeatures({
    showParticles,
    showObstacles,
    showField,
    showBlackHole,
    showAttractors,
    showSwatches,
  }) {
    if (showParticles) {
      p.image(particleBuffer, 0, 0, w, h)
    }
    if (showObstacles) {
      for (const obstacle of obstacles) {
        obstacle.display()
      }
    }
    if (showField) {
      visualizeFlowField()
    }
    if (showBlackHole) {
      blackHole.display()
    }
    if (showAttractors) {
      updateAttractors()
    }
    if (showSwatches) {
      renderSwatches({ p, w, scales: [colorScale] })
    }
  }

  function updateActiveParticle({
    particle,
    edgeMode,
    applyRandomForce,
    showObstacles,
    showBlackHole,
    blackHoleStrength,
    showAttractors,
    history,
  }) {
    particle.edgeMode = edgeMode
    particle.applyRandomForce = applyRandomForce
    particle.maxHistory = history

    if (showObstacles) {
      applyObstacles(particle)
    }

    applyForces({
      particle,
      showBlackHole,
      blackHoleStrength,
      showAttractors,
    })

    particle.update()
    particle.edges()
    particle.display()
  }

  function applyForces({
    particle,
    showBlackHole,
    blackHoleStrength,
    showAttractors,
  }) {
    const force = vectorPool.get()
    getFlowForce(particle.position, force)

    if (showBlackHole) {
      blackHole.strength = blackHoleStrength
      const blackHoleForce = vectorPool.get()
      blackHole.getForce(particle, blackHoleForce)
      force.add(blackHoleForce)
      vectorPool.release(blackHoleForce)

      if (blackHole.contains(particle)) {
        particle.velocity.mult(-1)
        particle.dieOnWrap = true
      }
    }

    if (showAttractors) {
      for (const attractor of attractors) {
        const attractorForce = vectorPool.get()
        attractor.getForce(particle, attractorForce)
        force.add(attractorForce)
        vectorPool.release(attractorForce)
      }
    }

    particle.applyForce(force)
    vectorPool.release(force)
  }

  function applyObstacles(particle) {
    for (const obstacle of obstacles) {
      if (obstacle.contains(particle)) {
        particle.velocity.mult(-0.5)
        particle.dieOnWrap = true
      }
    }
  }

  function reanimateParticle({ particle, showBlackHole, showObstacles }) {
    let position
    while (!position) {
      const testPosition = vectorPool.get().set(p.random(w), p.random(h))
      let isValid = true
      if (showBlackHole && blackHole.contains({ position: testPosition })) {
        isValid = false
      }
      if (isValid && showObstacles) {
        for (const obstacle of obstacles) {
          if (obstacle.contains({ position: testPosition })) {
            isValid = false
            break
          }
        }
      }
      if (isValid) {
        position = testPosition
      } else {
        vectorPool.release(testPosition)
      }
    }
    particle.reset(position)
    particle.active = true
    vectorPool.release(position)
  }

  function getZOffset() {
    return ah.getTotalBeatsElapsed() * controlPanel.get('zOffsetMultiplier')
  }

  function angleForPosition(position, outputVector) {
    const noiseScale = controlPanel.get('noiseScale')
    const x = position.x * noiseScale
    const y = position.y * noiseScale
    const value = p.noise(x, y, getZOffset())
    const angle =
      p.map(value, 0, 1, 0, p.TWO_PI) +
      p.sin(p.radians(controlPanel.get('angleOffset')))
    outputVector.set(p.cos(angle), p.sin(angle))
    outputVector.setMag(controlPanel.get('forceMagnitude'))
    return outputVector
  }

  function updateFlowField() {
    const totalGridWidth = cols * resolution
    const totalGridHeight = rows * resolution
    const xOffset = (w - totalGridWidth) / 2
    const yOffset = (h - totalGridHeight) / 2

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const index = x + y * cols
        const gridPosX = x * resolution + xOffset + resolution / 2
        const gridPosY = y * resolution + yOffset + resolution / 2

        // Initialize vector if it doesn't exist
        if (!flowField[index]) {
          flowField[index] = p.createVector()
        }

        // Use a temporary position vector from pool just for the calculation
        const position = vectorPool.get()
        position.set(gridPosX - w / 2, gridPosY - h / 2)

        // Update the existing flowField vector
        angleForPosition(position, flowField[index])

        vectorPool.release(position)
      }
    }
  }

  const forceModes = {
    grid(position, outputVector) {
      const totalGridWidth = cols * resolution
      const totalGridHeight = rows * resolution
      const xOffset = (w - totalGridWidth) / 2
      const yOffset = (h - totalGridHeight) / 2
      const adjustedX = position.x - xOffset
      const adjustedY = position.y - yOffset
      const x = Math.floor(adjustedX / resolution)
      const y = Math.floor(adjustedY / resolution)
      if (x < 0 || x >= cols || y < 0 || y >= rows) {
        return outputVector.set(0, 0)
      }
      const index = x + y * cols
      return outputVector.set(flowField[index].x, flowField[index].y)
    },
    algorithmic: angleForPosition,
    combinedAdditive(position, outputVector) {
      const force1 = vectorPool.get()
      const force2 = vectorPool.get()
      forceModes.grid(position, force1)
      forceModes.algorithmic(position, force2)
      outputVector.set(force1.x + force2.x, force1.y + force2.y)
      vectorPool.release(force1)
      vectorPool.release(force2)
      return outputVector
    },
    combinedAveraged(position, outputVector) {
      forceModes.combinedAdditive(position, outputVector)
      outputVector.mult(0.5)
      return outputVector
    },
  }

  function getFlowForce(
    position,
    outputVector,
    mode = controlPanel.get('forceMode'),
  ) {
    return forceModes[mode](position, outputVector)
  }

  function visualizeFlowField() {
    const useAngleBasedColor = false
    const baseColor = chroma('magenta').rgba()

    const totalGridWidth = cols * resolution
    const totalGridHeight = rows * resolution
    const xOffset = (w - totalGridWidth) / 2
    const yOffset = (h - totalGridHeight) / 2

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const position = vectorPool.get()
        position.set(
          x * resolution + xOffset + resolution / 2,
          y * resolution + yOffset + resolution / 2,
        )

        const force = vectorPool.get()
        getFlowForce(position, force)
        const scaledForce = force.copy().mult(resolution * 2)

        const angle = force.heading()
        const angleOffset = p.radians(30)
        const arrowSize = 5

        const color = useAngleBasedColor
          ? chroma.hsv(p.degrees(angle) % 360, 100, 100).rgba()
          : baseColor

        const arrowTip = p5.Vector.add(position, scaledForce)
        const arrowBase = p5.Vector.sub(
          arrowTip,
          p5.Vector.mult(force, arrowSize),
        )

        p.stroke(color)
        p.strokeWeight(1)
        p.line(position.x, position.y, arrowBase.x, arrowBase.y)

        const x1 = arrowTip.x - arrowSize * p.cos(angle - angleOffset)
        const y1 = arrowTip.y - arrowSize * p.sin(angle - angleOffset)
        const x2 = arrowTip.x - arrowSize * p.cos(angle + angleOffset)
        const y2 = arrowTip.y - arrowSize * p.sin(angle + angleOffset)

        p.noStroke()
        p.fill(color)
        p.triangle(arrowTip.x, arrowTip.y, x1, y1, x2, y2)

        vectorPool.release(position)
        vectorPool.release(force)
      }
    }
  }

  function initializeObstacles() {
    const size = 100
    obstacles.push(new Obstacle(p, center.x / 2, center.y / 2, size, size))
    obstacles.push(new Obstacle(p, center.x * 1.5, center.y / 2, size, size))
    obstacles.push(new Obstacle(p, center.x / 2, center.y * 1.5, size, size))
    obstacles.push(new Obstacle(p, center.x * 1.5, center.y * 1.5, size, size))
  }

  function updateAttractors() {
    const strength = controlPanel.get('attractorStrength')
    const grid = 4
    const spacingX = w / (grid + 1)
    const spacingY = h / (grid + 1)
    let index = 0
    for (let i = 0; i < grid; i++) {
      for (let j = 0; j < grid; j++) {
        const x = (i + 1) * spacingX
        const y = (j + 1) * spacingY
        const v = vectorPool.get().set(x, y)
        attractors[index] =
          attractors[index] ||
          new Attractor(p, v, strength, 'repel', vectorPool)
        attractors[index].position = v
        attractors[index].display()
        index++
      }
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
