import chroma from 'chroma-js'
import { createControlPanel } from '../lib/ControlPanel/index.mjs'
import { times } from '../util.mjs'

//thecodingtrain.com/challenges/1-starfield

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const metadata = {
    name: 'starField',
    frameRate: 30,
    pixelDensity: 6,
  }

  const [w, h] = [500, 500]
  const center = p.createVector(w / 2, h / 2)
  const stars = []

  const cp = createControlPanel({
    p,
    id: metadata.name,
    controls: [
      {
        type: 'Range',
        name: 'count',
        value: 100,
        min: 100,
        max: 10000,
        step: 10,
      },
      {
        type: 'Range',
        name: 'backgroundAlpha',
        value: 0.5,
        min: 0.001,
        max: 1,
        step: 0.001,
      },
      {
        type: 'Range',
        name: 'speed',
        value: 10,
        min: 1,
        max: 100,
      },
      {
        type: 'Checkbox',
        name: 'showLines',
        value: false,
      },
      {
        type: 'Checkbox',
        name: 'rotate',
        value: false,
      },
    ],
  })

  function setup() {
    cp.init()
    const canvas = p.createCanvas(w, h)

    p.colorMode(p.RGB, 255, 255, 255, 1)

    ensureStars()

    return {
      canvas,
    }
  }

  function draw() {
    p.background(0, cp.backgroundAlpha)

    ensureStars()

    p.$.pushPop(() => {
      p.translate(center.x, center.y)
      if (cp.rotate) {
        p.rotate(p.frameCount * 0.01)
      }
      for (const star of stars) {
        star.update({
          speed: cp.speed,
          showLines: cp.showLines,
        })
        star.display()
      }
    })
  }

  function ensureStars() {
    while (cp.count >= stars.length) {
      stars.push(new Star(p, w, h, cp.speed))
    }
    if (cp.count <= stars.length) {
      stars.length = cp.count
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

class Star {
  constructor(p, w = p.width, h = p.height, speed, showLines) {
    this.p = p
    this.w = w
    this.h = h
    this.speed = speed
    this.showLines = showLines
    this.#initXYZ()
  }

  #initXYZ() {
    this.x = this.p.random(-this.w, this.w)
    this.y = this.p.random(-this.h, this.h)
    this.z = this.p.random(this.w)
    this.prevZ = this.z
  }

  update(state) {
    Object.assign(this, state)
    this.z -= this.speed
    if (this.z < 1) {
      this.#initXYZ()
    }
  }

  display() {
    this.p.fill(255, this.p.map(this.z, this.w, 0, 0, 1))
    this.p.noStroke()
    const x = this.p.map(this.x / this.z, 0, 1, 0, this.w)
    const y = this.p.map(this.y / this.z, 0, 1, 0, this.h)
    const size = this.p.map(this.z, this.w, 0, 0, 8)
    this.p.circle(x, y, size)

    if (this.showLines) {
      const prevX = this.p.map(this.x / this.prevZ, 0, 1, 0, this.w)
      const prevY = this.p.map(this.y / this.prevZ, 0, 1, 0, this.h)
      this.p.stroke(255, this.p.map(this.z, this.w, 0, 0, 1))
      this.p.line(prevX, prevY, x, y)
      this.prevZ = this.z
    }
  }
}
