// @ts-check
import chroma from 'chroma-js'
import ControlPanel, { Checkbox, Range } from '../lib/ControlPanel/index.mjs'
import AnimationHelper from '../lib/AnimationHelper.mjs'
import * as DistanceAlgorithms from '../lib/DistanceAlgorithms.mjs'
import { multiLerp } from '../util.mjs'

/**
 * @param {import("p5")} p
 */
export default function (p) {
  const [w, h] = [500, 500]

  const metadata = {
    name: 'patterns2',
    frameRate: 30,
  }

  const ah = new AnimationHelper({ p, frameRate: metadata.frameRate, bpm: 134 })

  const colorScale = chroma
    .scale(['#0000FF', '#00BFFF', '#00FFFF', 'black'])
    .mode('lch')
  const colorScale2 = chroma
    .scale(['red', 'white', 'pink', 'black'])
    .mode('lch')

  const controlPanel = new ControlPanel({
    p,
    id: metadata.name,
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
      multiDirection: new Checkbox({
        name: 'multiDirection',
        value: false,
      }),
      perNoteDuration: new Checkbox({
        name: 'perNoteDuration',
        value: false,
      }),
    },
  })

  // Store the grid points in an array for continuous animation
  let gridPoints = []

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    p.colorMode(p.RGB, 255, 255, 255, 1)
    p.strokeWeight(1.5)

    return {
      canvas,
    }
  }

  function draw() {
    const { radiusMultiplier, multiDirection, perNoteDuration } =
      controlPanel.values()

    setRadialGradientBackground('#001a66', '#000033')

    // Initialize the grid once
    initializeGrid()

    // Redraw the grid with updated positions
    drawGrid({
      radiusMultiplier,
      multiDirection,
      perNoteDuration,
    })
  }

  function setRadialGradientBackground(c1, c2) {
    p.noFill()

    const radius = Math.sqrt(w * w + h * h) / 2

    for (let r = 0; r <= radius; r++) {
      const t = r / radius
      p.stroke(chroma.mix(c1, c2, t, 'rgb').alpha(1).rgba())
      p.ellipse(w / 2, h / 2, r * 2, r * 2)
    }
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
          noiseOffsetX: x * 0.05,
          noiseOffsetY: y * 0.05,
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
        // DistanceAlgorithms.euclidean(x, y, cx, cy),
        DistanceAlgorithms.manhattan(x, y, cx, cy),
        // DistanceAlgorithms.polar(x, y, cx, cy),
        DistanceAlgorithms.radialSinusoidal(x, y, cx, cy),
      ],
      ah.getPingPongLoopProgress(12),
    )

    // Use sine or cosine waves to create smooth variations in radius
    // Adjust frequency for smoother patterns
    const frequency = 100
    const peaks = 10
    const wave = Math.sin(distanceFromCenter / frequency) * peaks
    return wave + baseRadius
  }

  function computeNoteDuration(x, y) {
    // Introduce more rhythmic variation using a combination of sine and position
    const sineWave = Math.abs(Math.sin((x + y) / 100)) // Create smooth rhythmic variations
    const durations = [0.25, 0.5, 1, 2, 4, 6, 8, 16]
    return durations[Math.floor(sineWave * durations.length) % durations.length]
  }

  // dictates the overall "pattern"
  function computePhaseOffset(x, y, phaseOffset) {
    // Use a polar coordinate transformation for symmetry and radial patterns
    const angle = Math.atan2(y - h / 2, x - w / 2)
    const cx = w / 2
    const cy = h / 2
    const distanceFromCenter = multiLerp(
      [
        DistanceAlgorithms.manhattan(x, y, cx, cy),
        DistanceAlgorithms.harmonic(x, y, cx, cy),
        DistanceAlgorithms.radialSinusoidal(x, y, cx, cy),
      ],
      ah.getPingPongLoopProgress(8),
    )
    // Combine angle and distance for phase offset
    return angle + (Math.sin(distanceFromCenter / phaseOffset) * p.TWO_PI) / 4
  }

  function drawGrid({ radiusMultiplier, multiDirection, perNoteDuration }) {
    const cx = w / 2
    const cy = h / 2
    const maxDistance = Math.hypot(cx, cy)

    for (let row = 0; row < gridPoints.length - 1; row++) {
      for (let col = 0; col < gridPoints[row].length - 1; col++) {
        const pt = gridPoints[row][col]

        // Get the loop progress based on musical time, using the noteDuration for each point
        const progress = ah.getLoopProgress(
          perNoteDuration ? pt.noteDuration : 32,
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

        // Compute a value t between 0 and 1 based on distance from center
        const distanceFromCenter = Math.hypot(pt.x - cx, pt.y - cy)
        const t = distanceFromCenter / maxDistance
        p.stroke(
          p.lerpColor(
            p.color(colorScale(t).rgba()),
            p.color(colorScale2(t).rgba()),
            t,
          ),
        )

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
