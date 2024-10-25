// @ts-check
import ControlPanel, { Range, Toggle } from '../ControlPanel/index.mjs'
import AnimationHelper from '../AnimationHelper.mjs'
import { DistanceAlgorithms, multiLerp } from '../util.mjs'

/**
 * @param {import("p5")} p
 */
export default function (p) {
  const [w, h] = [500, 500]

  const metadata = {
    name: 'patterns',
    frameRate: 30,
  }

  const animationHelper = new AnimationHelper(p, metadata.frameRate, 134)

  const controlPanel = new ControlPanel({
    id: metadata.name,
    attemptReload: true,
    controls: {
      grid: new Range({
        name: 'grid',
        value: 24,
        min: 1,
        max: 128,
      }),
      radiusMultiplier: new Range({
        name: 'radiusMultiplier',
        value: 0.001,
        min: 0.001,
        max: 1,
        step: 0.001,
      }),
      baseRadius: new Range({
        name: 'baseRadius',
        value: 1,
        min: 1,
        max: 100,
      }),
      phaseOffset: new Range({
        name: 'phaseOffset',
        value: 1,
        min: 1,
        max: 100,
      }),
      multiDirection: new Toggle({
        name: 'multiDirection',
        value: false,
      }),
      perNoteDuration: new Toggle({
        name: 'perNoteDuration',
        value: false,
      }),
    },
    inputHandler() {
      !p.isLooping() && draw()
    },
  })

  // Store the grid points in an array for continuous animation
  let gridPoints = []

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)
    p.colorMode(p.HSB, 100)

    return {
      canvas,
    }
  }

  function draw() {
    const { radiusMultiplier, multiDirection, perNoteDuration } =
      controlPanel.values()
    p.background(255)
    p.stroke(0)

    // Initialize the grid once
    initializeGrid()

    // Redraw the grid with updated positions
    drawGrid({
      radiusMultiplier,
      multiDirection,
      perNoteDuration,
    })
  }

  function initializeGrid() {
    const { grid, baseRadius, phaseOffset } = controlPanel.values()
    const cellSize = w / grid

    gridPoints = []

    for (let y = 0; y <= h; y += cellSize) {
      const row = []

      for (let x = 0; x <= w; x += cellSize) {
        row.push({
          x,
          y,
          originalX: x,
          originalY: y,
          radius: computeRadius(x, y, baseRadius),
          noteDuration: computeNoteDuration(x, y),
          phaseOffset: computePhaseOffset(x, y, phaseOffset),
          direction:
            (Math.floor(x / cellSize) + Math.floor(y / cellSize)) % 2 === 0
              ? 1
              : -1,
        })
      }
      gridPoints.push(row)
    }
  }

  function computeRadius(x, y, baseRadius) {
    const cx = w / 2
    const cy = h / 2

    const distanceFromCenter = multiLerp(
      [
        DistanceAlgorithms.harmonic(x, y, cx, cy),
        DistanceAlgorithms.manhattan(x, y, cx, cy),
        DistanceAlgorithms.polar(x, y, cx, cy),
        DistanceAlgorithms.radialSinusoidal(x, y, cx, cy),
      ],
      animationHelper.getPingPongLoopProgress(64),
    )

    // Use sine or cosine waves to create smooth variations in radius
    // Adjust frequency for smoother patterns
    const wave = Math.sin(distanceFromCenter / 50) * 10
    return wave + baseRadius // Base radius size
  }

  function computeNoteDuration(x, y) {
    // Introduce more rhythmic variation using a combination of sine and position
    const sineWave = Math.abs(Math.sin((x + y) / 100)) // Create smooth rhythmic variations
    const durations = [1, 2, 4]
    return durations[Math.floor(sineWave * durations.length) % durations.length]
  }

  function computePhaseOffset(x, y, phaseOffset) {
    // Use a polar coordinate transformation for symmetry and radial patterns
    const angle = Math.atan2(y - h / 2, x - w / 2)
    const cx = w / 2
    const cy = h / 2
    const distanceFromCenter = multiLerp(
      [
        DistanceAlgorithms.harmonic(x, y, cx, cy),
        DistanceAlgorithms.manhattan(x, y, cx, cy),
        DistanceAlgorithms.polar(x, y, cx, cy),
        DistanceAlgorithms.radialSinusoidal(x, y, cx, cy),
      ],
      animationHelper.getPingPongLoopProgress(64),
    )
    // Combine angle and distance for phase offset
    return angle + (Math.sin(distanceFromCenter / phaseOffset) * p.TWO_PI) / 4
  }

  function drawGrid({ radiusMultiplier, multiDirection, perNoteDuration }) {
    for (let row = 0; row < gridPoints.length - 1; row++) {
      for (let col = 0; col < gridPoints[row].length - 1; col++) {
        const pt = gridPoints[row][col]

        // Get the loop progress based on musical time, using the noteDuration for each point
        const progress = animationHelper.getLoopProgress(
          perNoteDuration ? pt.noteDuration : 64,
        )

        // Apply direction to the angle calculation: clockwise (1) or counterclockwise (-1)
        const angle =
          (multiDirection ? pt.direction : 1) *
          (progress * p.TWO_PI + pt.phaseOffset)

        const animatedX =
          pt.originalX + pt.radius * radiusMultiplier * Math.cos(angle)
        const animatedY =
          pt.originalY + pt.radius * radiusMultiplier * Math.sin(angle)

        // Update the point's position
        pt.x = animatedX
        pt.y = animatedY

        // Draw horizontal and vertical lines connecting the points
        const pt2 = gridPoints[row][col + 1]
        const pt3 = gridPoints[row + 1][col]
        p.line(pt.x, pt.y, pt2.x, pt2.y)
        p.line(pt.x, pt.y, pt3.x, pt3.y)
      }
    }
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
