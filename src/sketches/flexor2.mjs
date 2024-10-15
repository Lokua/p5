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
    name: 'flexor2',
    frameRate: 24,
  }

  const [w, h] = [500, 500]
  const amplitude = 20
  const padding = 20
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
      waveTime: new Range({
        name: 'waveTime',
        value: 4,
        min: 1,
        max: 24,
      }),
      animateX: new Toggle({
        name: 'animateX',
        value: true,
      }),
      animateY: new Toggle({
        name: 'animateY',
        value: true,
      }),
      nearHue: new Range({
        name: 'nearHue',
        value: 20,
        min: 0,
        max: 100,
      }),
      colorShift: new Toggle({
        name: 'colorShift',
        value: false,
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

    p.colorMode(p.HSL, 100, 100, 100)
    noiseBuffer.colorMode(p.HSL, 100, 100, 100)

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
      waveTime,
      colorShift,
      nearHue,
    } = controlPanel.values()
    p.noStroke()
    p.background(0)
    p.image(noiseBuffer, 0, 0)

    const spacing = (p.width - padding * 2) / (grid + 1)
    const progress = getProgress(waveTime)
    const nearColor = p.color(nearHue, 100, 50)
    const farColor = p.color(0, 0, 100)

    for (let i = 0; i < grid; i++) {
      for (let j = 0; j < grid; j++) {
        let x = padding + (j + 1) * spacing
        let y = padding + (i + 1) * spacing

        const phaseOffset =
          (i + j) / (2 * grid * delayPerColumn)
        const adjustedProgress =
          (progress - phaseOffset + 1) % 1
        let displacementX = 0
        let displacementY = 0

        if (animateX) {
          displacementX =
            p.sin(adjustedProgress * p.TWO_PI) * amplitude
          x += displacementX
        }
        if (animateY) {
          displacementY =
            p.sin(adjustedProgress * p.TWO_PI) * amplitude
          y += displacementY
        }

        const totalDisplacement = Math.hypot(
          displacementX,
          displacementY,
        )
        const maxDisplacement = amplitude * Math.SQRT2
        const depth = totalDisplacement / maxDisplacement

        let circleColor = p.lerpColor(
          farColor,
          nearColor,
          depth,
        )

        if (colorShift) {
          circleColor = p.lerpColor(
            nearColor,
            farColor,
            depth,
          )
        }

        p.fill(circleColor)
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
