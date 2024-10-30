// @ts-check
import chroma from 'chroma-js'
import ControlPanel, { Checkbox, Range } from '../ControlPanel/index.mjs'
import AnimationHelper from '../AnimationHelper.mjs'
import { d3ColorScales } from '../colors.mjs'

/**
 * @param {import("p5")} p
 */
export default function (p) {
  const [w, h] = [500, 500]

  const metadata = {
    name: 'ztudy__circleOfCircles3',
    frameRate: 30,
  }

  const ah = new AnimationHelper({ p, frameRate: metadata.frameRate, bpm: 130 })

  const baseScale = d3ColorScales.magma.slice(0, -3)
  const colorScale = chroma.scale(baseScale)
  const pingPongColorScale = chroma.scale(
    baseScale.concat(baseScale.slice(0, -1).toReversed()),
  )

  const controlPanel = new ControlPanel({
    p,
    id: metadata.name,
    controls: {
      base: new Range({
        name: 'base',
        value: 3,
        min: 2,
        max: 11,
      }),
      multiplier: new Range({
        name: 'multiplier',
        value: 1,
        min: 1,
        max: 8,
      }),
      amplitude: new Range({
        name: 'amplitude',
        value: 20,
        min: 1,
        max: 100,
      }),
      outerRadius: new Range({
        name: 'outerRadius',
        value: 200,
        min: 10,
        max: 250,
      }),
      innerRadius: new Range({
        name: 'innerRadius',
        value: 40,
        min: 10,
        max: 250,
      }),
      diameter: new Range({
        name: 'diameter',
        value: 20,
        min: 2,
        max: 20,
      }),
      fill: new Checkbox({
        name: 'fill',
        value: false,
      }),
      rotate: new Checkbox({
        name: 'rotate',
        value: false,
      }),
      pingPongColors: new Checkbox({
        name: 'pingPongColors',
        value: false,
      }),
      darkBg: new Checkbox({
        name: 'darkBg',
        value: false,
      }),
      inner: new Checkbox({
        name: 'inner',
        value: true,
      }),
      outer: new Checkbox({
        name: 'outer',
        value: false,
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

  function draw() {
    const {
      base,
      multiplier,
      outerRadius,
      innerRadius,
      diameter,
      fill,
      rotate,
      pingPongColors,
      darkBg,
      inner,
      outer,
    } = controlPanel.values()

    const count = base * 4 * multiplier

    p.background(darkBg ? 0 : 255)
    p.noFill()

    const cx = w / 2
    const cy = h / 2
    const angleStep = p.TWO_PI / count
    const startAngle = rotate ? ah.anim8([0, p.TWO_PI], 36) : p.PI / 2

    for (
      let i = 0, delayStep = 0.25, delay = delayStep;
      i < count;
      i++, delay += delayStep
    ) {
      const angle = startAngle + i * angleStep
      const direction = { x: p.cos(angle), y: p.sin(angle) }
      const d = direction

      const outerDelay = base
      const innerDelay = 1

      const scale = pingPongColors ? pingPongColorScale : colorScale
      const color = scale(i / count).rgba()

      p.stroke(color)
      fill && p.fill(color)

      const outerOffset = animateOffset(outer, outerDelay, delay * 2)
      const x = cx + outerRadius * d.x + outerOffset * d.x
      const y = cy + outerRadius * d.y + outerOffset * d.y
      p.circle(x, y, diameter)

      const innerDiameter = diameter * (2 / 3)
      const innerOffset = animateOffset(inner, innerDelay, delay)
      const ix = cx + innerRadius * d.x + innerOffset * d.x
      const iy = cy + innerRadius * d.y + innerOffset * d.y

      p.circle(ix, iy, innerDiameter)

      p.line(
        ...Object.values(calculateEdgePoint(ix, iy, innerDiameter, d)),
        ...Object.values(calculateEdgePoint(x, y, diameter, d, true)),
      )

      const nextAngle = startAngle + (i + 1) * angleStep
      const nextDir = { x: p.cos(nextAngle), y: p.sin(nextAngle) }

      if (i % 2 === 0) {
        const nextDelay = delayStep * i + delayStep * 2
        const offset = animateOffset(inner, innerDelay, nextDelay)
        const nextPoint = getNextPoint(cx, cy, innerRadius, offset, nextDir)
        const toNextDir = calculateToNextDir(ix, iy, nextPoint.x, nextPoint.y)

        const d = innerDiameter / 2
        const startX = ix + d * toNextDir.x
        const startY = iy + d * toNextDir.y
        const endX = nextPoint.x - d * toNextDir.x
        const endY = nextPoint.y - d * toNextDir.y

        p.line(startX, startY, endX, endY)
      } else {
        const nextDelay = (delayStep * i + delayStep * 2) * 2
        const offset = animateOffset(outer, outerDelay, nextDelay)
        const nextPoint = getNextPoint(cx, cy, outerRadius, offset, nextDir)
        const toNextDir = calculateToNextDir(x, y, nextPoint.x, nextPoint.y)

        const d = innerDiameter / 2
        const startX = x + d * toNextDir.x
        const startY = y + d * toNextDir.y
        const endX = nextPoint.x - d * toNextDir.x
        const endY = nextPoint.y - d * toNextDir.y

        p.line(startX, startY, endX, endY)
      }
    }
  }

  function calculateEdgePoint(x, y, diameter, direction, invert = false) {
    const factor = invert ? -1 : 1
    return {
      x: x + factor * (diameter / 2) * direction.x,
      y: y + factor * (diameter / 2) * direction.y,
    }
  }

  function calculateToNextDir(x1, y1, x2, y2) {
    const toNext = { x: x2 - x1, y: y2 - y1 }
    const mag = Math.sqrt(toNext.x ** 2 + toNext.y ** 2)
    return {
      x: toNext.x / mag,
      y: toNext.y / mag,
    }
  }

  function getNextPoint(x, y, radius, offset, nextDir) {
    const nextX = x + radius * nextDir.x + offset * nextDir.x
    const nextY = y + radius * nextDir.y + offset * nextDir.y
    return {
      x: nextX,
      y: nextY,
    }
  }

  function animateOffset(enabled, duration, delay) {
    return enabled
      ? ah.animate({
          keyframes: [0, controlPanel.get('amplitude'), 0],
          duration,
          every: controlPanel.get('base'),
          delay,
        })
      : 0
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
