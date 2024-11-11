import chroma from 'chroma-js'
import { lokuaScales, renderSwatches } from '../lib/colors.mjs'
import { createControlPanel } from '../lib/ControlPanel/index.mjs'
import Lines from '../lib/Lines.mjs'
import AnimationHelper from '../lib/AnimationHelper.mjs'
import { gridSpray } from './gridSpray.mjs'

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const metadata = {
    name: 'gridSprayAsBackground',
    frameRate: 30,
    pixelDensity: 6,
  }

  let buffer
  let spray

  const colorScale = chroma.scale(lokuaScales.amboyDrive)
  const lines = new Lines(p)
  const ah = new AnimationHelper({ p, frameRate: metadata.frameRate, bpm: 134 })

  const controlPanel = createControlPanel({
    p,
    id: metadata.name,
    controls: [
      {
        type: 'Checkbox',
        name: 'showSwatches',
        value: false,
      },
    ],
  })

  const [w, h] = [500, 500]
  const center = p.createVector(w / 2, h / 2)

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    p.colorMode(p.RGB, 255, 255, 255, 1)

    spray = gridSpray({
      p,
      w,
      h,
      intensity: 22,
      maxSegmentLength: 6,
      anomaly: 3,
      color1: colorScale(0.9).alpha(0.5).rgba(),
      color2: colorScale(1).alpha(0.5).rgba(),
    })

    return {
      canvas,
    }
  }

  function draw() {
    const { showSwatches } = controlPanel.values()
    p.background(255)

    !buffer && (buffer = spray({ splashes: 2 }))
    p.image(buffer, 0, 0, w, h)

    if (showSwatches) {
      renderSwatches({ p, w, scales: [colorScale] })
    }

    circle({
      p,
      x: center.x,
      y: center.y,
      d: ah.anim8([1, 800, 1], 128),
      segments: 6,
      fillStep: 4,
      fillOrder: 'trbl',
      fillPattern: 'random',
      lineFn: (...args) => {
        p.stroke(colorScale(0.2).rgba())
        lines.tapered(...args, [1, 2, 3, 1])
      },
      fillFn(x, y, index, totalPoints) {
        p.noStroke()
        p.fill(
          colorScale(index / totalPoints)
            .alpha(0.1)
            .rgba(),
        )
        p.circle(x, y, 4)
      },
    })
  }

  function circle({
    p,
    x,
    y,
    d = 20,
    segments = 100,
    fillStep = 1,
    fillOrder = 'trbl',
    fillPattern = 'spiral',
    lineFn,
    fillFn,
  }) {
    const radius = d / 2
    const angleStep = p.TWO_PI / segments
    const points = []

    for (let i = 0; i <= segments; i++) {
      const angle = i * angleStep
      const px = x + p.cos(angle) * radius
      const py = y + p.sin(angle) * radius
      points.push({ x: px, y: py })
    }

    if (fillFn) {
      const left = Math.floor(x - radius)
      const right = Math.ceil(x + radius)
      const top = Math.floor(y - radius)
      const bottom = Math.ceil(y + radius)
      const centerX = x
      const centerY = y
      const validPoints = []

      const pushIfInPolygon = (x, y) =>
        pointInPolygon(x, y, points) && validPoints.push({ x, y })

      if (fillOrder === 'tlbr') {
        for (let px = left; px <= right; px += fillStep) {
          for (let py = top; py <= bottom; py += fillStep) {
            pushIfInPolygon(px, py)
          }
        }
      } else if (fillOrder === 'trbl') {
        for (let px = right; px >= left; px -= fillStep) {
          for (let py = top; py <= bottom; py += fillStep) {
            pushIfInPolygon(px, py)
          }
        }
      } else if (fillOrder === 'brtl') {
        for (let px = right; px >= left; px -= fillStep) {
          for (let py = bottom; py >= top; py -= fillStep) {
            pushIfInPolygon(px, py)
          }
        }
      } else if (fillOrder === 'bltr') {
        for (let px = left; px <= right; px += fillStep) {
          for (let py = bottom; py >= top; py -= fillStep) {
            pushIfInPolygon(px, py)
          }
        }
      } else if (fillOrder === 'inward') {
        // Top-Left quadrant: left to right, top to bottom
        for (let px = left; px <= (left + right) / 2; px += fillStep) {
          for (let py = top; py <= (top + bottom) / 2; py += fillStep) {
            pushIfInPolygon(px, py)
          }
        }
        // Top-Right quadrant: right to left, top to bottom
        for (let px = right; px >= (left + right) / 2; px -= fillStep) {
          for (let py = top; py <= (top + bottom) / 2; py += fillStep) {
            pushIfInPolygon(px, py)
          }
        }
        // Bottom-Left quadrant: left to right, bottom to top
        for (let px = left; px <= (left + right) / 2; px += fillStep) {
          for (let py = bottom; py >= (top + bottom) / 2; py -= fillStep) {
            pushIfInPolygon(px, py)
          }
        }
        // Bottom-Right quadrant: right to left, bottom to top
        for (let px = right; px >= (left + right) / 2; px -= fillStep) {
          for (let py = bottom; py >= (top + bottom) / 2; py -= fillStep) {
            pushIfInPolygon(px, py)
          }
        }
      } else if (fillOrder === 'outward') {
        // Top-Left quadrant: start from center and move to top-left corner
        for (let py = (top + bottom) / 2; py >= top; py -= fillStep) {
          for (let px = (left + right) / 2; px >= left; px -= fillStep) {
            pushIfInPolygon(px, py)
          }
        }
        // Top-Right quadrant: start from center and move to top-right corner
        for (let py = (top + bottom) / 2; py >= top; py -= fillStep) {
          for (let px = (left + right) / 2; px <= right; px += fillStep) {
            pushIfInPolygon(px, py)
          }
        }
        // Bottom-Left quadrant: start from center and move to bottom-left corner
        for (let py = (top + bottom) / 2; py <= bottom; py += fillStep) {
          for (let px = (left + right) / 2; px >= left; px -= fillStep) {
            pushIfInPolygon(px, py)
          }
        }
        // Bottom-Right quadrant: start from center and move to bottom-right corner
        for (let py = (top + bottom) / 2; py <= bottom; py += fillStep) {
          for (let px = (left + right) / 2; px <= right; px += fillStep) {
            pushIfInPolygon(px, py)
          }
        }
      }

      if (fillPattern === 'spiral') {
        validPoints.sort((a, b) => {
          const angleA = Math.atan2(a.y - centerY, a.x - centerX)
          const angleB = Math.atan2(b.y - centerY, b.x - centerX)
          const distA = Math.hypot(a.x - centerX, a.y - centerY)
          const distB = Math.hypot(b.x - centerX, b.y - centerY)
          return distA - distB || angleA - angleB
        })
      } else if (fillPattern === 'radial') {
        validPoints.sort((a, b) => {
          const distA = Math.hypot(a.x - centerX, a.y - centerY)
          const distB = Math.hypot(b.x - centerX, b.y - centerY)
          return distA - distB
        })
      } else if (fillPattern === 'random') {
        for (let i = validPoints.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[validPoints[i], validPoints[j]] = [validPoints[j], validPoints[i]]
        }
      }

      for (let i = 0; i < validPoints.length; i++) {
        const point = validPoints[i]
        fillFn(point.x, point.y, i, validPoints.length, radius)
      }
    } else {
      p.noStroke()
      p.beginShape()
      p.vertex(x, y)
      for (let i = 0; i <= segments; i++) {
        const pt = points[i]
        p.vertex(pt.x, pt.y)
      }
      p.endShape(p.CLOSE)
    }

    for (let i = 0; i < segments; i++) {
      const start = points[i]
      const end = points[(i + 1) % segments]
      if (lineFn) {
        lineFn(start.x, start.y, end.x, end.y)
      } else {
        p.line(start.x, start.y, end.x, end.y)
      }
    }
  }

  function pointInPolygon(x, y, vertices) {
    let inside = false
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      const [xi, yi] = [vertices[i].x, vertices[i].y]
      const [xj, yj] = [vertices[j].x, vertices[j].y]
      const intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
      if (intersect) {
        inside = !inside
      }
    }
    return inside
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
