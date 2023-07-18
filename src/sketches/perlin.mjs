/* eslint-disable no-unused-vars */
// https://www.youtube.com/watch?v=0YvPgYDR1oM&list=PLeCiJGCSl7jc5UWvIeyQAvmCNc47IuwkM&index=6

import ControlPanel, {
  Range,
  Toggle,
  createBlendMode,
} from '../ControlPanel/index.mjs'
import { arrayModLookup, mapTimes } from '../util.mjs'

export default function (p) {
  const [w, h] = [500, 500]
  let phase = 0
  let phaseMod = 0

  const metadata = {
    name: 'perlin',
  }

  const controlPanel = new ControlPanel({
    id: metadata.name,
    attemptReload: true,
    controls: {
      blendMode: createBlendMode(),
      size: new Range({
        name: 'size',
        value: 1,
        min: 1,
        max: 100,
      }),
      space: new Range({
        name: 'space',
        value: 1,
        min: 1,
        max: 100,
      }),
      thinness: new Range({
        name: 'thinness',
        value: 1,
        min: 1,
        max: 100,
      }),
      flip: new Toggle({
        name: 'flip',
        value: true,
      }),
    },
    inputHandler() {
      !p.isLooping() && draw()
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    p.colorMode(p.HSB, 1)
    p.angleMode(p.DEGREES)
    p.noStroke()

    return {
      canvas,
    }
  }

  function draw() {
    const {
      blendMode,
      size,
      space,
      thinness,
      flip,
    } = controlPanel.values()
    p.blendMode(p[blendMode])
    p.background(0)
    p.fill(0.5, 0.7, 0.7)

    for (let j = 0; j < 10; j++) {
      p.push()
      p.translate(w / 2, h / 2)
      for (let i = 0; i < 360; i += space) {
        const xOff = p.map(p.cos(i + phase), -1, 1, 0, 3)
        const yOff = p.map(p.sin(i + phase), -1, 1, 0, 3)
        const n = p.noise(xOff, yOff, j)
        const hh = p.map(n, 0, 1, flip ? -size : 0, size)
        p.rotate(space)
        p.rect((phase + j * 100) % 1000, 0, hh, thinness)
      }
      p.pop()
      phase += 0.1
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
