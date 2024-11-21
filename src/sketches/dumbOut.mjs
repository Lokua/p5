import chroma from 'chroma-js'
import { createControlPanel } from '../lib/ControlPanel/index.mjs'
import { lokuaScales, renderSwatches } from '../lib/colors.mjs'
import AnimationHelper from '../lib/AnimationHelper.mjs'
import { mapTimes } from '../util.mjs'

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const metadata = {
    name: 'dumbOut',
    frameRate: 30,

    // WARNING! This is probably too big
    // if recording video but perfect for images
    pixelDensity: 6,
  }

  const [w, h] = [500, 500]
  const center = p.createVector(w / 2, h / 2)
  const colorScale = chroma.scale(lokuaScales.yesTheWaterIs)
  const ah = new AnimationHelper({ p, frameRate: metadata.frameRate, bpm: 134 })

  const cp = createControlPanel({
    p,
    id: metadata.name,
    controls: [
      {
        type: 'Range',
        name: 'size',
        value: 100,
        min: 1,
        max: w,
      },
      {
        type: 'Range',
        name: 'depth',
        value: 100,
        min: 1,
        max: 1000,
      },
      {
        type: 'Range',
        name: 'min',
        value: 0.3,
        min: 0.01,
        max: 1,
        step: 0.01,
      },
      {
        type: 'Range',
        name: 'max',
        value: 0.9,
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
    cp.init()
    const canvas = p.createCanvas(w, h)

    p.colorMode(p.RGB, 255, 255, 255, 1)

    return {
      canvas,
    }
  }

  function draw() {
    p.noStroke()
    p.background(colorScale(1).rgba())
    p.rectMode(p.CENTER)
    const size = cp.get('size')

    const drawThatShit = (animationDelay = 0) => {
      drawRecursiveSquare({
        x: 0,
        y: 0,
        size,
        depth: cp.get('depth'),
        sizeMult: ah.anim8(
          [cp.get('min'), cp.get('max'), cp.get('min')],
          1,
          1,
          animationDelay,
        ),
      })
    }

    const offsets = [
      // SIDES
      // ---
      // Center
      { x: 0, y: 0 },
      // Top
      { x: 0, y: -size },
      // Right
      { x: size, y: 0 },
      // Bottom
      { x: 0, y: size },
      // Left
      { x: -size, y: 0 },

      // CORNERS
      // ---
      // Top-Left
      { x: -size, y: -size },
      // Top-Right
      { x: size, y: -size },
      // Bottom-Right
      { x: size, y: size },
      // Bottom-Left
      { x: -size, y: size },
    ]

    offsets.forEach((offset, index) => {
      p.$.pushPop(() => {
        p.translate(center.x + offset.x, center.y + offset.y)
        drawThatShit((index + 1) * 0.25)
      })
    })

    if (cp.get('showSwatches')) {
      renderSwatches({
        scales: [colorScale],
        p,
        w,
      })
    }
  }

  function drawRecursiveSquare({ x, y, size, sizeMult, depth = 3 }) {
    if (depth >= 0) {
      p.noFill()
      p.stroke(colorScale(0.5).rgba())
      p.strokeWeight(2)

      p.rect(x, y, size)

      p.$.pushPop(() => {
        drawRecursiveSquare({
          x,
          y,
          size: size * sizeMult,
          sizeMult,
          depth: depth - 1,
        })
      })
    }
  }

  return {
    setup,
    draw,
    destroy() {
      cp.destroy()
    },
    metadata,
  }
}
