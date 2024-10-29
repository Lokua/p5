import ControlPanel, { Range } from '../ControlPanel/index.mjs'
import { fromXY } from '../util.mjs'
import AnimationHelper from '../AnimationHelper.mjs'

export default function sphere(p) {
  const metadata = {
    name: 'sphere2',
    frameRate: 30,
  }

  const [w, h] = [500, 500]
  const lastXY = fromXY(w, w, h)
  const globe = []

  const ah = new AnimationHelper({
    p,
    frameRate: metadata.frameRate,
    bpm: 134,
  })

  const controlPanel = new ControlPanel({
    p,
    id: 'sphere',
    controls: {
      cameraX: new Range({
        name: 'cameraX',
        value: 0,
        min: -200,
        max: 200,
        disabled: true,
      }),
      cameraY: new Range({
        name: 'cameraY',
        value: 0,
        min: -360,
        max: 360,
        disabled: true,
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
      noise: new Range({
        name: 'noise',
        value: 0,
        min: 0,
        max: 1000,
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
    const { resolution, radius, hue, noise, backgroundHue } =
      controlPanel.values()

    setCamera()

    p.background(0, 0, backgroundHue)
    p.strokeWeight(1)

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
      for (let x = 0; x < resolution + 1; x++) {
        const h = (hue + p.map(fromXY(w, y, x), 0, lastXY, 0, 360)) % 360
        p.stroke(h, 75, 100, 0.7)

        const v = globe[y][x]

        const outward = v.copy().normalize()
        const distance =
          (p.noise(v.x * 0.1, v.y * 0.1, v.z * 0.1, p.frameCount * 0.01) -
            0.5) *
          ah.animate({
            keyframes: [0, noise, 0],
            duration: 2,
            every: 4,
            easing: 'easeIn',
            delay: 0.5,
          })
        const distortedV = p.createVector(
          v.x + outward.x * distance,
          v.y + outward.y * distance,
          v.z + outward.z * distance,
        )

        // p.point(distortedV.x, distortedV.y, distortedV.z)
        // Draw a small 3D sphere at each distorted vertex
        p.push()
        p.translate(distortedV.x, distortedV.y, distortedV.z)
        p.sphere(5) // Adjust size as needed
        p.pop()
      }
    }
  }

  function setCamera() {
    // eslint-disable-next-line no-unused-vars
    const { cameraX, cameraY, cameraZ } = controlPanel.values()
    const orbitRadius = cameraZ

    const angle = ah.animate({
      keyframes: [0, 10],
      duration: 48,
    })

    const x = orbitRadius * p.cos(angle)
    const z = orbitRadius * p.sin(angle)

    p.camera(
      x, // Camera X (orbiting)
      ah.animate({
        keyframes: [-360, 360, -360],
        duration: 4,
      }), // Camera Y
      z, // Camera Z (orbiting)
      0, // Center X
      0, // Center Y
      0, // Center Z
      0, // Up X
      1, // Up Y
      0, // Up Z
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
