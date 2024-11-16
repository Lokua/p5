import chroma from 'chroma-js'
import AnimationHelper from '../../lib/AnimationHelper.mjs'
import { renderSwatches } from '../../lib/colors.mjs'
import { callAtInterval, getAverageFrameRate } from '../../util.mjs'

import createControlPanel from './createControlPanel.mjs'
import FlowSystem from './FlowSystem.mjs'

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const metadata = {
    name: 'flowField',
    frameRate: 30,
    pixelDensity: 6,
  }
  const [w, h] = [500, 500]
  let system

  const colorScale = chroma.scale(['navy', 'turquoise', 'purple', 'yellow'])
  const attractorColorScale = chroma.scale(['white', 'azure', 'silver'])
  const ah = new AnimationHelper({ p, frameRate: metadata.frameRate, bpm: 130 })
  const controlPanel = createControlPanel(p, metadata)

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)
    p.colorMode(p.RGB, 255, 255, 255, 1)

    const seed = 39
    p.randomSeed(seed)
    p.noiseSeed(seed)

    system = new FlowSystem({
      p,
      w,
      h,
      initialState: {
        ...controlPanel.values(),
        colorScale,
        attractorColorScale,
      },
    })

    return {
      canvas,
    }
  }

  function draw() {
    const { showSwatches, ...state } = controlPanel.values()

    p.background(0)

    system.updateState({
      ...state,
      particleCount: state.count,
      zOffset: ah.getTotalBeatsElapsed() * state.zOffsetMultiplier,
    })
    system.update()
    system.display()

    if (showSwatches) {
      renderSwatches({
        p,
        w,
        scales: [colorScale, attractorColorScale],
      })
    }

    getAverageFrameRate(p, 900)
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
