import chroma from 'chroma-js'
import { renderSwatches } from '../lib/colors.mjs'
import { createControlPanel } from '../lib/ControlPanel/index.mjs'
import AnimationHelper from '../lib/AnimationHelper.mjs'
import { interpolators } from '../lib/scaling.mjs'
import { getAverageFrameRate, PHI } from '../util.mjs'

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const metadata = {
    name: 'fieldVis',
    frameRate: 30,
    // pixelDensity: 6,
  }

  const [w, h] = [500, 500]
  const center = p.createVector(w / 2, h / 2)
  const maxOffsetRange = 8
  const ah = new AnimationHelper({ p, frameRate: metadata.frameRate, bpm: 130 })
  const colorScale = chroma
    .scale([
      'black',
      'navy',
      'blue',
      'lightblue',
      'turquoise',
      'magenta',
      'yellow',
      'navy',
      'black',
    ])
    .mode('lab')

  const controlPanel = createControlPanel({
    p,
    id: metadata.name,
    controls: [
      {
        type: 'Range',
        name: 'resolution',
        value: 100,
        min: 10,
        max: 200,
      },
      {
        type: 'Range',
        name: 'size',
        value: 6,
        min: 1,
        max: 15,
      },
      {
        type: 'Range',
        name: 'noiseScale',
        value: 0.016,
        min: 0.001,
        max: 0.05,
        step: 0.0001,
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
        value: 3,
        min: 1,
        max: maxOffsetRange,
        step: 1,
      },
      {
        type: 'Range',
        name: 'backgroundAlpha',
        value: 0.79,
        min: 0.01,
        max: 1,
        step: 0.01,
      },
      {
        type: 'Range',
        name: 'shapeAlpha',
        value: 0.79,
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

      // Represents maximum
      noiseScale: ns,

      lerpToCenter,

      // Represents minimum
      offsetRange: ofs,

      backgroundAlpha,
      shapeAlpha,
      offsetX,
      showSwatches,
    } = controlPanel.values()

    p.background(0, backgroundAlpha)
    p.noStroke()

    const t1 = ah.getPingPongLoopProgress(8)
    const t2 = ah.getPingPongLoopProgress(24)
    const t = p.lerp(t1, t2, ah.getPingPongLoopProgress(48))

    // nsBaseLine = 0.016
    const noiseScale = ah.animate({
      keyframes: [
        { value: ns, duration: 12 },
        { value: ns, duration: 12 },
        { value: ns / 8, duration: 12 },
        { value: ns / 2, duration: 12 },
        { value: ns, duration: 12 },
      ],
      every: 60,
    })

    const offsetRange = ah.animate({
      keyframes: [
        { value: ofs, duration: 12 },
        { value: maxOffsetRange, duration: 12, easing: interpolators.bounce },
        { value: ofs, duration: 12 },
      ],
      every: 36,
    })

    const res = mode === 'line' ? resolution : resolution / 2
    const angleRange = ah.anim8([0.5, 4, 0.5], 16)

    const cellSize = w / res
    const maxOffset = size * PHI * maxOffsetRange

    // Draw more than we need so animations don't reveal empty
    // canvas beyond the edges that are being brought inward
    const startX = -maxOffset + cellSize / 2
    const endX = w + maxOffset
    const startY = -maxOffset + cellSize / 2
    const endY = h + maxOffset

    for (let x = startX; x < endX; x += cellSize) {
      for (let y = startY; y < endY; y += cellSize) {
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
        // No offsetX makes drawing symmetric when lerpToCenter is maxed
        const px = offsetX ? x + p.cos(angle) * offset : x
        const py = y + p.sin(angle) * offset
        const diameter = p.map(p.cos(angle), -1, 1, 0, size)

        // Cull offscreen points for performance
        if (px + size > 0 && px - size < w && py + size > 0 && py - size < h) {
          const color = colorScale(noiseVal)

          p.fill(color.alpha(shapeAlpha / 2).rgba())
          p.circle(px, py, diameter * PHI)

          p.fill(color.alpha(shapeAlpha).rgba())
          p.circle(px, py, diameter)
        }
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

    // getAverageFrameRate(p, 300)
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
