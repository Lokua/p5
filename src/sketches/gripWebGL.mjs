import chroma from 'chroma-js'
import AnimationHelper from '../lib/AnimationHelper.mjs'
import { createControlPanel } from '../lib/ControlPanel/index.mjs'
import { createGridWebGL, getAverageFrameRate } from '../util.mjs'

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const metadata = {
    name: 'gripWebGL',
    frameRate: 30,
    pixelDensity: 6,
  }

  const [w, h] = [500, 500]
  const center = p.createVector(0, 0) // Center origin
  let grid = []
  grid.previousSize = -1
  let displacerConfigs = []
  const scaleRoot = chroma('beige')

  const ah = new AnimationHelper({
    p,
    frameRate: metadata.frameRate,
    bpm: 134,
  })

  const cp = createControlPanel({
    p,
    id: metadata.name,
    controls: [
      { type: 'Range', name: 'size', value: 36, min: 1, max: 100 },
      { type: 'Range', name: 'radius', value: 12, min: 0 },
      { type: 'Range', name: 'displacerRadius', value: 234, max: 1000 },
      { type: 'Range', name: 'strength', value: 34, min: 1 },
      { type: 'Range', name: 'cornerOffset', value: 27 },
      { type: 'Range', name: 'cornerMaxRadius', value: 35, min: 0, max: 100 },
      {
        type: 'Range',
        name: 'backgroundAlpha',
        value: 1,
        min: 0,
        max: 1,
        step: 0.001,
      },
      { type: 'Checkbox', name: 'debug', value: false },
    ],
  })

  function setup() {
    cp.init()
    const canvas = p.createCanvas(w, h, p.WEBGL)
    p.colorMode(p.RGB, 255, 255, 255, 1)

    // Set up an orthographic camera
    p.ortho(-w / 2, w / 2, h / 2, -h / 2, -1000, 1000)

    // p.loadFont(
    //   'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&display=swap',
    // )

    updateGrid()

    const getCornerRadiusAnimation = () =>
      ah.animate([0, cp.cornerMaxRadius, 0], 1, 1, 0.5)

    const cornerColorScale = chroma.scale([scaleRoot, 'green']).mode('lab')

    displacerConfigs = [
      {
        displacer: new Displacer(p, center.copy(), 0),
        update() {
          this.displacer.update({
            radius: ah.animate([0, cp.displacerRadius, 0], 1),
          })
        },
        colorScale: chroma
          .scale([scaleRoot, chroma('blue').saturate(2)])
          .mode('lab'),
        getStrength: () =>
          ah.animate([cp.strength, cp.strength * 3, cp.strength], 24),
      },
      {
        displacer: new Displacer(p, center.copy(), 0),
        update() {
          const displacerRadius = ah.animate(
            [0, cp.displacerRadius * 2, cp.displacerRadius / 2, 0],
            1.5,
          )
          const movementRadius = 175
          const angle = ah.animate([0, p.TWO_PI], 8)
          const x = Math.cos(angle) * movementRadius
          const y = Math.sin(angle) * movementRadius
          this.displacer.update({
            radius: displacerRadius,
            position: p.createVector(x, y),
          })
        },
        colorScale: chroma
          .scale([scaleRoot, chroma('purple').saturate(2)])
          .mode('lab'),
        getStrength: () =>
          ah.animate([cp.strength, cp.strength * 3, cp.strength], 16),
      },
      {
        displacer: new Displacer(p),
        update() {
          this.displacer.update({
            radius: getCornerRadiusAnimation(),
            position: p.createVector(
              -w / 2 + cp.cornerOffset,
              -h / 2 + cp.cornerOffset,
            ),
          })
        },
        colorScale: cornerColorScale,
      },
      {
        displacer: new Displacer(p),
        update() {
          this.displacer.update({
            radius: getCornerRadiusAnimation(),
            position: p.createVector(
              w / 2 - cp.cornerOffset,
              -h / 2 + cp.cornerOffset,
            ),
          })
        },
        colorScale: cornerColorScale,
      },
      {
        displacer: new Displacer(p),
        update() {
          this.displacer.update({
            radius: getCornerRadiusAnimation(),
            position: p.createVector(
              w / 2 - cp.cornerOffset,
              h / 2 - cp.cornerOffset,
            ),
          })
        },
        colorScale: cornerColorScale,
      },
      {
        displacer: new Displacer(p),
        update() {
          this.displacer.update({
            radius: getCornerRadiusAnimation(),
            position: p.createVector(
              -w / 2 + cp.cornerOffset,
              h / 2 - cp.cornerOffset,
            ),
          })
        },
        colorScale: cornerColorScale,
      },
    ].map((config) => {
      config.update = config.update.bind(config)
      config.getStrength = config.getStrength || (() => cp.strength)
      return config
    })

    return { canvas }
  }

  function draw() {
    p.background(0, cp.backgroundAlpha)
    p.noFill()
    p.stroke(chroma(scaleRoot).rgba())

    updateGrid()

    for (const { displacer, update } of displacerConfigs) {
      displacer.update(update())
      if (cp.debug) {
        p.noFill()
        p.stroke('cyan')
        p.circle(
          displacer.position.x,
          displacer.position.y,
          displacer.radius * 2,
        )
      }
    }

    const maxMag = displacerConfigs.length * cp.strength

    for (const point of grid) {
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

      const totalDisplacement = displacementInfos.reduce(
        (total, info) => total.add(info.displacement),
        p.createVector(0, 0),
      )

      const color = getBlendedColor(point, displacementInfos.slice(0, 2))
      const totalMag = totalDisplacement.mag()
      const radius = p.map(totalMag, 0, maxMag, cp.radius / 3, cp.radius)

      p.noFill()
      p.stroke(color.rgba())
      const displacedPoint = point.copy().add(totalDisplacement)
      p.circle(displacedPoint.x, displacedPoint.y, radius)
    }

    getAverageFrameRate(p, 300)

    // p.noStroke()
    // p.fill(255)
    // p.text(p.frameRate(), 10, 10)
  }

  function getBlendedColor(point, displacementInfos) {
    const totalInfluence = displacementInfos.reduce(
      (sum, info) => sum + info.magnitude,
      0,
    )

    if (totalInfluence === 0) {
      return chroma(scaleRoot)
    }

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

    return colors.reduce((acc, { color, weight }) => {
      return !acc ? color : chroma.blend(acc, color, 'multiply', weight)
    }, null)
  }

  function updateGrid() {
    if (grid.previousSize !== cp.size) {
      grid = createGridWebGL(w, h, cp.size, p.createVector.bind(p))
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
  constructor(p, position = p.createVector(0, 0), radius = 0) {
    this.p = p
    this.position = position
    this.radius = radius
  }

  update(state) {
    Object.assign(this, state)
  }

  influence(gridPoint, strength) {
    const radius = Math.max(this.radius, Number.EPSILON)
    const distanceToCenter = gridPoint.dist(this.position)

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
