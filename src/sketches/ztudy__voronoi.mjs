import ControlPanel, { Checkbox } from '../lib/ControlPanel/index.mjs'

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const metadata = {
    name: 'ztudy__voronoi',
    frameRate: 30,
    pixelDensity: 1,
  }
  const controlPanel = createControlPanel(p, metadata)
  const [w, h] = [500, 500]

  let diagram

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    p.colorMode(p.RGB, 255, 255, 255, 1)
    p.noLoop()

    diagram = generateVoronoiDiagram({
      count: 24,
      epsilon: 1,
    })

    return {
      canvas,
    }
  }

  function draw() {
    const { showPoints, applySmoothing: makeSmooth } = controlPanel.values()
    p.background(255)
    p.strokeWeight(4)

    p.loadPixels()
    const pixels = makeSmooth ? applySmoothing(diagram.pixels) : diagram.pixels
    pixels.forEach((value, i) => {
      p.pixels[i] = value
    })
    p.updatePixels()

    if (showPoints) {
      diagram.sites.forEach(({ x, y }) => {
        p.stroke(255)
        p.point(x, y)
      })
    }
  }

  function generateVoronoiDiagram({ count, epsilon }) {
    const pixels = []

    const sites = Array.from({ length: count }, () => ({
      x: p.random(w),
      y: p.random(h),
    }))

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
      sites,
      pixels,
    }
  }

  function applySmoothing(pixels) {
    const smoothedPixels = pixels.slice()

    for (let x = 1; x < w - 1; x++) {
      for (let y = 1; y < h - 1; y++) {
        const index = (x + y * w) * 4
        const neighbors = [
          pixels[(x - 1 + y * w) * 4],
          pixels[(x + 1 + y * w) * 4],
          pixels[(x + (y - 1) * w) * 4],
          pixels[(x + (y + 1) * w) * 4],
        ]

        const avg =
          neighbors.reduce((sum, value) => sum + value, 0) / neighbors.length
        smoothedPixels[index] = avg
        smoothedPixels[index + 1] = avg
        smoothedPixels[index + 2] = avg
        smoothedPixels[index + 3] = 255
      }
    }

    return smoothedPixels
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
      applySmoothing: new Checkbox({
        name: 'applySmoothing',
        value: false,
      }),
    },
  })
}
