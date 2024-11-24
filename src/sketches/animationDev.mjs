import chroma from 'chroma-js'
import AnimationHelper from '../lib/AnimationHelper.mjs'
import { createControlPanel } from '../lib/ControlPanel/index.mjs'
import { interpolators } from '../lib/scaling.mjs'
import { times, arrayModLookup } from '../util.mjs'

/**
 * @param {import("p5")} p
 */
export default function (p) {
  const metadata = {
    name: 'animationDev',
    frameRate: 24,

    // WARNING! This is probably too big
    // if recording video but perfect for images
    pixelDensity: 6,
  }

  const [w, h] = [500, 500]
  const center = p.createVector(w / 2, h / 2)

  const ah = new AnimationHelper({
    p,
    frameRate: metadata.frameRate,
    bpm: 134,
  })

  const colorScale = chroma.scale(['magenta', 'cyan']).mode('lab')

  const cp = new createControlPanel({
    p,
    id: metadata.name,
    controls: [
      {
        type: 'Range',
        name: 'count',
        value: 10,
        min: 3,
      },
      {
        type: 'Range',
        name: 'backgroundAlpha',
        value: 1,
        max: 1,
        step: 0.138,
      },
      {
        type: 'Range',
        name: 'radiusStart',
        value: 50,
      },
      {
        type: 'Range',
        name: 'radiusIncrement',
        value: 10,
      },
      {
        type: 'Range',
        name: 'totalCircles',
        value: 20,
        min: 1,
      },
      {
        type: 'Range',
        name: 'beats',
        value: 16,
        min: 1,
        max: 128,
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
    p.background(20, cp.backgroundAlpha)
    p.noStroke()
    p.fill(0)

    const interpolatorFns = [
      interpolators.linear,
      interpolators.easeInOut,
      interpolators.cubicEaseInOut,
    ]
    const interpolatorCycle = [
      ...interpolatorFns,
      ...interpolatorFns.slice(1, -1).reverse(),
    ]
    times(cp.totalCircles, (i) => {
      const radius = cp.radiusStart + i * cp.radiusIncrement
      const interpolator = arrayModLookup(interpolatorCycle, i)
      drawCircles(radius, interpolator)
    })
  }

  function drawCircles(radius, easing) {
    p.$.pushPop(() => {
      p.$.vTranslate(center)
      const rotation = ah.animate({
        keyframes: [0, 1],
        duration: cp.beats,
        easing,
      })
      p.rotate(p.map(rotation, 0, 1, 0, p.TWO_PI))
      p.fill(colorScale(p.map(radius, 0, center.x, 0, 1)).rgba())
      times(cp.count, (i) => {
        const angle = i * (p.TWO_PI / cp.count)
        const x = radius * p.cos(angle)
        const y = radius * p.sin(angle)
        p.circle(x, y, 5)
      })
    })
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
