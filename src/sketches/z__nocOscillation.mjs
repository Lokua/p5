// https://natureofcode.com/oscillation/
import ControlPanel, { Checkbox, Range } from '../lib/ControlPanel/index.mjs'
import AnimationHelper from '../lib/AnimationHelper.mjs'

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const metadata = {
    name: 'z__nocOscillation',
    frameRate: 30,
  }

  const [w, h] = [500, 500]
  const center = p.createVector(w / 2, h / 2)

  const ah = new AnimationHelper({
    p,
    frameRate: metadata.frameRate,
    bpm: 134,
  })

  const controlPanel = new ControlPanel({
    p,
    id: metadata.name,
    controls: {
      diameter: new Range({
        name: 'diameter',
        value: 20,
        min: 1,
        max: 100,
      }),
      length: new Range({
        name: 'length',
        value: 70,
        min: 1,
        max: 200,
      }),
      opacity: new Range({
        name: 'opacity',
        value: 0.5,
        min: 0,
        max: 1,
        step: 0.001,
      }),
      offset: new Range({
        name: 'offset',
        value: 9,
        min: 0,
        max: 50,
      }),
      flip: new Checkbox({
        name: 'flip',
        value: false,
      }),
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    p.colorMode(p.RGB, 255, 255, 255, 1)
    p.rectMode(p.CENTER)

    return {
      canvas,
    }
  }

  const values = [2, 3, 4, 6, 8, 12, 16]

  function draw() {
    const { diameter, length, opacity, offset, flip } = controlPanel.values()

    p.background(245, opacity)
    p.stroke(0)
    p.strokeWeight(2)
    p.fill(0)

    values.forEach((n, i) => {
      drawBaton(
        flip ? values[values.length - 1 - i] * 2 : n * 2,
        length + n * offset,
        diameter,
        n % 3 === 0 ? 'red' : 'black',
      )
    })
  }

  function drawBaton(speedIn16ths, length, diameter, color = 0) {
    p.$.pushPop(() => {
      p.fill(color)
      p.stroke(color)
      p.translate(center.x, center.y)
      p.rotate(p.TWO_PI * 2 * ah.getLoopProgress(speedIn16ths))
      p.line(-length, 0, length, 0)
      p.circle(-length, 0, diameter)
      p.circle(length, 0, diameter)
    })
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
