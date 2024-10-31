// @ts-check
import chroma from 'chroma-js'
import ControlPanel, { Checkbox, Range } from '../lib/ControlPanel/index.mjs'
import AnimationHelper from '../lib/AnimationHelper.mjs'
import { d3ColorScales } from '../lib/colors.mjs'

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
      amplitude,
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
    const angleIncrement = p.TWO_PI / count
    const startAngle = rotate ? ah.anim8([0, p.TWO_PI], 36) : p.PI / 2

    for (let i = 0, delay = 0.25; i < count; i++, delay += 0.25) {
      const angle = startAngle + i * angleIncrement
      const direction = { x: p.cos(angle), y: p.sin(angle) }
      const d = direction

      const scale = pingPongColors ? pingPongColorScale : colorScale
      const color = scale(i / count).rgba()

      p.stroke(color)
      if (fill) {
        p.fill(color)
      }

      const offsetAnimation = outer
        ? ah.animate({
            keyframes: [0, amplitude, 0],
            duration: base,
            every: base,
            delay: delay * 3,
          })
        : 0

      const x = cx + outerRadius * d.x + offsetAnimation * d.x
      const y = cy + outerRadius * d.y + offsetAnimation * d.y
      p.circle(x, y, diameter)

      const innerDiameter = diameter * (2 / 3)
      const innerOffsetAnimation = inner
        ? ah.animate({
            keyframes: [0, amplitude, 0],
            duration: 1,
            every: base,
            delay,
          })
        : 0

      const ix = cx + innerRadius * d.x + innerOffsetAnimation * d.x
      const iy = cy + innerRadius * d.y + innerOffsetAnimation * d.y
      p.circle(ix, iy, innerDiameter)

      p.line(
        ix + (innerDiameter / 2) * d.x,
        iy + (innerDiameter / 2) * d.y,
        x - (diameter / 2) * d.x,
        y - (diameter / 2) * d.y,
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
