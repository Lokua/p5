// @ts-check
import chroma from 'chroma-js'
import ControlPanel, { Range } from '../lib/ControlPanel/index.mjs'
import AnimationHelper from '../lib/AnimationHelper.mjs'

/**
 * @param {import("p5")} p
 */
export default function (p) {
  const [w, h] = [500, 500]

  const metadata = {
    name: 'blobbiness',
    frameRate: 120,
  }

  const ah = new AnimationHelper({
    p,
    frameRate: metadata.frameRate,
    bpm: 130,
    latencyOffset: -36,
  })

  const scale = chroma.scale(['#222', chroma('azure').saturate(0.25)])

  const controlPanel = new ControlPanel({
    p,
    id: metadata.name,
    controls: {
      radius: new Range({
        name: 'radius',
        value: 100,
        min: 1,
        max: 500,
      }),
      backgroundAlpha: new Range({
        name: 'backgroundAlpha',
        value: 1,
        min: 0,
        max: 1,
        step: 0.001,
      }),
      blobbiness: new Range({
        name: 'blobbiness',
        value: 0,
        min: 0,
        max: 1000,
        step: 1,
      }),
      seed: new Range({
        name: 'seed',
        // value=0 yields symmetric blob
        value: 1,
        min: 1,
        max: 1000,
        step: 1,
      }),
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    p.colorMode(p.RGB, 255, 255, 255, 1)

    return {
      canvas,
    }
  }

  function draw() {
    const { radius, backgroundAlpha, blobbiness, seed } = controlPanel.values()
    p.background(255, backgroundAlpha)

    const cols = 3
    const rows = 3
    const cellWidth = w / cols
    const cellHeight = h / rows

    let delay = 0
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const centerX = cellWidth * i + cellWidth / 2
        const centerY = cellHeight * j + cellHeight / 2
        const theSeed = ah.repeatValues({
          keyframes: [0, 1, 3, 5, 7, 11].map(
            (x) => x + (seed + i * cols + j) + seed,
          ),
          duration: 3,
        })
        renderCircle(centerX, centerY, radius, 6, blobbiness, theSeed, delay)
        renderRing(centerX, centerY, radius, 3, blobbiness, theSeed)
        delay += 0.25
      }
    }
  }

  function renderCircle(
    x,
    y = x,
    radius,
    duration,
    blobbiness,
    seed,
    delay = 0,
  ) {
    p.noStroke()
    p.fill(
      scale(
        ah.animate({
          keyframes: [0, 0.8, 0],
          duration,
          delay,
        }),
      )
        .alpha(0.6)
        .rgba(),
    )
    blobbyCircle({
      x,
      y,
      radius:
        p.sin(
          ah.animate({
            keyframes: [0.25, 1, 0.25],
            duration,
            delay,
          }),
        ) * radius,
      blobbiness,
      seed,
    })
  }

  function renderRing(x, y = x, radius, duration, blobbiness, seed) {
    p.stroke(
      scale(
        ah.animate({
          keyframes: [0, 1],
          duration,
        }),
      )
        .alpha(
          ah.animate({
            keyframes: [1, 0],
            duration,
          }),
        )
        .rgba(),
    )
    p.strokeWeight(
      ah.animate({
        keyframes: [1, 24],
        duration,
        easing: 'easeIn',
      }),
    )
    p.noFill()
    blobbyCircle({
      x,
      y,
      radius: ah.animate({
        keyframes: [0, radius * 4],
        duration,
      }),
      blobbiness,
      seed,
    })
  }

  function blobbyCircle({ x, y = x, radius, blobbiness = 0, seed = 0 }) {
    const numVertices = 200
    const smoothingFactor = 0.2

    p.randomSeed(seed)

    p.beginShape()
    for (let i = 0; i < p.TWO_PI; i += p.TWO_PI / numVertices) {
      const angle = i

      const baseNoise = p.noise(
        p.cos(angle) * 0.5 + seed,
        p.sin(angle) * 0.5 + seed,
      )

      const noiseLeft = p.noise(
        p.cos(angle - smoothingFactor) * 0.5 + seed,
        p.sin(angle - smoothingFactor) * 0.5 + seed,
      )

      const noiseRight = p.noise(
        p.cos(angle + smoothingFactor) * 0.5 + seed,
        p.sin(angle + smoothingFactor) * 0.5 + seed,
      )

      const smoothNoise = (baseNoise + noiseLeft + noiseRight) / 3

      const offset = smoothNoise * blobbiness
      const blobX = x + p.cos(angle) * (radius + offset)
      const blobY = y + p.sin(angle) * (radius + offset)

      p.vertex(blobX, blobY)
    }
    p.endShape(p.CLOSE)
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
