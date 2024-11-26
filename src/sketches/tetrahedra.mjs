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
  const tetrahedra = []
  let camera

  const ah = new AnimationHelper({ p, frameRate: metadata.frameRate, bpm: 123 })

  const cp = createControlPanel({
    p,
    id: metadata.name,
    controls: [
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

    for (let i = 0; i < 8; i++) {
      tetrahedra.push(
        new Tetrahedron(
          p,
          [1, 1, 1, 1],
          chroma.scale(['mistyrose', 'pink', 'lavender']).colors(4),
        ),
      )
    }

    return {
      canvas,
    }
  }

  function draw() {
    p.background(255)

    p.$.pushPop(() => {
      p.rotateY(p.frameCount * 0.1)
      p.rotateZ(p.frameCount * 0.05)
      p.strokeWeight(1)
      p.stroke('purple')

      p.$.pushPop(() => {
        p.translate(-100, 0, 0)
        drawTetrahedron(0)

        p.$.pushPop(() => {
          p.rotateZ(p.PI)
          drawTetrahedron(1)
        })
        p.$.pushPop(() => {
          p.rotateZ(-p.HALF_PI)
          drawTetrahedron(2)
        })
        p.$.pushPop(() => {
          p.rotateZ(p.HALF_PI)
          drawTetrahedron(3)
        })
      })

      // Mirrored structure
      p.$.pushPop(() => {
        p.translate(100, 0, 0)
        p.rotateX(p.PI) // Flip the entire structure upside down
        drawTetrahedron(4)

        p.$.pushPop(() => {
          p.rotateZ(p.PI)
          drawTetrahedron(5)
        })
        p.$.pushPop(() => {
          p.rotateZ(-p.HALF_PI)
          drawTetrahedron(6)
        })
        p.$.pushPop(() => {
          p.rotateZ(p.HALF_PI)
          drawTetrahedron(7)
        })
      })
    })

    cp.showAxes && debugAxes()
  }

  function drawTetrahedron(index) {
    const tetrahedron = tetrahedra[index]
    tetrahedron.update({
      vertices: [
        50,
        ah.animate([10, 200, 10], 12),
        100,
        ah.animate([60, 100, 60], 8),
      ],
    })
    tetrahedron.draw()
  }

  function debugAxes() {
    p.strokeWeight(2)

    // X-axis in red
    p.stroke(255, 0, 0)
    p.line(0, 0, 0, 200, 0, 0)

    // Y-axis in green
    p.stroke(0, 255, 0)
    p.line(0, 0, 0, 0, 200, 0)

    // Z-axis in blue
    p.stroke(0, 0, 255)
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
  constructor(p, vertices = [1, 1, 1, 1], colors) {
    this.p = p
    this.vertices = vertices
    this.colors = colors
  }

  update(state) {
    Object.assign(this, state)
  }

  draw(x = 0, y = 0, z = 0) {
    const [sizeTop, sizeLeft, sizeRight, sizeFront] = this.vertices

    this.p.push()
    this.p.translate(x, y, z)

    // Define vertices of the tetrahedron
    const vertices = [
      // Top vertex
      [0, -sizeTop, 0],
      // Left base vertex
      [-sizeLeft, sizeLeft, -sizeLeft],
      // Right base vertex
      [sizeRight, sizeRight, -sizeRight],
      // Front base vertex
      [0, sizeFront, sizeFront],
    ]

    // Draw faces of the tetrahedron
    this.p.beginShape(this.p.TRIANGLES)
    // Base face
    this.#drawFace(vertices[0], vertices[1], vertices[2], this.colors?.[0])
    // Left face
    this.#drawFace(vertices[0], vertices[1], vertices[3], this.colors?.[1])
    // Right face
    this.#drawFace(vertices[0], vertices[2], vertices[3], this.colors?.[2])
    // Bottom face
    this.#drawFace(vertices[1], vertices[2], vertices[3], this.colors?.[3])
    this.p.endShape()

    this.p.pop()
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
