import ControlPanel, {
  Range,
} from '../ControlPanel/index.mjs'
import { fromXY } from '../util.mjs'

export default function sphere(p, u) {
  const [w, h] = [500, 500]
  const lastXY = fromXY(w, w, h)
  const globe = []

  const controlPanel = new ControlPanel({
    controls: {
      cameraX: new Range({
        name: 'cameraX',
        value: 0,
        min: -200,
        max: 200,
      }),
      cameraY: new Range({
        name: 'cameraY',
        value: 0,
        min: -200,
        max: 200,
      }),
      cameraZ: new Range({
        name: 'cameraZ',
        value: 500,
        min: 0,
        max: 1000,
      }),
      resolution: new Range({
        name: 'resolution',
        value: 50,
        min: 1,
        max: 500,
      }),
      radius: new Range({
        name: 'radius',
        value: 200,
        min: 1,
        max: 500,
      }),
      hue: new Range({
        name: 'hue',
        value: 0,
        min: 0,
        max: 360,
      }),
      noise: new Range({
        name: 'noise',
        value: 0,
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
    const canvas = p.createCanvas(w, h, p.WEBGL)
    p.colorMode(p.HSB, 360, 100, 100)

    return {
      canvas,
    }
  }

  function draw() {
    const {
      resolution,
      radius,
      hue,
      noise,
    } = controlPanel.values()

    setCamera()

    p.background(0)
    p.stroke(255)

    for (let y = 0; y < resolution + 1; y++) {
      const latitude = u.yToLatitude(resolution, y)
      globe[y] = []
      for (let x = 0; x < resolution + 1; x++) {
        const longitude = u.xToLongitude(resolution, x)
        globe[y][x] = p.createVector(
          ...u.geographicToCartesian(
            longitude,
            latitude,
            radius,
          ),
        )
      }
    }

    for (let y = 0; y < resolution; y++) {
      p.beginShape(p.TRIANGLE_STRIP)
      for (let x = 0; x < resolution + 1; x++) {
        const h =
          (hue +
            p.map(fromXY(w, y, x), 0, lastXY, 0, 360)) %
          360
        p.fill(h, 75, 100)

        const v1 = globe[y][x]
        const v2 = globe[y + 1][x]

        const get = (c) => c + p.noise(c) * noise
        p.vertex(get(v1.x), get(v1.y), get(v1.z))
        p.vertex(get(v2.x), get(v2.y), get(v2.z))
      }
      p.endShape()
    }
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
      cameraZ,
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
      name: 'sphere',
    },
  }
}
