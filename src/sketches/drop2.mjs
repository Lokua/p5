// https://www.youtube.com/watch?v=p7IGZTjC008&t=613s
// https://people.csail.mit.edu/jaffer/Marbling/Dropping-Paint
import chroma from 'chroma-js'
import { createControlPanel } from '../lib/ControlPanel/index.mjs'
import { mapTimes, times } from '../util.mjs'
import AnimationHelper from '../lib/AnimationHelper.mjs'

import { Drop } from './drop.mjs'

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const metadata = {
    name: 'drop2',
    frameRate: 30,

    // WARNING! This is probably too big
    // if recording video but perfect for images
    pixelDensity: 6,
  }

  const [w, h] = [500, 500]
  const center = p.createVector(w / 2, h / 2)
  const drops = []

  const colorScale = chroma.scale(['black', 'mistyrose', 'azure']).mode('lab')
  const ah = new AnimationHelper({ p, frameRate: metadata.frameRate, bpm: 134 })

  const cp = createControlPanel({
    p,
    id: metadata.name,
    controls: [
      {
        type: 'Range',
        name: 'resolution',
        value: 100,
        min: 3,
        max: 1000,
      },
      {
        type: 'Range',
        name: 'radius',
        value: 200,
        min: 3,
        max: 500,
      },
      {
        type: 'Range',
        name: 'tines',
        value: 4,
        min: 1,
        max: 40,
        step: 1,
      },
      {
        type: 'Range',
        name: 'displacement',
      },
      {
        type: 'Range',
        name: 'falloff',
      },
    ],
  })

  function setup() {
    cp.init()
    const canvas = p.createCanvas(w, h)

    p.colorMode(p.RGB, 255, 255, 255, 1)

    for (let i = 0; i < 20; i++) {
      const drop = new Drop(p, center.x, center.y, 20, cp.resolution)
      drop.color = colorScale(p.random()).rgba()
      drops.push(drop)
    }

    return {
      canvas,
    }
  }

  function draw() {
    p.background(chroma.mix('black', colorScale(0)).rgba())
    p.noStroke()

    const tines = ah.animate({
      keyframes: [1, cp.tines, 1],
      duration: 8,
    })

    for (const [index, drop] of drops.entries()) {
      drop.update({
        radius: p.map(
          (drops.length - index) * cp.radius,
          0,
          cp.radius * drops.length,
          0,
          cp.radius,
        ),
        resolution: cp.resolution,
      })
      for (let i = 0; i < tines; i++) {
        const x = i * (w / tines)
        const line = p.createVector(x, center.y)
        drop.tine(
          line,
          p.createVector(0, -ah.getPingPongLoopProgress(12)),
          cp.displacement,
          cp.falloff,
        )
        drop.tine(
          line,
          p.createVector(-1, ah.getPingPongLoopProgress(8)),
          cp.displacement,
          cp.falloff,
        )
      }
    }
    for (const drop of drops) {
      p.noFill()
      p.stroke(drop.color)
      drop.display()
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
