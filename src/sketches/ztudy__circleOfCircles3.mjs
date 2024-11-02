// @ts-check
import chroma from 'chroma-js'
import ControlPanel, { Checkbox, Range } from '../lib/ControlPanel/index.mjs'
import AnimationHelper from '../lib/AnimationHelper.mjs'
import { d3ColorScales } from '../lib/colors.mjs'

/**
 * @param {import("p5")} p
 */
export default function (p) {
  const metadata = {
    name: 'ztudy__circleOfCircles3',
    frameRate: 30,
  }

  const [w, h] = [500, 500]
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
      animated: new Checkbox({
        name: 'animated',
        value: true,
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
      animated,
    } = controlPanel.values()

    p.background(darkBg ? 0 : 255)
    p.noFill()

    const cx = w / 2
    const cy = h / 2
    const count = base * 4 * multiplier
    const angleStep = p.TWO_PI / count
    const startAngle = rotate ? ah.anim8([0, p.TWO_PI], 36) : p.PI / 2

    ah.disabled = !animated

    for (
      let i = 0, delayStep = 0.25, delay = delayStep;
      i < count;
      i++, delay += delayStep
    ) {
      const angle = startAngle + i * angleStep
      const direction = { x: p.cos(angle), y: p.sin(angle) }
      const outerDelay = base
      const innerDelay = 1
      const scale = pingPongColors ? pingPongColorScale : colorScale
      const color = scale(i / count).rgba()

      p.stroke(color)
      if (fill) {
        p.fill(color)
      }

      const outerOffset = animateOffset(outer, outerDelay, delay * 2)
      const outerPoint = calculateCirclePoint(
        cx,
        cy,
        outerRadius,
        outerOffset,
        direction,
      )
      p.circle(outerPoint.x, outerPoint.y, diameter)

      const innerOffset = animateOffset(inner, innerDelay, delay)
      const innerDiameter = diameter * (2 / 3)
      const innerPoint = calculateCirclePoint(
        cx,
        cy,
        innerRadius,
        innerOffset,
        direction,
      )
      p.circle(innerPoint.x, innerPoint.y, innerDiameter)

      drawConnectingLine(
        innerPoint,
        outerPoint,
        innerDiameter,
        diameter,
        direction,
      )

      const nextAngle = startAngle + (i + 1) * angleStep
      const nextDir = { x: p.cos(nextAngle), y: p.sin(nextAngle) }

      if (i % 2 === 0) {
        drawPairLine({
          animationEnabled: inner,
          currentPoint: innerPoint,
          delay: delayStep * i + delayStep * 2,
          diameter: innerDiameter,
          duration: innerDelay,
          radius: innerRadius,
          cx,
          cy,
          nextDir,
        })
      } else {
        drawPairLine({
          animationEnabled: outer,
          currentPoint: outerPoint,
          delay: (delayStep * i + delayStep * 2) * 2,
          duration: outerDelay,
          radius: outerRadius,
          diameter,
          cx,
          cy,
          nextDir,
        })
      }
    }
  }

  function drawConnectingLine(point1, point2, diameter1, diameter2, direction) {
    p.line(
      ...Object.values(
        calculateEdgePoint(point1.x, point1.y, diameter1, direction),
      ),
      ...Object.values(
        calculateEdgePoint(point2.x, point2.y, diameter2, direction, true),
      ),
    )
  }

  function drawPairLine({
    animationEnabled,
    cx,
    cy,
    radius,
    diameter,
    currentPoint,
    nextDir,
    delay,
    duration,
  }) {
    const offset = animateOffset(animationEnabled, duration, delay)

    const nextPoint = calculateCirclePoint(cx, cy, radius, offset, nextDir)
    const toNextDir = calculateToNextDir(
      currentPoint.x,
      currentPoint.y,
      nextPoint.x,
      nextPoint.y,
    )

    const halfDiameter = diameter / 2
    p.line(
      currentPoint.x + halfDiameter * toNextDir.x,
      currentPoint.y + halfDiameter * toNextDir.y,
      nextPoint.x - halfDiameter * toNextDir.x,
      nextPoint.y - halfDiameter * toNextDir.y,
    )
  }

  function calculateCirclePoint(cx, cy, radius, offset, direction) {
    return {
      x: cx + (radius + offset) * direction.x,
      y: cy + (radius + offset) * direction.y,
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
