import chroma from 'chroma-js'
import { createControlPanel } from '../lib/ControlPanel/index.mjs'
import { renderSwatches } from '../lib/colors.mjs'
import AnimationHelper from '../lib/AnimationHelper.mjs'
import { mapTimes, isEven } from '../util.mjs'

// https://lokua.bandcamp.com/track/dumb-out

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
  const ah = new AnimationHelper({ p, frameRate: metadata.frameRate, bpm: 134 })
  const whiteScale = chroma.scale(['white', 'gray']).mode('lab')
  const scales = [
    // center: bd
    chroma.scale(['gray', 'black']).mode('lab'),
    // top: stabs
    chroma.scale(['seagreen', 'black', 'paleturquoise']).mode('lab'),
    // right: td
    chroma.scale(['paleturquoise', 'black', 'seagreen']).mode('lab'),
    // bottom: hh
    chroma.scale(['mistyrose', 'black', 'paleturquoise']).mode('lab'),
    // left: oh
    chroma.scale(['paleturquoise', 'black', 'mistyrose']).mode('lab'),
    // top-right
    whiteScale,
    // top-left
    whiteScale,
    // bottom-right
    whiteScale,
    // bottom-left
    whiteScale,
  ].map((scaleName) => chroma.scale(scaleName))

  const cp = createControlPanel({
    p,
    id: metadata.name,
    controls: [
      {
        type: 'Range',
        name: 'size',
        value: 155,
        min: 1,
        max: w,
      },
      {
        type: 'Range',
        name: 'depth',
        value: 10,
        min: 1,
        max: 100,
      },
      {
        type: 'Range',
        name: 'min',
        value: 0.7,
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
      {
        type: 'Checkbox',
        name: 'invertScaleDirection',
        display: 'invert',
        value: false,
      },
      {
        type: 'Checklist',
        name: 'show',
        options: {
          center: true,
          top: true,
          right: true,
          bottom: true,
          left: true,
          corners: true,
        },
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
    const { size, depth, min, max, show } = cp.values()
    p.noStroke()
    p.background(250)
    p.rectMode(p.CENTER)

    const margin = 2

    const offsets = [
      {
        id: 'center',
        role: 'bassDrum',
        x: 0,
        y: 0,
        animationParams: {
          delay: 0,
        },
        hasRotation: false,
        show: show.center,
        min: 0,
        max: 1,
      },
      {
        id: 'top',
        role: 'dumbOutChords',
        x: 0,
        y: -size - margin,
        animationParams: {
          keyframes: [min, max, min, min, min, max, min],
          duration: 2,
          every: 2,
          delay: 0,
        },
        hasRotation: false,
        show: show.top,
      },
      {
        id: 'right',
        role: '1aHiTom',
        x: size + margin,
        y: 0,
        animationParams: {
          keyframes: [min, min, max, min, min, min, min],
          duration: 2,
          every: 2,
          delay: 0,
        },
        hasRotation: false,
        show: show.right,
      },
      {
        id: 'bottom',
        role: 'hh',
        x: 0,
        y: size + margin,
        animationParams: {
          duration: 0.5,
          every: 0.5,
          delay: 0,
        },
        hasRotation: false,
        show: show.bottom,
        min: 0.87,
        max: 0.9,
      },
      {
        id: 'left',
        role: 'oh',
        x: -size - margin,
        y: 0,
        animationParams: {
          delay: 0.5,
        },
        hasRotation: false,
        show: show.left,
        min: 0.87,
        max: 0.9,
        easing: 'cubicEaseOut',
      },
      {
        id: 'topLeft',
        x: -size - margin,
        y: -size - margin,
        disabled: true,
        hasRotation: true,
        show: show.corners,
      },
      {
        id: 'topRight',
        x: size + margin,
        y: -size - margin,
        disabled: true,
        hasRotation: true,
        show: show.corners,
      },
      {
        id: 'bottomRight',
        x: size + margin,
        y: size + margin,
        disabled: true,
        hasRotation: true,
        show: show.corners,
      },
      {
        id: 'bottomLeft',
        x: -size - margin,
        y: size + margin,
        disabled: true,
        hasRotation: true,
        show: show.corners,
      },
    ]

    offsets.forEach((offset, index) => {
      if (offset.show) {
        p.$.pushPop(() => {
          p.translate(center.x + offset.x, center.y + offset.y)
          drawRecursiveSquare({
            x: 0,
            y: 0,
            size,
            depth,
            sizeMult: ah.animate({
              keyframes: [
                offset.min || min,
                offset.max || max,
                offset.min || min,
              ],
              duration: offset.disabled ? 2 : 1,
              every: offset.disabled ? 2 : 1,
              delay: 0,
              ...offset?.animationParams,
            }),
            colorScale: scales[index],
            index,
            // hasRotation: offset.hasRotation,
            hasRotation: false,
          })
        })
      }
    })

    if (cp.get('showSwatches')) {
      renderSwatches({
        scales,
        p,
        w,
      })
    }
  }

  function drawRecursiveSquare({
    x,
    y,
    size,
    sizeMult,
    colorScale,
    index,
    rotation = 0,
    hasRotation,
    depth = 3,
  }) {
    if (depth >= 0) {
      const color = colorScale(
        cp.get('invertScaleDirection')
          ? 1 - depth / cp.get('depth')
          : depth / cp.get('depth'),
      )
      p.stroke(color.rgba())
      p.fill(color.alpha(0.3).rgba())
      p.strokeWeight(2)

      p.$.pushPop(() => {
        p.translate(x, y)
        p.rotate(hasRotation ? (isEven(index) ? 1 : -1) * rotation : 0)

        if (depth !== cp.get('depth')) {
          p.rect(x, y, size)
        }

        drawRecursiveSquare({
          x,
          y,
          size: size * sizeMult,
          sizeMult,
          depth: depth - 1,
          colorScale,
          index,
          hasRotation,
          rotation:
            rotation +
            p.PI /
              ah.anim8([9 ** 2, 9 ** 3, -(9 ** 2), -(9 ** 3), 9 ** 2], 8, 8),
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
