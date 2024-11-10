import chroma from 'chroma-js'
import { createControlPanel } from '../lib/ControlPanel/index.mjs'

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const metadata = {
    name: 'template',
    frameRate: 30,

    // WARNING! This is probably too big
    // if recording video but perfect for images
    pixelDensity: 6,
  }

  const controlPanel = createControlPanel({
    p,
    id: metadata.name,
    controls: [
      {
        type: 'Range',
        name: 'count',
        value: 100,
        min: 1,
        max: 100,
      },
      {
        type: 'Range',
        name: 'radius',
        value: 200,
        min: 40,
        max: 200,
      },
    ],
  })

  const [w, h] = [500, 500]

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
    const { count, radius } = controlPanel.values()
    p.background(255)
    p.noFill()
    p.stroke(chroma('red').rgba())

    const angleStep = p.TWO_PI / count

    for (let i = 0; i < count; i++) {
      const startAngle = p.PI * 1.5
      const angle = startAngle + i * angleStep
      const x = center.x + radius * p.cos(angle)
      const y = center.x + radius * p.sin(angle)
      p.circle(x, y, 10)
    }
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
