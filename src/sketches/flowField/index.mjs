import chroma from 'chroma-js'
import AnimationHelper from '../../lib/AnimationHelper.mjs'
import { renderSwatches } from '../../lib/colors.mjs'
import { callAtInterval, getAverageFrameRate } from '../../util.mjs'

import createControlPanel from './createControlPanel.mjs'
import VectorPool from './VectorPool.mjs'
import FlowParticle from './FlowParticle.mjs'
import Obstacle from './Obstacle.mjs'
import BlackHole from './BlackHole.mjs'
import Pollinator from './Pollinator.mjs'
import FlowField from './FlowField.mjs'

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
  let particleBuffer
  const attractors = []
  let blackHole
  let flowField
  const vectorPool = new VectorPool(p)

  const colorScale = chroma.scale(['navy', 'turquoise', 'purple', 'yellow'])
  const attractorColorScale = chroma.scale(['white', 'azure', 'silver'])
  const ah = new AnimationHelper({ p, frameRate: metadata.frameRate, bpm: 130 })
  const controlPanel = createControlPanel(p, metadata)

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)
    p.colorMode(p.RGB, 255, 255, 255, 1)

    // const seed = 39
    const seed = 66
    p.randomSeed(seed)
    p.noiseSeed(seed)

    particleBuffer = p.createGraphics(w, h)
    particleBuffer.colorMode(p.RGB, 255, 255, 255, 1)

    const {
      blackHoleStrength,
      edgeMode,
      applyRandomForce,
      history,
      noiseScale,
      forceMagnitude,
      angleOffset,
      forceMode,
    } = controlPanel.values()

    initializeObstacles()
    updateAttractors()

    flowField = new FlowField({
      p,
      vectorPool,
      noiseScale,
      forceMagnitude,
      angleOffset,
      zOffset: 0,
      forceMode,
    })

    // DELETEME
    // p.noLoop()

    blackHole = new BlackHole({
      p,
      vectorPool,
      position: p.createVector(center.x, center.y),
      strength: blackHoleStrength,
    })

    for (let i = 0; i < 10_001; i++) {
      particles.push(
        new FlowParticle({
          p,
          buffer: particleBuffer,
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
      noiseScale,
      forceMagnitude,
      applyRandomForce,
      zOffsetMultiplier,
      showParticles,
      showObstacles,
      showBlackHole,
      showAttractors,
      history,
    } = controlPanel.values()

    p.background(0)
    particleBuffer.background(chroma('black').alpha(backgroundAlpha).rgba())

    flowField.updateState({
      forceMode,
      noiseScale,
      forceMagnitude,
      zOffset: ah.getTotalBeatsElapsed() * zOffsetMultiplier,
      visualize: showField,
    })

    flowField.update()

    renderFeatures({
      showParticles,
      count,
      edgeMode,
      applyRandomForce,
      history,
      showObstacles,
      showField,
      showBlackHole,
      blackHoleStrength,
      showAttractors,
      showSwatches,
    })

    getAverageFrameRate(p, 900)
  }

  function renderFeatures({
    showParticles,
    edgeMode,
    count,
    history,
    applyRandomForce,
    showObstacles,
    showField,
    showBlackHole,
    blackHoleStrength,
    showAttractors,
    showSwatches,
  }) {
    if (showParticles) {
      let activeCount = 0
      for (const particle of particles) {
        if (activeCount >= count) {
          particle.active = false
          break
        }
        if (particle.active) {
          updateActiveParticle({
            particle,
            edgeMode,
            applyRandomForce,
            showObstacles,
            showBlackHole,
            showAttractors,
            history,
          })
          if (particle.active) {
            activeCount++
          }
        } else if (activeCount < count) {
          reanimateParticle(particle)
          activeCount++
        }
      }
      p.image(particleBuffer, 0, 0, w, h)
    }
    if (showObstacles) {
      for (const obstacle of obstacles) {
        obstacle.display()
      }
    }
    if (showBlackHole) {
      blackHole.strength = blackHoleStrength
      blackHole.display()
    }
    if (showAttractors) {
      updateAttractors()
    }
    if (showField) {
      flowField.display()
    }
    if (showSwatches) {
      renderSwatches({ p, w, scales: [colorScale, attractorColorScale] })
    }
  }

  function updateActiveParticle({
    particle,
    edgeMode,
    applyRandomForce,
    showObstacles,
    showBlackHole,
    showAttractors,
    history,
  }) {
    particle.edgeMode = edgeMode
    particle.applyRandomForce = applyRandomForce
    particle.maxHistory = history

    applyObstacles({
      particle,
      showObstacles,
    })

    applyForces({
      particle,
      showBlackHole,
      showAttractors,
    })

    particle.update()
    particle.edges()
    particle.display()
  }

  function applyForces({ particle, showBlackHole, showAttractors }) {
    const force = vectorPool.get()
    flowField.applyForceTo(particle.position, force)

    if (showBlackHole) {
      blackHole.interactWith(particle, force)
    }

    if (showAttractors) {
      for (const attractor of attractors) {
        attractor.interactWith(particle, force)
      }
    }

    particle.applyForce(force)
    vectorPool.release(force)
  }

  function applyObstacles({ particle, showObstacles }) {
    if (showObstacles) {
      for (const obstacle of obstacles) {
        obstacle.interactWith(particle)
      }
    }
  }

  function reanimateParticle(particle) {
    const position = findValidPosition()
    particle.reset(position)
    vectorPool.release(position)
  }

  function findValidPosition() {
    let position

    do {
      const testPosition = vectorPool.get().set(p.random(w), p.random(h))
      if (isPositionValid(testPosition)) {
        position = testPosition
      } else {
        vectorPool.release(testPosition)
      }
    } while (!position)

    return position
  }

  function isPositionValid(position) {
    const showBlackHole = controlPanel.get('showBlackHole')
    const showObstacles = controlPanel.get('showObstacles')

    if (showBlackHole && blackHole.contains({ position })) {
      return false
    }

    if (showObstacles) {
      return !obstacles.some((obstacle) => obstacle.contains({ position }))
    }

    return true
  }

  function initializeObstacles() {
    const size = 100
    obstacles.push(
      new Obstacle({
        p,
        x: center.x / 2,
        y: center.y / 2,
        w: size,
        h: size,
      }),
    )
    obstacles.push(
      new Obstacle({
        p,
        x: center.x * 1.5,
        y: center.y / 2,
        w: size,
        h: size,
      }),
    )
    obstacles.push(
      new Obstacle({
        p,
        x: center.x * 1.5,
        y: center.y * 1.5,
        w: size,
        h: size,
      }),
    )
    obstacles.push(
      new Obstacle({
        p,
        x: center.x / 2,
        y: center.y * 1.5,
        w: size,
        h: size,
      }),
    )
  }

  function updateAttractors() {
    const strength = controlPanel.get('attractorStrength')
    const count = controlPanel.get('attractorCount')
    const showObstacles = controlPanel.get('showObstacles')

    createOrRemoveAttractors(count, strength)

    for (const attractor of attractors) {
      for (const otherAttractor of attractors) {
        if (otherAttractor !== attractor) {
          const outputForce = vectorPool.get()
          attractor.interactWith(otherAttractor, outputForce)
          vectorPool.release(outputForce)
        }
      }

      if (showObstacles) {
        for (const obstacle of obstacles) {
          obstacle.interactWith(attractor)
        }
      }

      attractor.updateState({ strength })
      attractor.update()
      attractor.edges()
      attractor.display()
    }
  }

  function createOrRemoveAttractors(count, strength) {
    if (attractors.length < count) {
      addAttractors(count, strength)
    } else if (attractors.length > count) {
      removeAttractors(count)
    }
  }

  function addAttractors(count, strength) {
    while (attractors.length < count) {
      attractors.push(
        new Pollinator({
          p,
          colorScale: attractorColorScale,
          position: vectorPool.get().set(p.random(w), p.random(h)),
          strength,
          vectorPool,
        }),
      )
    }
  }

  function removeAttractors(count) {
    while (attractors.length > count) {
      attractors.pop().destroy()
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
