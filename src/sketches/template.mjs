import ControlPanel, {
  Range,
} from '../ControlPanel/index.mjs'

export default function (p) {
  const [w, h] = [500, 500]

  const metadata = {
    name: 'imageStudy',
    frameRate: 30,
  }

  const controlPanel = new ControlPanel({
    id: metadata.name,
    attemptReload: true,
    controls: {
      a: new Range({
        name: 'a',
        value: 50,
        min: 0,
        max: 1000,
      }),
    },
    inputHandler() {
      !p.isLooping() && draw()
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    p.colorMode(p.HSB, 100)

    return {
      canvas,
    }
  }

  function draw() {
    const { a } = controlPanel.values()
    p.background(255)
    p.fill(0, 50, 100)
    p.stroke(100, 0, 0)
    p.push()
    p.translate(w / 2, h / 2)
    p.circle(0, 0, a)
    p.pop()
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
