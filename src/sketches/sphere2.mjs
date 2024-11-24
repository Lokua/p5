import { createControlPanel } from '../lib/ControlPanel/index.mjs'
import { PHI } from '../util.mjs'
import AnimationHelper from '../lib/AnimationHelper.mjs'

// I have no idea what I'm doing

/**
 * @param {import('p5')} p
 */
export default function sphere(p) {
  const metadata = {
    name: 'sphere2',
    frameRate: 30,

    // WARNING! This is probably too big
    // if recording video but perfect for images
    pixelDensity: 6,
  }

  const [w, h] = [500, 500]
  const globe = []

  const ah = new AnimationHelper({
    p,
    frameRate: metadata.frameRate,
    bpm: 134,
  })

  const cp = createControlPanel({
    p,
    id: 'sphere',
    controls: [
      {
        type: 'Range',
        name: 'cameraX',
        value: 0,
        min: -200,
        max: 200,
        disabled: true,
      },
      {
        type: 'Range',
        name: 'cameraY',
        value: 0,
        min: -360,
        max: 360,
        disabled: true,
      },
      {
        type: 'Range',
        name: 'cameraZ',
        value: 500,
        min: 0,
        max: 1000,
      },
      {
        type: 'Range',
        name: 'resolution',
        value: 50,
        min: 1,
        max: 64,
      },
      {
        type: 'Range',
        name: 'globeRadius',
        value: 5,
        min: 1,
        max: 500,
      },
      {
        type: 'Range',
        name: 'radius',
        value: 3,
        min: 1,
        max: 20,
      },
      {
        type: 'Range',
        name: 'noise',
        value: 0,
        min: 0,
        max: 1000,
      },
    ],
  })

  function setup() {
    cp.init()
    const canvas = p.createCanvas(w, h, p.WEBGL)
    p.colorMode(p.RGB, 255, 255, 255, 1)
    return {
      canvas,
    }
  }

  function draw() {
    setCamera()

    p.background(0)
    p.noFill()
    p.lights()

    for (let y = 0; y < cp.resolution + 1; y++) {
      const latitude = p.$.yToLatitude(cp.resolution, y)
      globe[y] = []
      for (let x = 0; x < cp.resolution + 1; x++) {
        const longitude = p.$.xToLongitude(cp.resolution, x)
        globe[y][x] = p.createVector(
          ...p.$.geographicToCartesian(longitude, latitude, cp.globeRadius),
        )
      }
    }

    for (let y = 0; y < cp.resolution; y++) {
      for (let x = 0; x < cp.resolution + 1; x++) {
        const v = globe[y][x]
        const outward = v.copy().normalize()

        const distance =
          (p.noise(v.x * 0.1, v.y * 0.1, v.z * 0.1, p.frameCount * 0.01) -
            0.5) *
          ah.animate({
            keyframes: [cp.noise / 8, cp.noise, cp.noise / 8],
            duration: 1,
            every: 1,
            delay: 0.5,
          })

        const d2 =
          (p.noise(v.x * 0.1, v.y * 0.1, v.z * 0.1, p.frameCount * 0.01) -
            0.5) *
          ah.animate({
            keyframes: [cp.noise / 8, cp.noise, cp.noise / 8],
            duration: 1.5,
            every: 3,
            delay: 0.5,
          })

        const v2 = p.createVector(
          v.x + outward.x * distance,
          v.y + outward.y * distance,
          v.z + outward.z * distance,
        )
        const v3 = p.createVector(
          v.x + outward.x * d2,
          v.y + outward.y * d2,
          v.z + outward.z * d2,
        )

        p.$.pushPop(() => {
          p.translate(v2.x, v2.y, v2.z)

          p.stroke('red')
          p.strokeWeight(2)
          p.$.vPoint(v2)

          p.rotateX(p.radians(45))
          p.scale(1.3)
          p.stroke('blue')
          p.strokeWeight(1)
          p.$.vPoint(v2)
          p.rotateX(p.frameCount * 0.1)
        })

        p.$.pushPop(() => {
          p.rotateX(p.radians(45))
          p.scale(1.6)
          p.stroke('pink')
          p.strokeWeight(2)
          p.$.vPoint(v3)

          p.rotateX(p.radians(45))
          p.scale(2)
          p.stroke('cyan')
          p.strokeWeight(1)
          p.$.vPoint(v3)
          p.rotateX(p.frameCount * 0.1)
        })
      }
    }
  }

  function setCamera() {
    const orbitRadius = cp.cameraZ

    const angle = ah.animate({
      keyframes: [0, 10],
      duration: 48,
    })

    const x = orbitRadius * p.cos(angle)
    const z = orbitRadius * p.sin(angle)

    p.camera(
      // Camera X (orbiting)
      x,
      // Camera Y
      ah.animate({
        keyframes: [-360, 360, -360],
        duration: 4,
      }),
      // Camera Z (orbiting)
      z,
      // Center X
      0,
      // Center Y
      0,
      // Center Z
      0,
      // Up X
      0,
      // Up Y
      1,
      // Up Z
      0,
    )
  }

  return {
    setup,
    draw,
    destroy() {
      cp.destroy()
    },
    metadata,
  }
}
