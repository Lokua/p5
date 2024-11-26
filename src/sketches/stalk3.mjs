import chroma from 'chroma-js'
import AnimationHelper from '../lib/AnimationHelper.mjs'
import { createControlPanel } from '../lib/ControlPanel/index.mjs'
import { isEven, mapTimes } from '../util.mjs'

import { Stalk, Bud, Tetrahedron } from './stalk/index.mjs'

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const metadata = {
    name: 'stalk3',
    frameRate: 30,
    pixelDensity: 6,
  }

  const [w, h] = [500, 500]
  let camera
  let stalks = []
  const colorScale = chroma.scale(['palevioletred', 'orange', 'olive'])

  const ah = new AnimationHelper({
    p,
    frameRate: metadata.frameRate,
    bpm: 134,
  })

  const cp = createControlPanel({
    p,
    id: metadata.name,
    controls: [
      {
        type: 'Range',
        name: 'phaseIncrement',
        display: 'phaseInc',
        value: 0.2,
        min: 0.001,
        max: 1,
        step: 0.001,
      },
      {
        type: 'Range',
        name: 'amplitudeY',
        value: 20,
      },
      {
        type: 'Range',
        name: 'amplitudeZ',
        value: 100,
        max: w * 2,
      },
      {
        type: 'Range',
        name: 'frequency',
        value: 1,
        min: 0.01,
        max: 2,
        step: 0.01,
      },
      {
        type: 'Range',
        name: 'scale',
        value: 20,
      },
      {
        type: 'Range',
        name: 'sphereRadius',
        value: 20,
        min: 10,
        max: 50,
      },
      {
        type: 'Range',
        name: 'tetraHeight',
        value: 20,
        min: 10,
        max: 500,
      },
    ],
  })

  function setup() {
    cp.init()
    const canvas = p.createCanvas(w, h, p.WEBGL)
    p.colorMode(p.RGB, 255, 255, 255, 1)

    camera = p.createCamera()
    camera.setPosition(50, -50, 500)
    camera.lookAt(0, 0, 0)
    p.perspective(p.PI / 3, w / h, 0.1, 2000)

    stalks = [
      new Stalk({
        p,
        color: 'black',
        setPhase: ah.triggerEvery((phase) => phase + cp.phaseIncrement, 1 / 16),
        buds: [
          new Bud({
            p,
            color: 'black',
            // setPhase: () => ah.getLoopProgress(8),
            setPhase: () => 1 / 4,
            sphereRadius: cp.sphereRadius,
            petals: mapTimes(
              10,
              (i) =>
                new Tetrahedron({
                  p,
                  sizes: [cp.tetraHeight, 5, 5, 5],
                  colors: chroma.scale(['white', 'black']).colors(4),
                  orientation: isEven(i) ? 'base' : 'tip',
                }),
            ),
          }),
          new Bud({
            p,
            color: 'gray',
            setPhase: () => 0.5,
            sphereRadius: cp.sphereRadius,
            petals: mapTimes(
              10,
              (i) =>
                new Tetrahedron({
                  p,
                  sizes: [cp.tetraHeight, 5, 5, 5],
                  colors: chroma.scale(['white', 'black']).colors(4),
                  orientation: isEven(i) ? 'tip' : 'base',
                }),
            ),
          }),
          new Bud({
            p,
            color: 'white',
            setPhase: () => 3 / 4,
            sphereRadius: cp.sphereRadius,
            petals: mapTimes(
              10,
              (i) =>
                new Tetrahedron({
                  p,
                  sizes: [cp.tetraHeight, 5, 5, 5],
                  colors: chroma.scale(['white', 'black']).colors(4),
                  orientation: isEven(i) ? 'base' : 'tip',
                }),
            ),
          }),
        ],
      }),
    ]

    return { canvas }
  }

  function draw() {
    p.background(colorScale(1).desaturate(3).brighten(2.6).rgba())

    for (const stalk of stalks) {
      stalk.update({
        amplitudeY: cp.amplitudeY,
        amplitudeZ: cp.amplitudeZ,
        frequency: cp.frequency,
        scale: cp.scale,
      })

      for (const bud of stalk.buds) {
        bud.update({
          sphereRadius: cp.sphereRadius,
        })

        bud.petals.forEach((tetra) => {
          tetra.update({
            sizes: [cp.tetraHeight, ...tetra.sizes.slice(1)],
          })
        })
      }

      stalk.draw()
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
