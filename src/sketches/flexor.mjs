// @ts-check
import ControlPanel, {
  Range,
  Toggle,
} from '../ControlPanel/index.mjs'
import { getProgress as getProgress_ } from '../util.mjs'

/**
 * @param {import("p5")} p
 */
export default function (p) {
  const metadata = {
    name: 'flexor',
    frameRate: 24,
  }

  const [w, h] = [500, 500]
  let noiseBuffer

  const getProgress = (noteDuration) =>
    getProgress_(
      metadata.frameRate,
      p.frameCount,
      134,
      noteDuration,
    )

  const controlPanel = new ControlPanel({
    id: metadata.name,
    attemptReload: true,
    controls: {
      grid: new Range({
        name: 'grid',
        value: 6,
        min: 3,
        max: 128,
      }),
      circleSize: new Range({
        name: 'circleSize',
        value: 0.05,
        min: 0.001,
        max: 1,
        step: 0.001,
      }),
      delayPerColumn: new Range({
        name: 'delayPerColumn',
        value: 1,
        min: 0.001,
        max: 1,
        step: 0.001,
      }),
      animateX: new Toggle({
        name: 'animateX',
        value: true,
      }),
      animateY: new Toggle({
        name: 'animateY',
        value: true,
      }),
    },
    inputHandler() {
      !p.isLooping() && draw()
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)
    noiseBuffer = p.createGraphics(w, h)
    noiseBackground()

    return {
      canvas,
    }
  }

  function draw() {
    const {
      grid,
      circleSize,
      animateX,
      animateY,
      delayPerColumn,
    } = controlPanel.values()
    p.background(0)
    p.image(noiseBuffer, 0, 0)

    const spacing = p.width / (grid + 1)
    const amplitude = 20

    p.noStroke()

    for (let i = 1; i <= grid; i++) {
      for (let j = 1; j <= grid; j++) {
        let x = j * spacing
        let y = i * spacing

        const phaseOffset =
          (i + j - 2) / (2 * grid * delayPerColumn)

        if (animateX) {
          const progress = getProgress(4)
          const adjustedProgress =
            (progress - phaseOffset) % 1
          x +=
            p.sin(adjustedProgress * p.TWO_PI) * amplitude
        }
        if (animateY) {
          const progress = getProgress(4)
          const adjustedProgress =
            (progress - phaseOffset) % 1
          y +=
            p.sin(adjustedProgress * p.TWO_PI) * amplitude
        }

        p.ellipse(x, y, spacing * circleSize)
      }
    }
  }

  function noiseBackground() {
    noiseBuffer.loadPixels()
    const d = p.pixelDensity()
    const size = w * d
    // smaller values make larger patterns
    const noiseScale = 0.07
    const brightness = 48
    const alpha = 255
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        const noiseValue =
          p.noise(x * noiseScale, y * noiseScale) *
          brightness
        const index = (x + y * size) * 4
        noiseBuffer.pixels[index] = noiseValue
        noiseBuffer.pixels[index + 1] = noiseValue
        noiseBuffer.pixels[index + 2] = noiseValue
        noiseBuffer.pixels[index + 3] = alpha
      }
    }
    noiseBuffer.updatePixels()
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
