// @ts-check
import chroma from 'chroma-js'
import ControlPanel, { Range } from '../lib/ControlPanel/index.mjs'

/**
 * @param {import("p5")} p
 */
export default function (p) {
  const metadata = {
    name: 'blobbiness',
    frameRate: 120,
  }

  const [w, h] = [500, 500]

  const scale = chroma.scale(['#222', chroma('azure').saturate(0.25)])

  const controlPanel = new ControlPanel({
    p,
    id: metadata.name,
    controls: {
      radius: new Range({
        name: 'radius',
        value: 100,
        min: 1,
        max: 500,
      }),
      blobbiness: new Range({
        name: 'blobbiness',
        value: 0,
        min: 0,
        max: 1000,
        step: 1,
      }),
      seed: new Range({
        name: 'seed',
        // value=0 yields symmetric blob
        value: 1,
        min: 0,
        max: 1000,
        step: 1,
      }),
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    p.colorMode(p.RGB, 255, 255, 255, 1)

    return {
      canvas,
    }
  }

  const center = p.createVector(w / 2, h / 2)

  function draw() {
    const { radius, blobbiness, seed } = controlPanel.values()
    p.background(255)

    p.noStroke()
    p.fill(scale(0.5).rgba())

    blobbyCircle({
      x: center.x,
      y: center.y,
      radius,
      blobbiness,
      seed,
    })
  }

  function blobbyCircle({ x, y = x, radius, blobbiness = 0, seed = 0 }) {
    const numVertices = 200
    const smoothingFactor = 0.2

    p.noiseSeed(seed)

    p.beginShape()
    for (let i = 0; i < p.TWO_PI; i += p.TWO_PI / numVertices) {
      const angle = i

      const baseNoise = p.noise(
        p.cos(angle) * 0.5 + seed,
        p.sin(angle) * 0.5 + seed,
      )

      const noiseLeft = p.noise(
        p.cos(angle - smoothingFactor) * 0.5 + seed,
        p.sin(angle - smoothingFactor) * 0.5 + seed,
      )

      const noiseRight = p.noise(
        p.cos(angle + smoothingFactor) * 0.5 + seed,
        p.sin(angle + smoothingFactor) * 0.5 + seed,
      )

      const smoothNoise = (baseNoise + noiseLeft + noiseRight) / 3

      const offset = (smoothNoise - 0.5) * 2 * blobbiness
      const blobX = x + p.cos(angle) * (radius + offset)
      const blobY = y + p.sin(angle) * (radius + offset)

      p.vertex(blobX, blobY)
    }
    p.endShape(p.CLOSE)
  }

  return {
    setup,
    draw,
    destroy() {
      controlPanel.destroy()
    },
    metadata,
  }
}
