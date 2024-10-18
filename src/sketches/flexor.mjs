// @ts-check
import ControlPanel, { Range, Toggle, Select } from '../ControlPanel/index.mjs'
import AnimationHelper from '../AnimationHelper.mjs'

/**
 * @param {import("p5")} p
 */
export default function (p) {
  const metadata = {
    name: 'flexor',
    frameRate: 24,
  }

  const [w, h] = [500, 500]
  const animationHelper = new AnimationHelper(p, metadata.frameRate, 134)
  const amplitude = 20
  const padding = 20
  let noiseBuffer

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
          'spiralPattern',
          'distanceFromEdge',
          'sumOfSquares',
          'differenceOfSquares',
          'manhattanDistance',
        ],
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
      phaseMode,
    } = controlPanel.values()
    p.noStroke()
    p.background(0)
    p.image(noiseBuffer, 0, 0)

    const spacing = (p.width - padding * 2) / (grid + 1)
    const progress = animationHelper.getLoopProgress(waveTime)
    const nearColor = p.color(nearHue, 100, 50)
    const farColor = p.color(0, 0, 100)

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

        let circleColor = p.lerpColor(farColor, nearColor, depth)

        if (colorShift) {
          circleColor = p.lerpColor(nearColor, farColor, depth)
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

  function getPhaseOffset(phaseMode, i, j, grid, delayPerColumn) {
    return {
      default: () => (i + j) / (2 * grid * delayPerColumn),
      distanceFromCenter: () => {
        const center = (grid - 1) / 2
        const distance = Math.hypot(i - center, j - center)
        const maxDistance = Math.hypot(center, center)
        return distance / maxDistance / delayPerColumn
      },
      productOfIndices: () => (i * j) / (grid * grid * delayPerColumn),
      moduloPattern: () => ((i + j) % 4) / (4 * delayPerColumn),
      trigonometricFunctions() {
        const frequency = 0.5
        return (
          (p.sin(i * frequency) + p.cos(j * frequency)) / (2 * delayPerColumn)
        )
      },
      checkerboardEffect: () => ((i + j) % 2) / (2 * delayPerColumn),
      absoluteDifference: () => Math.abs(i - j) / (grid * delayPerColumn),
      randomOffsets: () => p.random() / delayPerColumn,
      perlinNoise() {
        const noiseScale = 0.1
        return p.noise(i * noiseScale, j * noiseScale) / delayPerColumn
      },
      exponentialDecay: () => Math.exp(-((i + j) / grid)) / delayPerColumn,
      spiralPattern() {
        const center = (grid - 1) / 2
        const angle = Math.atan2(i - center, j - center)
        const radius = Math.hypot(i - center, j - center)
        return (angle + radius) / (p.TWO_PI + grid * delayPerColumn)
      },
      distanceFromEdge() {
        const distance = Math.min(i, j, grid - 1 - i, grid - 1 - j)
        return distance / grid / delayPerColumn
      },
      sumOfSquares: () => (i * i + j * j) / (2 * grid * grid * delayPerColumn),
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
