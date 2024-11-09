// eslint-disable-next-line no-unused-vars
import chroma from 'chroma-js'
import ControlPanel, { Checkbox } from '../lib/ControlPanel/index.mjs'

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const metadata = {
    name: 'worley',
    frameRate: 30,

    // p.pixels
    pixelDensity: 1,
  }
  const controlPanel = createControlPanel(p, metadata)
  const [w, h] = [500, 500]
  // eslint-disable-next-line no-unused-vars
  const center = p.createVector(w / 2, h / 2)

  const nPoints = 6
  const nthPoint = 0
  // w/2 for the full gradient, w/3 looks nice too
  const brightness = w / 2
  const points = []
  const pixels = []

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    p.colorMode(p.RGB, 255, 255, 255, 1)
    p.noLoop()

    for (let i = 0; i < nPoints; i++) {
      points[i] = p.createVector(p.random(w), p.random(h))
    }

    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        const distances = []
        for (let i = 0; i < points.length; i++) {
          const point = points[i]
          const distance = p.dist(x, y, point.x, point.y)
          distances[i] = distance
        }
        const sorted = p.sort(distances)
        const noise = sorted[nthPoint]
        const colorValue = p.map(noise, 0, brightness, 0, 255)
        const index = (x + y * w) * 4
        pixels[index] = colorValue
        pixels[index + 1] = colorValue
        pixels[index + 2] = colorValue
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
    p.stroke(0)
    p.strokeWeight(4)

    p.loadPixels()
    pixels.forEach((pixel, i) => {
      p.pixels[i] = pixel
    })
    p.updatePixels()

    if (showPoints) {
      points.forEach((point) => {
        p.stroke(0, 255, 0)
        p.point(point.x, point.y)
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
