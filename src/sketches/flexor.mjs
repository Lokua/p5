// @ts-check
import ControlPanel, { Range, Toggle, Select } from '../ControlPanel/index.mjs'
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
  const amplitude = 20
  const padding = 20
  let noiseBuffer

  const getProgress = (noteDuration) =>
    getProgress_(metadata.frameRate, p.frameCount, 134, noteDuration)

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
        max: 2,
        step: 0.001,
      }),
      waveTime: new Range({
        name: 'waveTime',
        value: 4,
        min: 1,
        max: 24,
      }),
      lightBackground: new Toggle({
        name: 'lightBackground',
        value: false,
      }),
      nearHue: new Range({
        name: 'nearHue',
        value: 20,
        min: 0,
        max: 100,
      }),
      animateX: new Toggle({
        name: 'animateX',
        value: true,
      }),
      animateY: new Toggle({
        name: 'animateY',
        value: true,
      }),
      colorShift: new Toggle({
        name: 'colorShift',
        value: false,
      }),
      phaseMode: new Select({
        name: 'phaseMode',
        options: [
          'default',
          'distanceFromCenter',
          'productOfIndices',
          'moduloPattern',
          'trigonometricFunctions',
          'checkerboardEffect',
          'absoluteDifference',
          'randomOffsets',
          'perlinNoise',
          'exponentialDecay',
          'distanceFromEdge',
          'differenceOfSquares',
          'manhattanDistance',
        ],
      }),
      phaseVarA: new Range({
        name: 'phaseVarA',
        value: 12,
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
      lightBackground,
      grid,
      circleSize,
      animateX,
      animateY,
      delayPerColumn,
      waveTime,
      colorShift,
      nearHue,
      phaseMode,
      phaseVarA,
    } = controlPanel.values()
    p.noStroke()

    if (lightBackground) {
      p.background(100)
    } else {
      p.background(0)
      p.image(noiseBuffer, 0, 0)
    }

    const spacing = (p.width - padding * 2) / (grid + 1)
    const progress = getProgress(waveTime)
    const nearColor = p.color(nearHue, 100, lightBackground ? 30 : 50)
    const farColor = lightBackground ? p.color(100, 0, 0) : p.color(0, 0, 100)

    for (let i = 0; i < grid; i++) {
      for (let j = 0; j < grid; j++) {
        let x = padding + (j + 1) * spacing
        let y = padding + (i + 1) * spacing

        const phaseOffset = getPhaseOffset(
          phaseMode,
          i,
          j,
          grid,
          delayPerColumn,
          phaseVarA,
        )

        const adjustedProgress = (progress - phaseOffset + 1) % 1
        let displacementX = 0
        let displacementY = 0

        if (animateX) {
          displacementX = p.sin(adjustedProgress * p.TWO_PI) * amplitude
          x += displacementX
        }
        if (animateY) {
          displacementY = p.sin(adjustedProgress * p.TWO_PI) * amplitude
          y += displacementY
        }

        const totalDisplacement = Math.hypot(displacementX, displacementY)
        const maxDisplacement = amplitude * Math.SQRT2
        const depth = totalDisplacement / maxDisplacement

        p.fill(
          colorShift
            ? p.lerpColor(nearColor, farColor, depth)
            : p.lerpColor(farColor, nearColor, depth),
        )
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
        const noiseValue = p.noise(x * noiseScale, y * noiseScale) * brightness
        const index = (x + y * size) * 4
        noiseBuffer.pixels[index] = noiseValue
        noiseBuffer.pixels[index + 1] = noiseValue
        noiseBuffer.pixels[index + 2] = noiseValue
        noiseBuffer.pixels[index + 3] = alpha
      }
    }
    noiseBuffer.updatePixels()
  }

  function getPhaseOffset(phaseMode, i, j, grid, delayPerColumn, phaseVarA) {
    return {
      default: () => (i + j) / (2 * grid * delayPerColumn),
      distanceFromCenter: () => {
        const center = (grid - 1) / 2
        const distance = Math.hypot(i - center, j - center)
        const maxDistance = Math.hypot(center, center)
        return distance / maxDistance / delayPerColumn
      },
      productOfIndices: () => (i * j) / (grid * grid * delayPerColumn),
      moduloPattern: () => ((i + j) % phaseVarA) / (phaseVarA * delayPerColumn),
      trigonometricFunctions() {
        const frequency = phaseVarA * 0.001
        return (
          (p.sin(i * frequency) + p.cos(j * frequency)) / (2 * delayPerColumn)
        )
      },
      checkerboardEffect: () =>
        ((i + j) % phaseVarA) / (phaseVarA * delayPerColumn),
      absoluteDifference: () => Math.abs(i - j) / (grid * delayPerColumn),
      perlinNoise() {
        const noiseScale = phaseVarA * 0.001
        return p.noise(i * noiseScale, j * noiseScale) / delayPerColumn
      },
      exponentialDecay: () => Math.exp(-((i + j) / grid)) / delayPerColumn,
      distanceFromEdge() {
        const distance = Math.min(i, j, grid - 1 - i, grid - 1 - j)
        return distance / grid / delayPerColumn
      },
      differenceOfSquares: () =>
        Math.abs(i * i - j * j) / (grid * grid * delayPerColumn),
      manhattanDistance() {
        const center = (grid - 1) / 2
        const distance = Math.abs(i - center) + Math.abs(j - center)
        const maxDistance = center * 2
        return distance / maxDistance / delayPerColumn
      },
    }[phaseMode]()
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
