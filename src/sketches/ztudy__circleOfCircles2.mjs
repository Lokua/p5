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
    name: 'ztudy__circleOfCircles2',
    frameRate: 30,
  }

  const ah = new AnimationHelper({ p, frameRate: metadata.frameRate, bpm: 130 })

  const baseScale = d3ColorScales.viridis
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
        min: 10,
        max: 500,
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
      amplitude,
      outerRadius,
      innerRadius,
      diameter,
      fill,
      rotate,
      pingPongColors,
      darkBg,
    } = controlPanel.values()

    const count = base * 4 * multiplier

    p.background(darkBg ? 0 : 255)
    p.noFill()

    const cx = w / 2
    const cy = h / 2
    const angleIncrement = p.TWO_PI / count
    const startAngle = rotate ? ah.anim8([0, p.TWO_PI], 24) : p.PI / 2

    for (let i = 0, delay = 0.25; i < count; i++, delay += 0.25) {
      const angle = startAngle + i * angleIncrement
      const cosAngle = p.cos(angle)
      const sinAngle = p.sin(angle)
      const x = cx + outerRadius * cosAngle
      const y = cy + outerRadius * sinAngle
      const scale = pingPongColors ? pingPongColorScale : colorScale
      const color = scale(i / count).rgba()

      p.stroke(color)
      if (fill) {
        p.fill(color)
      }

      p.circle(x, y, diameter)

      const innerDiameter = diameter * (2 / 3)

      const offset = 20
      const offsetAnimation = ah.animate({
        keyframes: [-offset, offset + amplitude, -offset],
        duration: 1,
        every: base,
        delay,
      })
      const ox = offsetAnimation * cosAngle
      const oy = offsetAnimation * sinAngle
      p.circle(
        cx + ox + innerRadius * cosAngle,
        cy + oy + innerRadius * sinAngle,
        innerDiameter,
      )

      p.line(
        cx + ox + (innerRadius + innerDiameter / 2) * cosAngle,
        cy + oy + (innerRadius + innerDiameter / 2) * sinAngle,
        x - (diameter / 2) * cosAngle,
        y - (diameter / 2) * sinAngle,
      )
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
