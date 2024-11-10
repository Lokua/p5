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

    !buffer && (buffer = spray(2))
    p.image(buffer, 0, 0, w, h)

    if (showSwatches) {
      renderSwatches({ p, w, scales: [colorScale] })
    }

    circle({
      p,
      x: w / 2,
      y: h / 2,
      d: ah.anim8([200, 500, 200], 16),
      segments: 6,
      fillStep: ah.anim8([12, 24, 12], 8),
      lineFn: (...args) => {
        p.stroke(colorScale(0.2).rgba())
        lines.tapered(...args, [1, 2, 3, 1])
      },
      fillFn(x, y) {
        p.noStroke()
        p.fill(colorScale(p.random()).alpha(0.1).rgba())
        p.circle(x, y, 10)
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
      const left = x - radius
      const right = x + radius
      const top = y - radius
      const bottom = y + radius

      for (let px = left; px <= right; px += fillStep) {
        for (let py = top; py <= bottom; py += fillStep) {
          if (pointInPolygon(px, py, points)) {
            fillFn(px, py)
          }
        }
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
