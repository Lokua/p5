import chroma from 'chroma-js'
import { createControlPanel } from '../lib/ControlPanel/index.mjs'
import * as distanceAlgs from '../lib/distance.mjs'
import { createGrid, getAverageFrameRate, PHI } from '../util.mjs'

// https://lokua.bandcamp.com/track/grip

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const metadata = {
    name: 'displacement',
    frameRate: 30,

    // WARNING! This is probably too big
    // if recording video but perfect for images
    pixelDensity: 6,
  }

  const [w, h] = [500, 500]
  const center = p.createVector(w / 2, h / 2)
  let grid = []
  grid.previousSize = -1
  let displacerConfigs = []
  const scaleRoot = chroma('beige')

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
        name: 'circleRadius',
        value: 12,
        min: 0,
      },
      {
        type: 'Range',
        name: 'displacerRadius',
        value: 234,
        max: 1000,
      },
      {
        type: 'Range',
        name: 'strength',
        value: 34,
        min: 1,
      },
      {
        type: 'Range',
        name: 'backgroundAlpha',
        value: 1,
        min: 0,
        max: 1,
        step: 0.001,
      },
      {
        type: 'Select',
        name: 'distanceAlg',
        value: 'euclidean',
        options: Object.keys(distanceAlgs),
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

    const makeDisplacer = (position) => ({
      displacer: new Displacer({
        p,
        position,
        radius: 0,
        distanceAlg: distanceAlgs[cp.distanceAlg],
      }),
      colorScale: chroma.scale([scaleRoot, 'cyan', 'magenta']).mode('lab'),
      getStrength: () => cp.strength,
      update() {
        this.displacer.update({
          radius: cp.displacerRadius,
          distanceAlg: distanceAlgs[cp.distanceAlg],
        })
      },
    })

    displacerConfigs = [
      makeDisplacer(center.copy()),
      makeDisplacer(center.copy().mult(0.5)),
      makeDisplacer(center.copy().mult(1.5, 0.5)),
      makeDisplacer(center.copy().mult(1.5, 1.5)),
      makeDisplacer(center.copy().mult(0.5, 1.5)),
    ].map((config) => {
      config.update = config.update.bind(config)
      return config
    })

    return {
      canvas,
    }
  }

  function draw() {
    p.background(0, cp.backgroundAlpha)
    p.noFill()

    updateGrid()

    for (const { displacer, update } of displacerConfigs) {
      displacer.update(update())
      if (cp.debug) {
        p.noFill()
        p.stroke('cyan')
        p.$.vCircle(displacer.position, displacer.radius * 2)
      }
    }

    const maxMag = displacerConfigs.length * cp.strength

    for (const point of grid) {
      // Get displacement info from each displacer
      const displacementInfos = displacerConfigs.map((config) => {
        const displacement = config.displacer.influence(
          point,
          config.getStrength(),
        )
        return {
          displacement,
          magnitude: displacement.mag(),
          config,
        }
      })

      // Calculate total displacement
      const totalDisplacement = displacementInfos.reduce(
        (total, info) => total.add(info.displacement),
        p.createVector(0, 0),
      )

      // Get blended color based on displacer influences
      const color = getBlendedColor(point, displacementInfos)

      // Calculate radius based on total displacement magnitude
      const totalMag = totalDisplacement.mag()
      const radius = p.map(
        totalMag,
        0,
        maxMag,
        cp.circleRadius / 3,
        cp.circleRadius,
      )

      p.noFill()
      p.stroke(color.rgba())
      p.$.vCircle(point.copy().add(totalDisplacement), radius)
    }

    getAverageFrameRate(p, 300)
  }

  function getBlendedColor(point, displacementInfos) {
    // Calculate total influence for normalization
    const totalInfluence = displacementInfos.reduce(
      (sum, info) => sum + info.magnitude,
      0,
    )

    if (totalInfluence === 0) {
      return chroma(scaleRoot)
    }

    // Get colors from each displacer based on their relative influence
    const colors = displacementInfos.map((info) => {
      const weight = info.magnitude / totalInfluence
      const colorPosition = Math.min(
        info.magnitude / (info.config.getStrength() * 2),
        1,
      )
      return {
        color: info.config.colorScale(colorPosition),
        weight,
      }
    })

    // Blend colors using weights
    return colors.reduce((acc, { color, weight }) => {
      return !acc ? color : chroma.blend(acc, color, 'multiply', weight)
    }, null)
  }

  function updateGrid() {
    if (grid.previousSize !== cp.size) {
      grid = createGrid(w, h, cp.size, p.createVector.bind(p))
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
  constructor({ p, position = p.createVector(0, 0), radius = 0, distanceAlg }) {
    this.p = p
    this.position = position
    this.radius = radius
    this.distanceAlg = distanceAlg
  }

  update(state) {
    Object.assign(this, state)
  }

  influence(gridPoint, strength) {
    const radius = Math.max(this.radius, Number.EPSILON)
    const distanceToCenter = this.distanceAlg(gridPoint, this.position)

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
