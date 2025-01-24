import chroma from 'chroma-js'
import { createControlPanel } from '../lib/ControlPanel/index.mjs'
import AnimationHelper from '../lib/AnimationHelper.mjs'

// Following along with
// https://www.3blue1brown.com/lessons/vectors

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const metadata = {
    name: 'ztudy__lin_alg',
    frameRate: 30,
    pixelDensity: 6,
  }

  const [w, h] = [500, 500]
  const center = p.createVector(w / 2, h / 2)
  const vs = []

  const cp = createControlPanel({
    p,
    id: metadata.name,
    controls: [
      {
        type: 'Range',
        name: 'scale',
        value: 20,
        min: 1,
        max: w / 2,
        step: 1,
      },
      {
        type: 'Range',
        name: 'rotation',
        value: 0,
        min: 0,
        max: 360,
        step: 1,
      },
    ],
  })

  function setup() {
    cp.init()
    const canvas = p.createCanvas(w, h, p.WEBGL)

    p.ortho(-w / 2, w / 2, h / 2, -h / 2, -1000, 1000)
    p.colorMode(p.RGB, 255, 255, 255, 1)

    for (let i = 0; i < 150; i++) {
      vs.push(p.createVector(p.random(), p.random()))
    }

    return {
      canvas,
    }
  }

  function draw() {
    p.background(0)
    p.noFill()
    p.strokeWeight(2)

    const origin = p.createVector(0.0, 0.0)

    for (const v of vs) {
      p.stroke(chroma('magenta').rgba())
      const quad1 = transform(v.copy().mult(cp.scale), cp.rotation)
      p.line(origin.x, origin.y, quad1.x, quad1.y)

      const quad3 = quad1.copy().mult(-1)
      p.stroke(chroma('cyan').rgba())
      p.line(origin.x, origin.y, quad3.x, quad3.y)

      const quad4 = quad1.copy().mult(-1, 1)
      p.stroke(chroma('yellow').rgba())
      p.line(origin.x, origin.y, quad4.x, quad4.y)

      const quad2 = quad4.copy().mult(-1)
      p.stroke(chroma('khaki').rgba())
      p.line(origin.x, origin.y, quad2.x, quad2.y)
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

  function transform(vector, degrees) {
    const angle = p.radians(degrees)
    const transformMatrix = {
      a: p.cos(angle),
      b: -p.sin(angle),
      c: p.sin(angle),
      d: p.cos(angle),
    }
    return p.createVector(
      transformMatrix.a * vector.x + transformMatrix.b * vector.y,
      transformMatrix.c * vector.x + transformMatrix.d * vector.y,
    )
  }
}
