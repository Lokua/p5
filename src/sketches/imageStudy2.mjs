import ControlPanel, { Range } from '../ControlPanel/index.mjs'
import { randomSign, FRAMERATE_BPM_130 } from '../util.mjs'

export default function (p) {
  const [w, h] = [500, 500]
  let image

  const metadata = {
    name: 'imageStudy2',
    frameRate: FRAMERATE_BPM_130 / 2,
  }

  const controlPanel = new ControlPanel({
    id: metadata.name,
    attemptReload: true,
    controls: {
      resolution: new Range({
        name: 'resolution',
        value: 1,
        min: 1,
        max: 100,
      }),
      offset: new Range({
        name: 'offset',
        value: 1,
        min: 1,
        max: 1000,
      }),
    },
    inputHandler() {
      !p.isLooping() && draw()
    },
  })

  function preload() {
    image = p.loadImage('assets/modular.jpg')
  }

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    p.noLoop()
    p.noStroke()
    p.noFill()
    p.background(0)
    p.frameRate(metadata.frameRate)

    return {
      canvas,
    }
  }

  function draw() {
    const { resolution, offset } = controlPanel.values()

    p.background(0)

    for (let y = 0; y < image.width; y += resolution) {
      for (let x = 0; x < image.height; x += resolution) {
        p.push()
        const color = image.get(x, y)
        p.stroke(color)
        p.strokeWeight(p.random(5))
        p.translate(x, y)
        p.curve(
          x * randomSign(),
          y * randomSign(),
          p.sin(x) * offset * randomSign(),
          p.cos(x) * offset * randomSign(),
          offset * randomSign(),
          offset * randomSign(),
          p.sin(p.noise(x + p.random())) * offset * randomSign(),
          p.cos(p.noise(y + p.random())) * offset * randomSign(),
        )
        p.pop()
      }
    }
  }

  return {
    preload,
    setup,
    draw,
    destroy() {
      controlPanel.destroy()
    },
    metadata,
  }
}
