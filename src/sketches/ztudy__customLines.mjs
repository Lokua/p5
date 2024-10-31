// @ts-check
import chroma from 'chroma-js'
import ControlPanel from '../lib/ControlPanel/index.mjs'
import Lines from '../lib/Lines.mjs'

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const [w, h] = [500, 500]

  const metadata = {
    name: 'ztudy__customLines',
    frameRate: 30,
  }

  const lines = new Lines(p)

  const controlPanel = new ControlPanel({
    p,
    id: metadata.name,
    controls: {},
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
    p.background(255)

    const count = 10
    const spacing = w / (count + 1)

    let i = 1
    const getX = () => i * spacing
    const y1 = h / 4
    const y2 = h * (3 / 4)

    lines.dualLine({
      strokeWeight: 1,
      stroke1: chroma('black').rgba(),
      stroke2: chroma('magenta').alpha(0.3).rgba(),
      p1: [getX(), y1],
      p2: [getX(), y2],
    })
    i++

    lines.gradientLine(
      getX(),
      y1,
      getX(),
      y2,
      chroma('black').rgba(),
      chroma('magenta').rgba(),
      10,
    )
    i++

    p.stroke(0)
    lines.wavyLine(getX(), y1, getX(), y2, 10, 10)
    i++

    lines.taperedLine(getX(), y1, getX(), y2, 1, 5)
    i++

    lines.taperedLine(getX(), y1, getX(), y2, 5, 1)
    i++

    p.strokeWeight(1)
    lines.curvedLine(getX(), y1, getX(), y2, 20)
    i++

    lines.taperedLine(getX(), y1, getX(), y2, 5, 1, 5, 2, 3)
    i++

    lines.glowingLine(getX(), y1, getX(), y2, 'black', 'magenta', 1)
    i++

    p.noiseSeed(88)
    lines.dottedLine(getX(), y1, getX(), y2, 3, 12)
    i++

    p.strokeWeight(1)
    lines.zigzagLine(y1, getX(), y2, getX(), 10, 10)
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
