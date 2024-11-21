import chroma from 'chroma-js'
import { renderSwatches } from '../lib/colors.mjs'
import { createControlPanel } from '../lib/ControlPanel/index.mjs'
import AnimationHelper from '../lib/AnimationHelper.mjs'
import { getAverageFrameRate, PHI } from '../util.mjs'

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const metadata = {
    name: 'fieldVis',
    frameRate: 30,
    pixelDensity: 6,
  }

  const [w, h] = [500, 500]
  const center = p.createVector(w / 2, h / 2)
  const ah = new AnimationHelper({ p, frameRate: metadata.frameRate, bpm: 130 })
  const colorScale = chroma.scale([
    'black',
    'black',
    'blue',
    'lightblue',
    'turquoise',
    'magenta',
    'yellow',
    'black',
    'black',
  ])
  // .domain([0, 0.47, 0.55, 0.58, 0.7])

  const controlPanel = createControlPanel({
    p,
    id: metadata.name,
    controls: [
      {
        type: 'Range',
        name: 'resolution',
        value: 20,
        min: 10,
        max: 100,
      },
      {
        type: 'Range',
        name: 'size',
        value: 10,
        min: 5,
        max: 30,
      },
      {
        type: 'Range',
        name: 'noiseScale',
        value: 0.1,
        min: 0.001,
        max: 0.2,
        step: 0.001,
      },
      {
        type: 'Range',
        name: 'lerpToCenter',
        value: 0,
        min: 0.001,
        max: 1,
        step: 0.001,
      },
      {
        type: 'Range',
        name: 'offsetRange',
        value: 1,
        min: 1,
        max: 32,
        step: 1,
      },
      {
        type: 'Range',
        name: 'backgroundAlpha',
        value: 1,
        min: 0.01,
        max: 1,
        step: 0.01,
      },
      {
        type: 'Range',
        name: 'shapeAlpha',
        value: 1,
        min: 0.01,
        max: 1,
        step: 0.01,
      },
      {
        type: 'Checkbox',
        name: 'offsetX',
        value: true,
      },
      {
        type: 'Checkbox',
        name: 'showSwatches',
        value: false,
      },
    ],
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
      mode,
      resolution,
      size,
      noiseScale,
      lerpToCenter,
      offsetRange,
      backgroundAlpha,
      shapeAlpha,
      offsetX,
      showSwatches,
    } = controlPanel.values()

    p.background(0, backgroundAlpha)
    p.noStroke()

    const t = ah.accumulateValue(0.05, 0.25)
    const res = mode === 'line' ? resolution : resolution / 2
    const cellSize = w / res
    const angleRange = ah.anim8([0.5, 4, 0.5], 24)

    for (let x = cellSize / 2; x < w; x += cellSize) {
      for (let y = cellSize / 2; y < h; y += cellSize) {
        const adjustedX = p.lerp(
          x * noiseScale,
          (x - center.x) * noiseScale,
          lerpToCenter,
        )
        const adjustedY = p.lerp(
          y * noiseScale,
          (y - center.y) * noiseScale,
          lerpToCenter,
        )

        const noiseVal = p.noise(adjustedX, adjustedY, t)
        const angle = noiseVal * p.TWO_PI * angleRange
        const normalizedOffset = (p.sin(t * p.TWO_PI) + 1) * 0.5
        const offset = normalizedOffset * (size * offsetRange)
        const px = offsetX ? x + p.cos(angle) * offset : x
        const py = y + p.sin(angle) * offset
        const diameter = p.map(p.cos(angle), -1, 1, size / 4, size)
        const color = colorScale(noiseVal)

        p.fill(color.alpha(shapeAlpha / 4).rgba())
        p.circle(px, py, diameter * PHI)

        p.fill(color.alpha(shapeAlpha).rgba())
        p.circle(px, py, diameter)
      }
    }

    if (showSwatches) {
      renderSwatches({
        p,
        w,
        scales: [colorScale],
        numSwatches: 10,
      })
    }

    getAverageFrameRate(p, 300)
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
