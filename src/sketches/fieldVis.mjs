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
  const ah = new AnimationHelper({ p, frameRate: metadata.frameRate, bpm: 130 })
  const colorScale = chroma
    .scale(['blue', 'lightblue', 'cyan', 'magenta', 'yellow'])
    .domain([0, 0.3, 0.5, 0.6, 0.7])

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
        name: 'sizeParam',
        value: 4,
        min: 1,
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
      sizeParam,
      noiseScale,
      backgroundAlpha,
      shapeAlpha,
      showSwatches,
    } = controlPanel.values()

    p.background(
      chroma.mix('black', 'navy', 0.1).alpha(backgroundAlpha).rgba(),
      backgroundAlpha,
    )
    p.noStroke()

    const t = ah.accumulateValue(0.05, 0.25)
    const res = mode === 'line' ? resolution : resolution / 2
    const cellSize = w / res
    const angleRange = ah.anim8([0.5, 2, 4, 1, 2, 0.5], 12)

    for (let x = cellSize / 2; x < w; x += cellSize) {
      for (let y = cellSize / 2; y < h; y += cellSize) {
        const noiseVal = p.noise(x * noiseScale, y * noiseScale, t)
        const angle = noiseVal * p.TWO_PI * angleRange
        const offset = (p.sin(t * p.TWO_PI) + 1) * 0.5 * sizeParam
        const xPos = x + p.cos(angle) * offset
        const yPos = y + p.sin(angle) * offset
        const diameter = p.cos(angle) * sizeParam
        const color = colorScale(noiseVal)

        p.fill(color.alpha(shapeAlpha / 4).rgba())
        p.circle(xPos, yPos, diameter * PHI)

        p.fill(color.alpha(shapeAlpha).rgba())
        p.circle(xPos, yPos, diameter)
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
