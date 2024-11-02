// @ts-check
import chroma from 'chroma-js'
import ControlPanel, {
  Checkbox,
  Checklist,
  Range,
} from '../lib/ControlPanel/index.mjs'
import AnimationHelper from '../lib/AnimationHelper.mjs'
import { d3ColorScales } from '../lib/colors.mjs'
import Lines from '../lib/Lines.mjs'

/**
 * @param {import("p5")} p
 */
export default function (p) {
  const [w, h] = [500, 500]

  const metadata = {
    name: 'circleOfCircles',
    frameRate: 30,
  }

  const ah = new AnimationHelper({ p, frameRate: metadata.frameRate, bpm: 130 })

  const baseScale = d3ColorScales.magma.slice(0, -3)
  const colorScale = chroma.scale(baseScale)
  const pingPongColorScale = chroma.scale(
    baseScale.concat(baseScale.slice(0, -1).toReversed()),
  )

  const lines = new Lines(p)

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
        value: 3,
        min: 1,
        max: 8,
      }),
      amplitude: new Range({
        name: 'amplitude',
        value: 70,
        min: 1,
        max: 100,
      }),
      outerRadius: new Range({
        name: 'outerRadius',
        value: 160,
        min: 10,
        max: 250,
      }),
      innerRadius: new Range({
        name: 'innerRadius',
        value: 68,
        min: 10,
        max: 250,
      }),
      diameter: new Range({
        name: 'diameter',
        value: 10,
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
        value: true,
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
        value: true,
      }),
      animated: new Checkbox({
        name: 'animated',
        value: true,
      }),
      bordered: new Checkbox({
        name: 'bordered',
        value: true,
      }),
      pairConnectors: new Checklist({
        name: 'pairConnectors',
        options: {
          even: true,
          odd: true,
        },
      }),
      shadows: new Checklist({
        name: 'shadows',
        options: {
          evenA: false,
          evenB: false,
          oddA: false,
          oddB: false,
        },
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
      pairConnectors,
      shadows,
      bordered,
    } = controlPanel.values()

    p.noFill()
    !bordered && p.noStroke()

    if (darkBg) {
      p.background(0)
    } else {
      p.background(255)
      p.fill(colorScale(1).alpha(0.05).rgba())
      p.rect(0, 0, w, h)
    }

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
      const outerDelay = base
      const innerDelay = 1
      const scale = pingPongColors ? pingPongColorScale : colorScale
      const color = scale(i / count).rgba()
      const angle = startAngle + i * angleStep
      const direction = {
        x: p.cos(angle),
        y: p.sin(angle),
      }

      p.stroke(color)
      fill && p.fill(color)

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

      drawInnerToOuterConnectingLine(
        innerPoint,
        outerPoint,
        innerDiameter,
        diameter,
        direction,
      )

      const nextAngle = startAngle + (i + 1) * angleStep
      const nextDir = {
        x: p.cos(nextAngle),
        y: p.sin(nextAngle),
      }
      const evenDelay = delayStep * i + delayStep * 2
      const oddDelay = (delayStep * i + delayStep * 2) * 2
      const nextInnerPoint = calculateCirclePoint(
        cx,
        cy,
        innerRadius,
        animateOffset(true, innerDelay, delayStep * i + delayStep * 2),
        nextDir,
      )
      const nextOuterPoint = calculateCirclePoint(
        cx,
        cy,
        outerRadius,
        animateOffset(true, outerDelay, oddDelay),
        nextDir,
      )
      const alpha = 0.1

      if (i % 2 === 0) {
        if (pairConnectors.even) {
          drawPairConnectingLine({
            animationEnabled: inner,
            currentPoint: innerPoint,
            delay: evenDelay,
            diameter: innerDiameter,
            duration: innerDelay,
            radius: innerRadius,
            cx,
            cy,
            nextDir,
          })
        }
        if (shadows.evenA) {
          p.noStroke()
          p.fill(chroma(color).alpha(alpha).rgba())
          p.triangle(
            innerPoint.x,
            innerPoint.y,
            nextInnerPoint.x,
            nextInnerPoint.y,
            outerPoint.x,
            outerPoint.y,
          )
          p.noFill()
        }
        if (shadows.evenB) {
          p.noStroke()
          p.fill(chroma(color).alpha(alpha).rgba())
          p.triangle(
            innerPoint.x,
            innerPoint.y,
            nextInnerPoint.x,
            nextInnerPoint.y,
            nextOuterPoint.x,
            nextOuterPoint.y,
          )
          p.noFill()
        }
      } else {
        if (pairConnectors.odd) {
          drawPairConnectingLine({
            animationEnabled: outer,
            currentPoint: outerPoint,
            delay: oddDelay,
            duration: outerDelay,
            radius: outerRadius,
            diameter,
            cx,
            cy,
            nextDir,
          })
        }
        if (shadows.oddA) {
          p.noStroke()
          p.fill(chroma(color).alpha(alpha).rgba())
          p.triangle(
            innerPoint.x,
            innerPoint.y,
            outerPoint.x,
            outerPoint.y,
            nextOuterPoint.x,
            nextOuterPoint.y,
          )
          p.noFill()
        }
        if (shadows.oddB) {
          p.noStroke()
          p.fill(chroma(color).alpha(alpha).rgba())
          p.triangle(
            outerPoint.x,
            outerPoint.y,
            nextOuterPoint.x,
            nextOuterPoint.y,
            nextInnerPoint.x,
            nextInnerPoint.y,
          )
          p.noFill()
        }
      }
    }
  }

  function drawInnerToOuterConnectingLine(
    point1,
    point2,
    diameter1,
    diameter2,
    direction,
  ) {
    lines.tapered(
      ...Object.values(
        calculateEdgePoint(point1.x, point1.y, diameter1, direction),
      ),
      ...Object.values(
        calculateEdgePoint(point2.x, point2.y, diameter2, direction, true),
      ),
      [1, 4, 1],
    )
  }

  function calculateEdgePoint(x, y, diameter, direction, invert = false) {
    const factor = invert ? -1 : 1
    return {
      x: x + factor * (diameter / 2) * direction.x,
      y: y + factor * (diameter / 2) * direction.y,
    }
  }

  function drawPairConnectingLine({
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
    lines.tapered(
      currentPoint.x + halfDiameter * toNextDir.x,
      currentPoint.y + halfDiameter * toNextDir.y,
      nextPoint.x - halfDiameter * toNextDir.x,
      nextPoint.y - halfDiameter * toNextDir.y,
      [1, 2, 1],
    )
  }

  function calculateCirclePoint(cx, cy, radius, offset, direction) {
    return {
      x: cx + (radius + offset) * direction.x,
      y: cy + (radius + offset) * direction.y,
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
