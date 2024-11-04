// https://natureofcode.com/random/
import chroma from 'chroma-js'
import ControlPanel, { Checkbox, Range } from '../lib/ControlPanel/index.mjs'
import AnimationHelper from '../lib/AnimationHelper.mjs'
import { d3ColorScales, renderSwatches } from '../lib/colors.mjs'
import { randomInt } from '../util.mjs'

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const metadata = {
    name: 'z__nocWalker2',
    frameRate: 30,
  }

  const [w, h] = [500, 500]

  const ah = new AnimationHelper({
    p,
    frameRate: metadata.frameRate,
    bpm: 130,
  })

  const walkerColorScale = chroma.scale(d3ColorScales.cool)
  const eraserColorScale = chroma.scale([
    'azure',
    'white',
    walkerColorScale(0.2),
  ])

  let walker
  let eraser
  let buffer

  const config = {
    walker: [
      [2, 20],
      [3, 15],
      [4, 10],
      [8, 5],
    ],
    eraser: [
      [5, 20],
      [7, 10],
      [9, 5],
    ],
  }

  const controlPanel = new ControlPanel({
    p,
    id: metadata.name,
    controls: {
      velocityMultiplier: new Range({
        name: 'velocityMultiplier',
        value: 1,
        min: 1,
        max: 100,
      }),
      showSwatches: new Checkbox({
        name: 'showSwatches',
        value: false,
      }),
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    buffer = p.createGraphics(w, h)
    walker = new Walker(buffer, w, h)
    eraser = new Walker(buffer, w, h)

    p.colorMode(p.RGB, 255, 255, 255, 1)

    return {
      canvas,
    }
  }

  function draw() {
    const { showSwatches } = controlPanel.values()
    p.background(walkerColorScale(0.03).rgba())

    walk(walker, ah.repeat(config.walker, 1), (velocity, index) =>
      p.color(walkerColorScale(p.map(index, 0, velocity, 0, 1)).rgba()),
    )
    walk(eraser, ah.repeat(config.eraser, 1), (velocity, index) =>
      p.color(
        eraserColorScale(p.map(index, 0, velocity, 0, 1))
          .alpha(0.1)
          .rgba(),
      ),
    )

    p.image(buffer, 0, 0)

    if (showSwatches) {
      renderSwatches(p, w, [walkerColorScale, eraserColorScale])
    }
  }

  function walk(walker, [stepSize, velocity, rectSize = 3], getColor) {
    const { velocityMultiplier } = controlPanel.values()
    const vel = velocity * velocityMultiplier

    walker.stepSize = stepSize
    walker.rectSize = rectSize

    for (let i = 0; i < vel; i++) {
      walker.step()
      buffer.noFill()
      buffer.stroke(getColor(vel, i))
      walker.show()
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

class Walker {
  constructor(p, w, h, allowDiagonal = false, stepSize = 1, rectSize = 4) {
    this.p = p
    this.w = w
    this.h = h
    this.x = Math.floor(w / 2 / stepSize) * stepSize
    this.y = Math.floor(h / 2 / stepSize) * stepSize
    this.tx = 0
    this.ty = 2627
    this.allowDiagonal = allowDiagonal
    this.stepSize = stepSize
    this.rectSize = rectSize
  }

  show() {
    this.p.rect(this.x, this.y, this.rectSize, this.rectSize)
  }

  step() {
    this.x = this.p.map(this.p.noise(this.tx), 0, 1, 0, this.w)
    this.y = this.p.map(this.p.noise(this.ty), 0, 1, 0, this.h)

    this.tx += 0.001
    this.ty += 0.001

    if (this.x < 0) {
      this.x += this.stepSize * 2
    }
    if (this.x >= this.w) {
      this.x -= this.stepSize * 2
    }
    if (this.y < 0) {
      this.y += this.stepSize * 2
    }
    if (this.y >= this.h) {
      this.y -= this.stepSize * 2
    }
  }
}
