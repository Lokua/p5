// @ts-check
import chroma from 'chroma'
import ControlPanel, { Range, Toggle } from '../ControlPanel/index.mjs'
import { DistanceAlgorithms } from '../util.mjs' // Ensure this path is correct

/**
 * @param {import("p5")} p
 */
export default function (p) {
  const [w, h] = [500, 500]

  const metadata = {
    name: 'ConcentricShapesVisualization',
    frameRate: 30,
  }

  const controlPanel = new ControlPanel({
    p,
    id: metadata.name,
    controls: {
      layers: new Range({
        name: 'layers',
        value: 10,
        min: 1,
        max: 50,
        step: 1,
      }),
      spacing: new Range({
        name: 'spacing',
        value: 20,
        min: 5,
        max: 100,
        step: 1,
      }),
      minkowskiPValue: new Range({
        name: 'minkowskiPValue',
        value: 1.5,
        min: 0.5,
        max: 4,
        step: 0.01,
      }),
      euclidean: new Toggle({
        name: 'euclidean',
        value: true,
      }),
      manhattan: new Toggle({
        name: 'manhattan',
        value: true,
      }),
      chebyshev: new Toggle({
        name: 'chebyshev',
        value: true,
      }),
      minkowski: new Toggle({
        name: 'minkowski',
        value: true,
      }),
    },
  })

  const algorithmColors = {
    euclidean: chroma('rebeccapurple').alpha(0.5).rgba(),
    manhattan: chroma('teal').alpha(0.5).rgba(),
    chebyshev: chroma('orange').alpha(0.5).rgba(),
    minkowski: chroma('green').alpha(0.5).rgba(),
  }

  const legendX = 10
  const legendY = 10
  const legendSize = 15
  const legendSpacing = 20

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    p.colorMode(p.RGB, 255, 255, 255, 1)

    return {
      canvas,
    }
  }

  function draw() {
    const {
      layers,
      spacing,
      minkowskiPValue,
      euclidean,
      manhattan,
      chebyshev,
      minkowski,
    } = controlPanel.values()

    p.background(255)
    p.noFill()
    p.noStroke()
    p.translate(w / 2, h / 2)

    Object.keys(DistanceAlgorithms).forEach((alg) => {
      if (!algorithmColors[alg]) {
        return
      }

      p.push()
      p.stroke(algorithmColors[alg])
      p.strokeWeight(2)

      for (let i = 1; i <= layers; i++) {
        const size = i * spacing

        switch (alg) {
          case 'euclidean': {
            if (!euclidean) {
              break
            }
            p.circle(0, 0, size * 2)
            break
          }
          case 'manhattan': {
            if (!manhattan) {
              break
            }
            p.push()
            p.rotate(p.PI / 4)
            p.rectMode(p.CENTER)
            p.rect(0, 0, size * 2, size * 2)
            p.pop()
            break
          }
          case 'chebyshev': {
            if (!chebyshev) {
              break
            }
            p.rectMode(p.CENTER)
            p.rect(0, 0, size * 2, size * 2)
            break
          }
          case 'minkowski': {
            if (!minkowski) {
              break
            }
            drawMinkowskiShape(p, size * 2, minkowskiPValue)
            break
          }
          default: {
            break
          }
        }
      }

      p.pop()
    })

    drawLegend()
  }

  /**
   * Draws a Minkowski distance-based shape (superellipse) with given size and p-value.
   * @param {import("p5")} p - p5 instance
   * @param {number} size - Diameter of the shape
   * @param {number} pValue - Minkowski parameter
   */
  function drawMinkowskiShape(p, size, pValue) {
    p.beginShape()

    const numPoints = 100
    const a = size / 2
    const b = size / 2

    for (let i = 0; i < numPoints; i++) {
      const theta = (i / numPoints) * p.TWO_PI
      const x =
        a *
        Math.sign(Math.cos(theta)) *
        Math.pow(Math.abs(Math.cos(theta)), 2 / pValue)
      const y =
        b *
        Math.sign(Math.sin(theta)) *
        Math.pow(Math.abs(Math.sin(theta)), 2 / pValue)

      p.vertex(x, y)
    }

    p.endShape(p.CLOSE)
  }

  function drawLegend() {
    p.resetMatrix()
    p.textAlign(p.LEFT, p.TOP)
    p.textSize(14)
    p.fill(0)
    p.noStroke()

    let yOffset = legendY

    Object.keys(algorithmColors).forEach((alg) => {
      p.fill(algorithmColors[alg])
      p.rect(legendX, yOffset, legendSize, legendSize)
      p.fill(0)
      p.text(
        alg.charAt(0).toUpperCase() + alg.slice(1),
        legendX + legendSize + 5,
        yOffset + 1,
      )
      yOffset += legendSpacing
    })
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
