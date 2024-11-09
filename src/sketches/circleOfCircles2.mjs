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
  const metadata = {
    name: 'circleOfCircles2',
    frameRate: 30,
  }

  const [w, h] = [500, 500]
  const center = p.createVector(w / 2, h / 2)
  const taperedWeights = [1, 3, 1]

  const baseScale = d3ColorScales.magma.slice(0, -3)
  const colorScale = chroma.scale(
    baseScale.concat(baseScale.slice(0, -1).toReversed()),
  )

  const ah = new AnimationHelper({
    p,
    frameRate: metadata.frameRate,
    bpm: 130,
  })

  const lines = new Lines(p)

  const controlPanel = createControlPanel(p, metadata)

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    p.colorMode(p.RGB, 255, 255, 255, 1)

    return {
      canvas,
    }
  }

  const createRandos = () => Array.from({ length: 6 }, () => p.random(10, 250))

  const outerRadiusValues = createRandos()
  outerRadiusValues.push(...outerRadiusValues.toReversed())

  const innerRadiusValues = createRandos()
  innerRadiusValues.push(...innerRadiusValues.toReversed())

  function draw() {
    const {
      outerDelayDuration,
      innerDelayDuration,
      multiplier,
      diameter,
      darkBg,
      bordered,
      amplitude,
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

    const outerRadius = ah.anim8(outerRadiusValues, 12, 12)
    const innerRadius = ah.anim8(innerRadiusValues, 16, 16)

    const rings = [
      {
        outerDelayDuration,
        innerDelayDuration,
        multiplier,
        outerRadius,
        innerRadius,
        diameter,
        amplitude,
      },
      {
        outerDelayDuration,
        innerDelayDuration,
        multiplier,
        innerRadius: outerRadius * 0.5,
        outerRadius: innerRadius * 0.5,
        diameter: diameter / 2,
        amplitude: amplitude / 2,
      },
      {
        outerDelayDuration,
        innerDelayDuration,
        multiplier,
        outerRadius: outerRadius * 0.25,
        innerRadius: innerRadius * 0.25,
        diameter: diameter / 4,
        amplitude: amplitude / 4,
      },
      {
        outerDelayDuration,
        innerDelayDuration,
        multiplier,
        innerRadius: outerRadius * 0.125,
        outerRadius: innerRadius * 0.125,
        diameter: diameter / 8,
        amplitude: amplitude / 8,
      },
    ]

    rings.forEach(drawRing)
  }

  function drawRing({
    outerDelayDuration,
    innerDelayDuration,
    multiplier,
    outerRadius,
    innerRadius,
    diameter,
    amplitude,
  }) {
    const { fill, rotate, inner, outer, animated, pairConnectors, shadows } =
      controlPanel.values()

    const count = outerDelayDuration * multiplier
    const angleStep = p.TWO_PI / count
    const startAngle = rotate ? ah.anim8([0, p.TWO_PI], 32) : p.PI / 2

    ah.disabled = !animated

    for (
      let i = 0, delayStep = 0.25, delay = delayStep;
      i < count;
      i++, delay += delayStep
    ) {
      const color = colorScale(i / count).rgba()
      const angle = startAngle + i * angleStep
      const direction = p.createVector(p.cos(angle), p.sin(angle))

      p.stroke(color)
      fill && p.fill(color)

      const outerOffset = animateOffset(
        outer,
        outerDelayDuration,
        delay * 2,
        amplitude,
      )
      const outerPoint = calculateCirclePoint(
        center,
        outerRadius,
        outerOffset,
        direction,
      )
      p.circle(outerPoint.x, outerPoint.y, diameter)

      const innerOffset = animateOffset(
        inner,
        innerDelayDuration,
        delay,
        amplitude,
      )
      const innerDiameter = diameter * (2 / 3)
      const innerPoint = calculateCirclePoint(
        center,
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
      const nextDir = p.createVector(p.cos(nextAngle), p.sin(nextAngle))
      const evenDelay = delayStep * i + delayStep * 2
      const oddDelay = (delayStep * i + delayStep * 2) * 2
      const nextInnerPoint = calculateCirclePoint(
        center,
        innerRadius,
        animateOffset(
          true,
          innerDelayDuration,
          delayStep * i + delayStep * 2,
          amplitude,
        ),
        nextDir,
      )
      const nextOuterPoint = calculateCirclePoint(
        center,
        outerRadius,
        animateOffset(true, outerDelayDuration, oddDelay, amplitude),
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
            duration: innerDelayDuration,
            radius: innerRadius,
            center,
            nextDir,
            amplitude,
          })
        }
        if (shadows.evenA) {
          p.noStroke()
          p.fill(chroma(color).alpha(alpha).rgba())
          drawTriangle(innerPoint, nextInnerPoint, outerPoint)
          p.noFill()
        }
        if (shadows.evenB) {
          p.noStroke()
          p.fill(chroma(color).alpha(alpha).rgba())
          drawTriangle(innerPoint, nextInnerPoint, nextOuterPoint)
          p.noFill()
        }
      } else {
        if (pairConnectors.odd) {
          drawPairConnectingLine({
            animationEnabled: outer,
            currentPoint: outerPoint,
            delay: oddDelay,
            duration: outerDelayDuration,
            radius: outerRadius,
            diameter,
            center,
            nextDir,
            amplitude,
          })
        }
        if (shadows.oddA) {
          p.noStroke()
          p.fill(chroma(color).alpha(alpha).rgba())
          drawTriangle(innerPoint, outerPoint, nextOuterPoint)
          p.noFill()
        }
        if (shadows.oddB) {
          p.noStroke()
          p.fill(chroma(color).alpha(alpha).rgba())
          drawTriangle(outerPoint, nextOuterPoint, nextInnerPoint)
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
    lineImpl(
      calculateEdgePoint(point1, diameter1, direction),
      calculateEdgePoint(point2, diameter2, direction, true),
      taperedWeights,
    )
  }

  function calculateEdgePoint(point, diameter, direction, invert = false) {
    const factor = invert ? -1 : 1
    return point.copy().add(direction.copy().mult((diameter / 2) * factor))
  }

  function drawPairConnectingLine({
    animationEnabled,
    center,
    radius,
    diameter,
    currentPoint,
    nextDir,
    delay,
    duration,
    amplitude,
  }) {
    const offset = animateOffset(animationEnabled, duration, delay, amplitude)
    const nextPoint = calculateCirclePoint(center, radius, offset, nextDir)
    const toNextDir = calculateToNextDir(currentPoint, nextPoint)
    const halfDiameter = diameter / 2
    lineImpl(
      currentPoint.copy().add(toNextDir.copy().mult(halfDiameter)),
      nextPoint.copy().sub(toNextDir.copy().mult(halfDiameter)),
      taperedWeights,
    )
  }

  function calculateCirclePoint(center, radius, offset, direction) {
    return center.copy().add(direction.copy().mult(radius + offset))
  }

  function calculateToNextDir(p1, p2) {
    return p2.copy().sub(p1).normalize()
  }

  function animateOffset(enabled, duration, delay, amplitude) {
    return enabled
      ? ah.animate({
          keyframes: [0, amplitude, 0],
          duration,
          every: duration > 3 ? duration : 3,
          delay,
          easing: 'easeIn',
        })
      : 0
  }

  function lineImpl(p1, p2, ...rest) {
    if (controlPanel.get('taperedLines')) {
      lines.tapered(p1, p2, ...rest)
    } else {
      p.line(p1.x, p1.y, p2.x, p2.y)
    }
  }

  function drawTriangle(p1, p2, p3) {
    p.triangle(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y)
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
      outerDelayDuration: new Range({
        name: 'outerDelayDuration',
        value: 6,
        min: 2,
        max: 12,
      }),
      innerDelayDuration: new Range({
        name: 'innerDelayDuration',
        value: 3,
        min: 1,
        max: 12,
      }),
      multiplier: new Range({
        name: 'multiplier',
        value: 2,
        min: 2,
        max: 24,
        step: 2,
      }),
      amplitude: new Range({
        name: 'amplitude',
        value: 64,
        min: 1,
        max: 100,
      }),
      diameter: new Range({
        name: 'diameter',
        value: 6,
        min: 2,
        max: 20,
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
      fill: new Checkbox({
        name: 'fill',
        value: false,
      }),
      rotate: new Checkbox({
        name: 'rotate',
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
      taperedLines: new Checkbox({
        name: 'taperedLines',
        value: true,
      }),
    },
  })
}
