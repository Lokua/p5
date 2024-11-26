import chroma from 'chroma-js'
import AnimationHelper from '../lib/AnimationHelper.mjs'
import { createControlPanel } from '../lib/ControlPanel/index.mjs'

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const metadata = {
    name: 'tetrahedra',
    frameRate: 30,

    // WARNING! This is probably too big
    // if recording video but perfect for images
    pixelDensity: 6,
  }

  const [w, h] = [500, 500]
  const center = p.createVector(w / 2, h / 2)
  let tetrahedra = []
  let camera
  let lastCount = 0

  const ah = new AnimationHelper({ p, frameRate: metadata.frameRate, bpm: 123 })

  const cp = createControlPanel({
    p,
    id: metadata.name,
    controls: [
      {
        type: 'Range',
        name: 'count',
        value: 10,
        min: 3,
        max: 100,
      },
      {
        type: 'Range',
        name: 'sphereRadius',
        value: 50,
        min: 10,
        max: 200,
      },
      {
        type: 'Range',
        name: 'tetraHeight',
        value: 20,
        min: 10,
        max: 200,
      },
      {
        type: 'Select',
        name: 'touching',
        options: ['tip', 'base'],
        value: 'base',
      },
      {
        type: 'Checkbox',
        name: 'showAxes',
        value: false,
      },
    ],
  })

  function setup() {
    cp.init()
    const canvas = p.createCanvas(w, h, p.WEBGL)

    p.colorMode(p.RGB, 255, 255, 255, 1)

    camera = p.createCamera()
    camera.setPosition(50, -50, 500)
    camera.lookAt(0, 0, 0)
    p.perspective(p.PI / 3, w / h, 0.1, 2000)

    ensureTetrahedraMatchesCount()

    return {
      canvas,
    }
  }

  function draw() {
    p.background(255)
    p.strokeWeight(1)
    p.stroke('purple')

    ensureTetrahedraMatchesCount()

    p.$.pushPop(() => {
      p.rotateY(p.frameCount * 0.05)
      p.rotateX(p.frameCount * 0.075)

      p.noStroke()
      p.fill('lavender')
      p.sphere(cp.sphereRadius)

      for (const [i, tetrahedron] of tetrahedra.entries()) {
        const theta = Math.acos(1 - (2 * (i + 0.5)) / cp.count)
        const phi = Math.PI * (3 - Math.sqrt(5)) * i
        const x = cp.sphereRadius * Math.sin(theta) * Math.cos(phi)
        const y = cp.sphereRadius * Math.sin(theta) * Math.sin(phi)
        const z = cp.sphereRadius * Math.cos(theta)

        p.$.pushPop(() => {
          p.translate(x, y, z)
          const normal = p.createVector(x, y, z).normalize()
          const up = p.createVector(0, 0, 1)
          const rotationAxis = up.cross(normal).normalize()
          const angle = Math.acos(up.dot(normal))
          if (rotationAxis.mag() > 0) {
            p.rotate(angle, rotationAxis)
          }
          if (cp.touching === 'tip') {
            p.rotateX(p.PI)
            p.translate(0, 0, -cp.tetraHeight)
          }
          tetrahedron.update({
            sizes: [cp.tetraHeight, 10, 10, 10],
          })
          tetrahedron.draw()
        })
      }
    })

    if (cp.showAxes) {
      debugAxes()
    }
  }

  function ensureTetrahedraMatchesCount() {
    if (lastCount !== cp.count) {
      tetrahedra = []
      for (let i = 0; i < cp.count; i++) {
        tetrahedra.push(
          new Tetrahedron({
            p,
            sizes: [cp.tetraHeight, 10, 10, 10],
            colors: chroma.scale(['mistyrose', 'pink', 'lavender']).colors(4),
          }),
        )
      }
      lastCount = cp.count
    }
  }

  function debugAxes() {
    p.strokeWeight(2)
    p.stroke('red')
    p.line(0, 0, 0, 200, 0, 0)
    p.stroke('green')
    p.line(0, 0, 0, 0, 200, 0)
    p.stroke('blue')
    p.line(0, 0, 0, 0, 0, 200)
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

class Tetrahedron {
  constructor({ p, sizes = [1, 1, 1, 1], colors }) {
    this.p = p
    this.sizes = sizes
    this.vertices = this.#computeVertices()
    this.colors = colors
  }

  update({ sizes, ...state }) {
    Object.assign(this, state)
    if (sizes) {
      this.sizes = sizes
      this.vertices = this.#computeVertices()
    }
  }

  draw(x = 0, y = 0, z = 0) {
    this.p.push()
    this.p.translate(x, y, z)
    this.p.beginShape(this.p.TRIANGLES)
    const [v0, v1, v2, v3] = this.vertices
    const faces = [
      [v0, v1, v2, this.colors?.[0]],
      [v0, v1, v3, this.colors?.[1]],
      [v0, v2, v3, this.colors?.[2]],
      [v1, v2, v3, this.colors?.[3]],
    ]
    for (const args of faces) {
      this.#drawFace(...args)
    }
    this.p.endShape()
    this.p.pop()
  }

  #computeVertices() {
    const [top, left, right, front] = this.sizes
    return [
      [0, 0, top],
      [-left, -left, 0],
      [right, -right, 0],
      [0, front, 0],
    ]
  }

  #drawFace(v1, v2, v3, color) {
    if (color) {
      this.p.fill(color)
    }
    this.p.vertex(...v1)
    this.p.vertex(...v2)
    this.p.vertex(...v3)
  }
}
