import chroma from 'chroma-js'
import { lokuaScales } from '../lib/colors.mjs'
import { createControlPanel } from '../lib/ControlPanel/index.mjs'

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const metadata = {
    name: 'recurse',
    frameRate: 30,
    pixelDensity: 6,
  }

  const [w, h] = [500, 500]
  const center = p.createVector(w / 2, h / 2)

  const scale = chroma.scale(lokuaScales.goat)

  const controlPanel = createControlPanel({
    p,
    id: metadata.name,
    controls: [
      {
        type: 'Range',
        name: 'depth',
        value: 3,
        min: 1,
        max: 10,
      },
      {
        type: 'Range',
        name: 'radius',
        value: 200,
        min: 40,
        max: 200,
      },
      {
        type: 'Range',
        name: 'childScale',
        value: 0.5,
        min: 0.3,
        max: 0.7,
        step: 0.01,
      },
      {
        type: 'Range',
        name: 'branches',
        value: 6,
        min: 3,
        max: 8,
      },
    ],
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)
    p.colorMode(p.RGB, 255, 255, 255, 1)
    return { canvas }
  }

  function draw() {
    const { depth, radius, branches } = controlPanel.values()
    p.background(0)
    drawRecursiveCircles(center.x, center.y, radius, 0, depth, branches)
  }

  function drawRecursiveCircles(x, y, radius, depth, maxDepth, branches) {
    // Draw current circle
    p.circle(x, y, radius * 2)

    if (depth >= maxDepth) {
      return
    }

    const { childScale } = controlPanel.values()
    const newRadius = radius * childScale
    const angleStep = p.TWO_PI / branches

    // Draw child circles
    for (let i = 0; i < branches; i++) {
      const angle = i * angleStep
      const distance = radius + newRadius
      const newX = x + p.cos(angle) * distance
      const newY = y + p.sin(angle) * distance
      p.noFill()
      p.stroke(scale(0.5).rgba())
      drawRecursiveCircles(newX, newY, newRadius, depth + 1, maxDepth, branches)
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
