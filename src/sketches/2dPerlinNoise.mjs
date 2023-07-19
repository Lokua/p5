// https://www.youtube.com/watch?v=ikwNrFvnL3g

import ControlPanel, {
  Range,
} from '../ControlPanel/index.mjs'

export default function (p) {
  const [w, h] = [500, 500]

  const metadata = {
    name: '2dPerlinNoise',
    frameRate: 30,
  }

  const controlPanel = new ControlPanel({
    id: metadata.name,
    attemptReload: true,
    controls: {
      increment: new Range({
        name: 'increment',
        value: 0.1,
        min: 0.001,
        max: 1,
        step: 0.001,
      }),
    },
    inputHandler() {
      !p.isLooping() && draw()
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    return {
      canvas,
    }
  }

  function draw() {
    const { increment } = controlPanel.values()
    p.background(255)

    let xoff = 0
    for (let x = 0; x < w; x++) {
      let yoff = 0
      for (let y = 0; y < h; y++) {
        p.stroke(p.noise(xoff, yoff) * 255)
        p.point(x, y)
        yoff += increment
      }
      xoff += increment
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
