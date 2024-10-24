// @ts-check
import ControlPanel, { Range } from '../ControlPanel/index.mjs'

/**
 * @param {import("p5")} p
 */
export default function (p) {
  const [w, h] = [500, 500]

  const metadata = {
    name: 'template',
    frameRate: 30,
  }

  const controlPanel = new ControlPanel({
    p,
    id: metadata.name,
    controls: {
      diameter: new Range({
        name: 'diameter',
        value: 50,
        min: 0,
        max: 1000,
      }),
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    p.colorMode(p.HSB, 100)
    p.noStroke()

    return {
      canvas,
    }
  }

  function draw() {
    const { diameter } = controlPanel.values()
    p.background(255)
    p.fill(0, 62, 100)
    p.circle(w / 2, h / 2, diameter)
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
