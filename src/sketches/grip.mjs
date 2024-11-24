import chroma from 'chroma-js'
import AnimationHelper from '../lib/AnimationHelper.mjs'
import { createControlPanel } from '../lib/ControlPanel/index.mjs'

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const metadata = {
    name: 'grip',
    frameRate: 30,

    // WARNING! This is probably too big
    // if recording video but perfect for images
    pixelDensity: 6,
  }

  const [w, h] = [500, 500]
  const center = p.createVector(w / 2, h / 2)
  const grid = []
  grid.previousSize = -1

  const ah = new AnimationHelper({
    p,
    frameRate: metadata.frameRate,
    bpm: 134,
  })

  const cp = createControlPanel({
    p,
    id: metadata.name,
    controls: [
      {
        type: 'Range',
        name: 'size',
        value: 36,
        min: 1,
        max: 100,
      },
      {
        type: 'Range',
        name: 'radius',
        value: 6,
        min: 0,
      },
      {
        type: 'Range',
        name: 'centerRadius',
        value: 100,
        max: 1000,
      },
      {
        type: 'Range',
        name: 'pushStrength',
        value: 20,
        min: 1,
      },
      {
        type: 'Checkbox',
        name: 'debug',
        value: false,
      },
    ],
  })

  function setup() {
    cp.init()
    const canvas = p.createCanvas(w, h)

    p.colorMode(p.RGB, 255, 255, 255, 1)

    updateGrid()

    return {
      canvas,
    }
  }

  function draw() {
    p.background(0)
    p.noFill()
    p.stroke(chroma('beige').rgba())

    updateGrid()

    const currentRadius = ah.animate([0, cp.centerRadius, 0], 1)
    if (cp.debug) {
      p.noFill()
      p.stroke('cyan')
      p.$.vCircle(center, currentRadius * 2)
    }

    for (const point of grid) {
      const distanceToCenter = p.$.vDist(point, center)
      const proximity = 1 - distanceToCenter / (currentRadius * 2)
      const distanceFactor = Math.max(0, proximity)
      const angle = p.atan2(point.y - center.y, point.x - center.x)
      const force = cp.pushStrength * distanceFactor ** 2
      const x = point.x + p.cos(angle) * force
      const y = point.y + p.sin(angle) * force
      p.noFill()
      p.stroke(chroma('beige').rgba())
      p.circle(x, y, cp.radius)
    }
  }

  function updateGrid() {
    if (grid.previousSize !== cp.size) {
      grid.length = 0

      const cellSize = Math.min(w, h) / cp.size
      const cols = Math.floor(w / cellSize)
      const rows = Math.floor(h / cellSize)

      // Calculate offsets to center the grid in both directions
      const xOffset = (w - cols * cellSize) / 2
      const yOffset = (h - rows * cellSize) / 2

      for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
          const x = col * cellSize + cellSize / 2 + xOffset
          const y = row * cellSize + cellSize / 2 + yOffset
          grid.push(p.createVector(x, y))
        }
      }

      grid.previousSize = cp.size
    }
  }

  return {
    setup,
    draw,
    destroy() {
      cp.destroy()
    },
    metadata,
  }
}

class Displacer {
  constructor(position, radius) {
    this.position = position
    this.radius = radius
  }
  influence(gridPoint, strength) {
    const distanceToCenter = this.p.$.vDist(gridPoint, this.position)
    const proximity = 1 - distanceToCenter / (this.radius * 2)
    const distanceFactor = Math.max(0, proximity)
    const angle = Math.atan2(
      gridPoint.y - this.center.y,
      gridPoint.x - this.center.x,
    )
    const force = strength * distanceFactor ** 2
    const dx = Math.cos(angle) * force
    const dy = Math.sin(angle) * force
    return this.p.createVector(dx, dy)
  }
}
