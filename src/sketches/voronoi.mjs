import chroma from 'chroma-js'
import ControlPanel, { Checkbox } from '../lib/ControlPanel/index.mjs'

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const metadata = {
    name: 'voronoi',
    frameRate: 30,
    pixelDensity: 1,
  }
  const controlPanel = createControlPanel(p, metadata)
  const [w, h] = [500, 500]

  const count = 24
  const colors = chroma.scale('Viridis').colors(count)

  const sites = Array.from({ length: count }, () => ({
    x: p.random(w),
    y: p.random(h),
    color: colors[p.int(p.random(colors.length))],
  }))

  const pixels = []
  const epsilon = 1

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    p.colorMode(p.RGB, 255, 255, 255, 1)
    p.noLoop()

    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        const { closest, secondClosest } = sites.reduce(
          (acc, site) => {
            const distance = p.dist(x, y, site.x, site.y)
            if (distance < acc.closest.distance) {
              acc.secondClosest = acc.closest
              acc.closest = { site, distance }
            } else if (distance < acc.secondClosest.distance) {
              acc.secondClosest = { site, distance }
            }
            return acc
          },
          {
            closest: { site: null, distance: Number.MAX_SAFE_INTEGER },
            secondClosest: { site: null, distance: Number.MAX_SAFE_INTEGER },
          },
        )

        const isBoundary =
          Math.abs(closest.distance - secondClosest.distance) < epsilon

        const index = (x + y * w) * 4
        const value = isBoundary ? 255 : 0
        pixels[index] = value
        pixels[index + 1] = value
        pixels[index + 2] = value
        pixels[index + 3] = 255
      }
    }

    return {
      canvas,
    }
  }

  function draw() {
    const { showPoints } = controlPanel.values()
    p.background(255)
    p.strokeWeight(4)

    // Assign precomputed pixels to p.pixels
    p.loadPixels() // Ensure the pixels array is loaded and ready for writing
    for (let i = 0; i < pixels.length; i++) {
      p.pixels[i] = pixels[i]
    }
    p.updatePixels() // Update the canvas with the new pixel data

    if (showPoints) {
      sites.forEach(({ x, y }) => {
        p.stroke(255)
        p.point(x, y)
      })
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

function createControlPanel(p, metadata) {
  return new ControlPanel({
    p,
    id: metadata.name,
    controls: {
      showPoints: new Checkbox({
        name: 'showPoints',
        value: true,
      }),
    },
  })
}
