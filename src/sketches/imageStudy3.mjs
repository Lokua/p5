import ControlPanel, {
  Range,
} from '../ControlPanel/index.mjs'
import {
  BidirectionalCounter,
  randomSign,
  FRAMERATE_BPM_130,
} from '../util.mjs'

export default function (p) {
  const [w, h] = [500, 500]
  const offsetCounter = new BidirectionalCounter(1, 50)
  const resolutionCounter = new BidirectionalCounter(
    20,
    100,
  )
  let image

  const metadata = {
    name: 'imageStudy3',
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
    // eslint-disable-next-line no-unused-vars
    const { resolution, offset } = controlPanel.values()

    // p.background(0)
    const offs = offset + offsetCounter.count
    const res = resolutionCounter.count

    for (let y = 0; y < image.width; y += res) {
      for (let x = 0; x < image.height; x += res) {
        p.push()
        const color = image.get(x, y)
        p.stroke(color)
        p.strokeWeight(p.random(5))
        p.translate(x, y)
        p.curve(
          x * randomSign(),
          y * randomSign(),
          p.sin(x) * offs * randomSign(),
          p.cos(x) * offs * randomSign(),
          offs * randomSign(),
          offs * randomSign(),
          p.sin(p.noise(x + p.random())) *
            offs *
            randomSign(),
          p.cos(p.noise(y + p.random())) *
            offs *
            randomSign(),
        )
        p.pop()
      }
    }

    offsetCounter.tick()

    if (p.frameCount % 10 === 0) {
      resolutionCounter.tick()
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
