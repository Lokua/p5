import ControlPanel, {
  Range,
} from '../ControlPanel/index.mjs'

export default function (p) {
  const [w, h] = [500, 500]
  let image

  const metadata = {
    name: 'imageStudy',
    frameRate: 30,
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
    p.background(0)

    return {
      canvas,
    }
  }

  function draw() {
    const { resolution } = controlPanel.values()

    // p.background(255)

    for (let y = 0; y < image.width; y += resolution) {
      for (let x = 0; x < image.height; x += resolution) {
        p.push()
        const color = image.get(x, y)
        p.stroke(color)
        p.strokeWeight(resolution)
        p.translate(x, y)
        p.point(0, 0)
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
