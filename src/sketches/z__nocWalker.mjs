// https://natureofcode.com/random/
import chroma from 'chroma-js'
import ControlPanel, { Checkbox, Range } from '../lib/ControlPanel/index.mjs'
import AnimationHelper from '../lib/AnimationHelper.mjs'
import { d3ColorScales, renderSwatches } from '../lib/colors.mjs'
import { generateRange } from '../lib/scaling.mjs'
import { randomInt } from '../util.mjs'

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const metadata = {
    name: 'z__nocWalker',
    frameRate: 30,
  }

  const [w, h] = [500, 500]

  const ah = new AnimationHelper({
    p,
    frameRate: metadata.frameRate,
    bpm: 130,
  })

  const colorScale = chroma.scale(d3ColorScales.cool)
  const eraserColorScale = chroma.scale(['azure', 'white', colorScale(0.2)])

  let walker
  let buffer

  const controlPanel = new ControlPanel({
    p,
    id: metadata.name,
    controls: {
      allowDiagonal: new Checkbox({
        name: 'allowDiagonal',
        value: false,
      }),
      minStep: new Range({
        name: 'minStep',
        value: 2,
        min: 1,
        max: 100,
      }),
      maxStep: new Range({
        name: 'maxStep',
        value: 8,
        min: 1,
        max: 100,
      }),
      velocity: new Range({
        name: 'velocity',
        value: 1,
        min: 1,
        max: 1000,
      }),
      eraser: new Checkbox({
        name: 'eraser',
        value: false,
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

    p.colorMode(p.RGB, 255, 255, 255, 1)

    return {
      canvas,
    }
  }

  function draw() {
    const { allowDiagonal, velocity, minStep, maxStep, eraser, showSwatches } =
      controlPanel.values()

    p.background(colorScale(0.03).rgba())

    walker.allowDiagonal = allowDiagonal
    walker.stepSize = ah.repeat(
      generateRange(minStep, maxStep, maxStep - minStep, 'exponential', 2),
      0.25,
    )

    for (let i = 0; i < velocity; i++) {
      walker.step()
      buffer.stroke(
        eraser
          ? p.color(
              eraserColorScale(p.map(i, 0, velocity, 0, 1))
                .alpha(0.1)
                .rgba(),
            )
          : p.color(colorScale(p.map(i, 0, velocity, 0, 1)).rgba()),
      )
      walker.show()
    }

    p.image(buffer, 0, 0)

    if (showSwatches) {
      renderSwatches(p, w, [colorScale, eraserColorScale])
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
    this.allowDiagonal = allowDiagonal
    this.stepSize = stepSize
    this.rectSize = rectSize
  }

  show() {
    this.p.rect(this.x, this.y, this.rectSize, this.rectSize)
  }

  step() {
    if (this.allowDiagonal) {
      const r = () => randomInt(-this.stepSize, this.stepSize)
      this.x += r()
      this.y += r()
    } else {
      const choice = randomInt(3)
      if (choice === 0) {
        this.x += this.stepSize
      } else if (choice === 1) {
        this.x -= this.stepSize
      } else if (choice === 2) {
        this.y += this.stepSize
      } else {
        this.y -= this.stepSize
      }
    }

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
