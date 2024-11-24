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
  let displacerConfigs = []

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
        name: 'maxDisplacerRadius',
        value: 100,
        max: 1000,
      },
      {
        type: 'Range',
        name: 'strength',
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

    displacerConfigs = [
      {
        displacer: new Displacer(p, center, 0),
        update() {
          this.displacer.update({
            radius: ah.animate([0, cp.maxDisplacerRadius, 0], 1),
          })
        },
      },
      {
        displacer: new Displacer(p, center.copy().div(2), 0),
        update() {
          this.displacer.update({
            radius: ah.animate([0, cp.maxDisplacerRadius / 2, 0], 0.75),
          })
        },
      },
    ].map((config) => {
      for (const key in config) {
        if (typeof config[key] === 'function') {
          config[key] = config[key].bind(config)
        }
      }
      return config
    })

    return {
      canvas,
    }
  }

  function draw() {
    p.background(0)
    p.noFill()
    p.stroke(chroma('beige').rgba())

    updateGrid()

    for (const { displacer, update } of displacerConfigs) {
      displacer.update(update())
      if (cp.debug) {
        p.noFill()
        p.stroke('cyan')
        p.$.vCircle(displacer.position, displacer.radius * 2)
      }
    }

    for (const point of grid) {
      const displacement = displacerConfigs.reduce(
        (displacement, { displacer }) =>
          displacement.add(displacer.influence(point, cp.strength)),
        p.createVector(0, 0),
      )
      p.noFill()
      p.stroke(chroma('beige').rgba())
      p.$.vCircle(p.$.V.add(point, displacement), cp.radius)
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
  constructor(p, position, radius, xtra) {
    this.p = p
    this.position = position
    this.radius = radius
    this.xtra = xtra
  }

  update(state) {
    Object.assign(this, state)
  }

  influence(gridPoint, strength) {
    const radius = Math.max(this.radius, Number.EPSILON)
    const distanceToCenter = this.p.$.vDist(gridPoint, this.position)

    // Safeguard: If the grid point is exactly at the center, no displacement
    // (happens when grid size is an odd number)
    if (distanceToCenter === 0) {
      return this.p.createVector(0, 0)
    }

    const proximity = 1 - distanceToCenter / (radius * 2)
    const distanceFactor = Math.max(0, proximity)
    const angle = Math.atan2(
      gridPoint.y - this.position.y,
      gridPoint.x - this.position.x,
    )
    const force = strength * distanceFactor ** 2
    const dx = Math.cos(angle) * force
    const dy = Math.sin(angle) * force
    return this.p.createVector(dx, dy)
  }
}
