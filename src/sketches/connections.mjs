import chroma from 'chroma-js'
import ControlPanel, {
  Checkbox,
  Range,
  createChromaPalettes,
} from '../lib/ControlPanel/index.mjs'

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const metadata = {
    name: 'connections',
    frameRate: 30,
  }

  const [w, h] = [500, 500]
  const cx = w / 2
  const cy = h / 2

  const controlPanel = new ControlPanel({
    p,
    id: metadata.name,
    controls: {
      count: new Range({
        name: 'count',
        value: 10,
        min: 1,
        max: 40,
      }),
      edge: new Range({
        name: 'edge',
        value: 20,
        min: 0,
        max: cx,
      }),
      diameter: new Range({
        name: 'diameter',
        value: 3,
        min: 1,
        max: 50,
      }),
      drawPoint: new Checkbox({
        name: 'drawPoint',
        value: false,
      }),
      background: new Range({
        name: 'background',
        value: 0,
        min: 0,
        max: 1,
        step: 0.001,
      }),
      strokeWeight: new Range({
        name: 'strokeWeight',
        value: 1,
        min: 0.1,
        max: 5,
        step: 0.1,
      }),
      palette: createChromaPalettes({
        name: 'palette',
      }),
      cp1x: new Range({
        name: 'cp1x',
        step: 1,
        value: 0,
        min: 0,
        max: w,
      }),
      cp1y: new Range({
        name: 'cp1y',
        step: 1,
        value: 0,
        min: 0,
        max: h,
      }),
      cp2x: new Range({
        name: 'cp2x',
        step: 1,
        value: 0,
        min: 0,
        max: w,
      }),
      cp2y: new Range({
        name: 'cp2y',
        step: 1,
        value: 0,
        min: 0,
        max: h,
      }),
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    p.colorMode(p.RGB, 255, 255, 255, 1)
    p.noLoop()

    return {
      canvas,
    }
  }

  function draw() {
    const {
      count,
      edge,
      background,
      strokeWeight,
      drawPoint,
      diameter,
      palette,
      cp1x,
      cp1y,
      cp2x,
      cp2y,
    } = controlPanel.values()

    const colorScale = chroma.scale(palette)
    const backgroundColor = colorScale(0).luminance(0.99)
    const inverted = chroma(backgroundColor.rgb().map((x) => 255 - x))
    p.background(chroma.mix(backgroundColor, inverted, background).rgba())
    p.strokeWeight(strokeWeight)
    p.strokeCap(p.ROUND)

    const adjustedCount = count % 2 === 0 ? count + 1 : count
    const halfCount = Math.floor(adjustedCount / 2)
    const spacing = (h - diameter) / adjustedCount

    const leftPoints = []
    const rightPoints = []

    for (let i = -halfCount; i <= halfCount; i++) {
      const y = i * spacing
      leftPoints.push([edge, cy + y])
      rightPoints.push([w - edge, cy + y])
    }

    leftPoints.forEach(([x1, y1], i) => {
      const color = colorScale(p.map(i, 0, count, 0, 1))
      p.noFill()
      p.stroke(color.alpha(0.8).rgba())
      rightPoints.forEach(([x2, y2]) => {
        p.curve(
          // control point 1
          cp1x,
          cp1y,

          // the actual points
          x1,
          y1,
          x2,
          y2,

          // control point 2
          cp2x,
          cp2y,
        )
      })
    })

    if (drawPoint) {
      leftPoints.forEach(([x1, y1], i) => {
        const color = colorScale(p.map(i, 0, count, 0, 1))
        p.fill(color.rgba())
        p.noStroke()
        p.circle(x1, y1, diameter)
        p.circle(...rightPoints[i], diameter)
      })
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
