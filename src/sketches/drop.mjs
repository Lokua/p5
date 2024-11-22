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
        name: 'res',
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

  const triggerDrop = ah.triggerEvery(() => {
    const drop = new Drop(
      p,
      p.random(w),
      p.random(h),
      p.random(cp.minRadius, cp.maxRadius),
      cp.get('res'),
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
  }, 0.25)

  function draw() {
    const { res } = cp.values()
    p.background(chroma.mix('black', colorScale(0)).rgba())
    p.noStroke()

    triggerDrop(res)
    for (const drop of drops) {
      p.fill(drop.color)
      drop.display()
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

class Drop {
  /**
   * @param {Object} options
   * @param {import('p5')} options.p
   */
  constructor(p, x, y, r, res) {
    this.p = p
    this.center = p.createVector(x, y)
    this.r = r
    this.vertices = mapTimes(res, (i) => {
      const angle = p.map(i, 0, res, 0, p.TWO_PI)
      const v = p.createVector(p.cos(angle), p.sin(angle))
      v.mult(r)
      v.add(this.center)
      return v
    })
  }

  // https://people.csail.mit.edu/jaffer/Marbling/Dropping-Paint
  // C + (P − C) * sqrt	(	1 +	r^2 / ||P − C||^2	)
  marble(other) {
    for (const v of other.vertices) {
      // (P - C)
      const centerToPoint = v.copy().sub(this.center)
      // ||P − C||^2
      const magSq = centerToPoint.magSq()
      // if (magSq === 0) continue
      // sqrt(1 + r^2 / ||P − C||^2)
      const scale = magSq === 0 ? 1 : Math.sqrt(1 + this.r ** 2 / magSq)
      // NewP = C + scaled (P − C)
      v.set(this.center.copy().add(centerToPoint.mult(scale)))
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
