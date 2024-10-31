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
    name: 'ztudy__circleOfCircles',
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
      count: new Range({
        name: 'count',
        value: 12,
        min: 1,
        max: 256,
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
      animate: new Checkbox({
        name: 'animate',
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
      count,
      outerRadius,
      innerRadius,
      diameter,
      fill,
      animate,
      pingPongColors,
      darkBg,
    } = controlPanel.values()

    p.background(darkBg ? 0 : 255)
    p.noFill()

    const cx = w / 2
    const cy = h / 2

    // Angle between each circle around the larger circle in radians
    // 360 degrees in radians is 2 * PI, so dividing by count gives us
    // the angle increment for each circle
    const angleIncrement = p.TWO_PI / count

    // add an offset based on the number of circles
    // otherwise count always starts from 3'Oclock
    // as (((angle = 0) * angleIncrement) = 0)
    // const startAngle = 0
    // const startAngle = p.PI / count
    const startAngle = animate ? ah.anim8([0, p.TWO_PI], 24) : -p.PI / 2

    for (let i = 0; i < count; i++) {
      const angle = startAngle + i * angleIncrement
      const cosAngle = p.cos(angle)
      const sinAngle = p.sin(angle)

      // x-coordinate of the circle based on the polar-to-Cartesian transformation
      // cos(angle) gives the horizontal distance from the center at a given angle,
      // multiplied by radius to scale it to the desired distance from the center point
      const x = cx + outerRadius * cosAngle

      // y-coordinate of the circle based on the polar-to-Cartesian transformation
      // sin(angle) gives the vertical distance from the center at a given angle,
      // multiplied by radius to match the horizontal scale
      const y = cy + outerRadius * sinAngle

      const scale = pingPongColors ? pingPongColorScale : colorScale
      const color = scale(i / count).rgba()

      if (fill) {
        p.fill(color)
      }

      p.stroke(color)

      // outer circle
      p.circle(x, y, diameter)

      // inner circle
      const innerDiameter = diameter * (2 / 3)
      p.circle(
        cx + innerRadius * cosAngle,
        cy + innerRadius * sinAngle,
        innerDiameter,
      )

      // make sure the lines meet at the edges, not the center
      p.line(
        cx + (innerRadius + innerDiameter / 2) * cosAngle,
        cy + (innerRadius + innerDiameter / 2) * sinAngle,
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
