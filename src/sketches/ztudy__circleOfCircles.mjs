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
      radius: new Range({
        name: 'radius',
        value: 80,
        min: 10,
        max: 500,
      }),
      diameter: new Range({
        name: 'diameter',
        value: 20,
        min: 10,
        max: 500,
      }),
      animate: new Checkbox({
        name: 'animate',
        value: false,
      }),
      pingPongColors: new Checkbox({
        name: 'pingPongColors',
        value: false,
      }),
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    p.colorMode(p.RGB, 255, 255, 255, 1)
    p.noStroke()

    return {
      canvas,
    }
  }

  function draw() {
    const { count, radius, diameter, animate, pingPongColors } =
      controlPanel.values()

    p.background(255)

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
    const startAngle = animate ? ah.anim8([0, p.TWO_PI], 12) : -p.PI / 2

    for (let i = 0; i < count; i++) {
      const angle = startAngle + i * angleIncrement

      // x-coordinate of the circle based on the polar-to-Cartesian transformation
      // cos(angle) gives the horizontal distance from the center at a given angle,
      // multiplied by radius to scale it to the desired distance from the center point
      const x = cx + radius * p.cos(angle)

      // y-coordinate of the circle based on the polar-to-Cartesian transformation
      // sin(angle) gives the vertical distance from the center at a given angle,
      // multiplied by radius to match the horizontal scale
      const y = cy + radius * p.sin(angle)

      const scale = pingPongColors ? pingPongColorScale : colorScale
      const color = scale(i / count).rgba()

      p.noFill()
      p.stroke(color)

      p.circle(x, y, diameter)
      p.line(
        cx,
        cy,
        // make sure the line ends at the circles edge
        // (just x and y ends the line in circle's center)
        x - (diameter / 2) * p.cos(angle),
        y - (diameter / 2) * p.sin(angle),
      )

      // just covering up the middle where the lines meet
      // because it looks bad
      p.fill(255)
      p.noStroke()
      p.circle(cx, cy, diameter * 8)
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
