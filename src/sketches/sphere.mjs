import ControlPanel, { Range } from '../ControlPanel/index.mjs'
import { fromXY } from '../util.mjs'

export default function sphere(p) {
  const metadata = {
    name: 'sphere',
    frameRate: 30,
  }

  const [w, h] = [500, 500]
  const lastXY = fromXY(w, w, h)
  const globe = []

  const controlPanel = new ControlPanel({
    p,
    id: 'sphere',
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
      backgroundHue: new Range({
        name: 'backgroundHue',
        value: 0,
        min: 0,
        max: 100,
      }),
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
    const { resolution, radius, hue, backgroundHue } = controlPanel.values()

    setCamera()

    p.background(0, 0, backgroundHue)
    p.stroke(255)

    for (let y = 0; y < resolution + 1; y++) {
      const latitude = yToLatitude(resolution, y)
      globe[y] = []
      for (let x = 0; x < resolution + 1; x++) {
        const longitude = xToLongitude(resolution, x)
        globe[y][x] = p.createVector(
          ...geographicToCartesian(longitude, latitude, radius),
        )
      }
    }

    for (let y = 0; y < resolution; y++) {
      p.beginShape(p.TRIANGLE_STRIP)
      for (let x = 0; x < resolution + 1; x++) {
        const h = (hue + p.map(fromXY(w, y, x), 0, lastXY, 0, 360)) % 360
        p.fill(h, 100, 100)

        const v1 = globe[y][x]
        const v2 = globe[y + 1][x]

        p.vertex(v1.x, v1.y, v1.z)
        p.vertex(v2.x, v2.y, v2.z)
      }
      p.endShape()
    }
  }

  function setCamera() {
    const { cameraX, cameraY, cameraZ } = controlPanel.values()

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

  function xToLongitude(resolution, x) {
    return p.map(x, 0, resolution, 0, p.PI)
  }

  function yToLatitude(resolution, y) {
    return p.map(y, 0, resolution, 0, p.TWO_PI)
  }

  function geographicToCartesian(longitude, latitude, radius) {
    const x = radius * p.sin(longitude) * p.cos(latitude)
    const y = radius * p.sin(longitude) * p.sin(latitude)
    const z = radius * p.cos(longitude)
    return [x, y, z]
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
