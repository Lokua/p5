// https://www.youtube.com/watch?v=p7IGZTjC008&t=613s
// https://people.csail.mit.edu/jaffer/Marbling/Dropping-Paint
import chroma from 'chroma-js'
import { createControlPanel } from '../lib/ControlPanel/index.mjs'
import { mapTimes } from '../util.mjs'
import AnimationHelper from '../lib/AnimationHelper.mjs'

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const metadata = {
    name: 'drop',
    frameRate: 30,

    // WARNING! This is probably too big
    // if recording video but perfect for images
    pixelDensity: 6,
  }

  const [w, h] = [500, 500]
  // eslint-disable-next-line no-unused-vars
  const center = p.createVector(w / 2, h / 2)
  const drops = []
  const maxDrops = 100

  const ah = new AnimationHelper({ p, frameRate: metadata.frameRate, bpm: 134 })

  const colorScale = chroma
    .scale(['black', 'turquoise', 'lavender', 'darkturquoise'])
    .mode('lab')

  const cp = createControlPanel({
    p,
    id: metadata.name,
    controls: [
      {
        type: 'Range',
        name: 'resolution',
        value: 100,
        min: 3,
        max: 300,
      },
      {
        type: 'Range',
        name: 'minRadius',
        value: 30,
        min: 3,
        max: 200,
      },
      {
        type: 'Range',
        name: 'maxRadius',
        value: 100,
        min: 3,
        max: 200,
      },
      {
        type: 'Range',
        name: 'rate',
        value: 0.5,
        min: 1 / 16,
        max: 1,
        step: 1 / 16,
      },
    ],
  })

  function setup() {
    cp.init()
    const canvas = p.createCanvas(w, h)

    p.colorMode(p.RGB, 255, 255, 255, 1)

    return {
      canvas,
    }
  }

  const triggerDrop = ah.triggerEvery(dropIt, cp.rate)

  function draw() {
    p.background(chroma.mix('black', colorScale(0)).rgba())
    p.noStroke()

    triggerDrop.every = cp.rate
    triggerDrop()

    for (const drop of drops) {
      p.fill(drop.color)
      drop.display()
    }
  }

  function dropIt() {
    const drop = new Drop(
      p,
      p.random(w),
      p.random(h),
      p.random(cp.minRadius, cp.maxRadius),
      cp.resolution,
      p.random(0, 100),
    )
    for (const other of drops) {
      drop.marble(other)
    }
    drop.color = colorScale(p.random()).rgba()
    drops.push(drop)
    while (drops.length > maxDrops) {
      drops.shift()
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

export class Drop {
  /**
   * @param {Object} options
   * @param {import('p5')} options.p
   */
  constructor(p, x, y, radius, resolution) {
    this.p = p
    this.center = p.createVector(x, y)
    this.resolution = resolution
    this.radius = radius
    this.vertices = this.#createVertices()
  }

  update(state) {
    Object.assign(this, state)
    this.vertices = this.#createVertices()
  }

  #createVertices() {
    return mapTimes(this.resolution, (i) => {
      const angle = this.p.map(i, 0, this.resolution, 0, this.p.TWO_PI)
      const v = this.p.createVector(this.p.cos(angle), this.p.sin(angle))
      v.mult(this.radius)
      v.add(this.center)
      return v
    })
  }

  // https://people.csail.mit.edu/jaffer/Marbling/Dropping-Paint
  // C + (P − C) * sqrt (1 + r^2 / ||P − C||^2)
  marble(other) {
    for (const v of other.vertices) {
      // (P - C)
      const centerToPoint = v.copy().sub(this.center)

      // ||P − C||^2
      const magSq = centerToPoint.magSq()

      // if (magSq === 0) continue

      // sqrt(1 + r^2 / ||P − C||^2)
      const scale = magSq === 0 ? 1 : Math.sqrt(1 + this.radius ** 2 / magSq)

      // NewP = C + scaled (P − C)
      v.set(this.center.copy().add(centerToPoint.mult(scale)))
    }
  }

  // https://people.csail.mit.edu/jaffer/Marbling/Mathematics
  // Fv(x, y) = (x, y + z*u|x−xL|)
  // u = 1/2^1/c
  tineVerticalOnly(lineX, displacement, falloff) {
    const falloffFactor = 1 / 2 ** (1 / falloff)
    for (const vertex of this.vertices) {
      const distanceFromCenterLine = Math.abs(vertex.x - lineX)
      const displacementMagnitude =
        displacement * falloffFactor ** distanceFromCenterLine
      vertex.y += displacementMagnitude
    }
  }

  // P = P + z + u^d * m
  // d = (P - B) dot N
  tine(start, direction, displacementMagnitude, falloffControl) {
    const falloffFactor = 1 / 2 ** (1 / falloffControl)
    // Perpendicular to direction
    const normal = this.p.createVector(-direction.y, direction.x)

    for (const vertex of this.vertices) {
      // Vector from vertex to line base
      const toBase = p5.Vector.sub(vertex, start)
      // Projection of toBase onto normal
      const distance = Math.abs(toBase.dot(normal))
      const scaledDisplacement =
        displacementMagnitude * falloffFactor ** distance
      vertex.add(direction.copy().mult(scaledDisplacement))
    }
  }

  display() {
    this.p.beginShape()
    for (const v of this.vertices) {
      this.p.vertex(v.x, v.y)
    }
    this.p.endShape(this.p.CLOSE)
  }
}
