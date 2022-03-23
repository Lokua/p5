import ControlPanel, {
  Range,
} from '../ControlPanel/index.mjs'

export default function sphere2(p, u) {
  const [w, h] = [500, 500]

  const controlPanel = new ControlPanel({
    id: 'sphere2',
    attemptReload: true,
    controls: {
      cameraX: new Range({
        name: 'cameraX',
        value: -160,
        min: -400,
        max: 400,
      }),
      cameraY: new Range({
        name: 'cameraY',
        value: 0,
        min: -400,
        max: 400,
      }),
      cameraZ: new Range({
        name: 'cameraZ',
        value: 0,
        min: -400,
        max: 400,
      }),
      resolution: new Range({
        name: 'resolution',
        value: 50,
        min: 2,
        max: 500,
        step: 2,
      }),
      radius: new Range({
        name: 'radius',
        value: 200,
        min: 1,
        max: 500,
      }),
      boxSize: new Range({
        name: 'boxSize',
        value: 10,
        min: 1,
        max: 100,
      }),
      colorRange: new Range({
        name: 'colorRange',
        value: 100,
        min: 1,
        max: 200,
      }),
      colorOffset: new Range({
        name: 'colorOffset',
        value: 0,
        min: 0,
        max: 100,
      }),
    },
    inputHandler() {
      !p.isLooping() && draw()
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h, p.WEBGL)
    p.noFill()
    p.noStroke()

    return {
      canvas,
    }
  }

  function draw() {
    const {
      resolution,
      radius,
      boxSize,
    } = controlPanel.values()

    setCamera()
    p.background(255)

    p.push()
    for (let i = 0; i < resolution; i++) {
      const longitude = u.xToLongitude(resolution, i)
      for (let j = 0; j < resolution; j++) {
        const latitude = u.yToLatitude(resolution, j)
        const [x, y, z] = u.geographicToCartesian(
          longitude,
          latitude,
          radius,
        )
        p.push()
        p.translate(
          p.noise(x) * 10 * x,
          p.noise(y) * 10 * y,
          p.noise(z) * z,
        )
        p.fill(p.noise(z) * 255)
        p.circle(0, 0, boxSize + (p.frameCount % z))
        p.pop()
      }
    }
    p.pop()
  }

  function setCamera() {
    const {
      cameraX,
      cameraY,
      cameraZ,
    } = controlPanel.values()

    p.camera(
      // eye
      cameraX,
      cameraY,
      h / 2 / p.tan(p.PI / 6) + cameraZ,
      // center
      0,
      0,
      0,
      // up
      0,
      1,
      0,
    )
  }

  return {
    setup,
    draw,
    destroy() {
      controlPanel.destroy()
    },
    metadata: {
      name: 'sphere2',
    },
  }
}
