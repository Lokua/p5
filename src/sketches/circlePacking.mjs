// https://thecodingtrain.com/challenges/50-animated-circle-packing
import chroma from 'chroma-js'
import ControlPanel, { Button, Range } from '../lib/ControlPanel/index.mjs'

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const metadata = {
    name: 'circlePacking',
    frameRate: 30,
    pixelDensity: 6,
  }

  const [w, h] = [500, 500]
  const [cx, cy] = [w / 2, h / 2]

  const colors = chroma.scale(['red', 'blue', 'orange', 'yellow'])

  const controlPanel = new ControlPanel({
    p,
    id: metadata.name,
    autoRedraw: false,
    controls: {
      count: new Range({
        name: 'count',
        value: 100,
        min: 1,
        max: 10000,
      }),
      minRadius: new Range({
        name: 'minRadius',
        value: 5,
        min: 3,
        max: 100,
      }),
      maxRadius: new Range({
        name: 'maxRadius',
        value: 40,
        min: 3,
        max: 100,
      }),
      splash: new Button({
        name: 'splash',
        shortcut: 'q',
        handler() {
          p.draw()
        },
      }),
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    p.colorMode(p.RGB, 255, 255, 255, 1)
    p.noLoop()

    return {
      canvas,
    }
  }

  function draw() {
    // naiveAlgorith()
    // naiveAlgorith2()
    algorithm3()
  }

  function algorithm3() {
    const { minRadius, maxRadius } = controlPanel.values()
    p.background(255)
    p.noStroke()

    const prevs = []

    p.$.pushPop(() => {
      p.translate(0, cy)
      for (let i = 0; i < 10; i++) {
        const prev = prevs[prevs.length - 1] || { x: 0, y: 0, radius: 0 }
        const radius = p.random(minRadius, maxRadius)
        const x = prev.x + prev.radius + radius
        const y = 0
        p.fill(colors(p.random()).alpha(0.6).rgba())
        p.circle(x, y, radius * 2)
        prevs.push({ x, y, radius })
      }
    })
  }

  // Minor improvement tracking quadrants?
  // eslint-disable-next-line no-unused-vars
  function naiveAlgorith2() {
    console.time('circlePacking')
    const { count, minRadius, maxRadius } = controlPanel.values()
    p.background(255)
    p.noStroke()

    const prevs = []
    const quadrantCounts = [0, 0, 0, 0]
    const quadrantRanges = [
      [
        [0, cx],
        [0, cy],
      ],
      [
        [cx, w],
        [0, cy],
      ],
      [
        [0, cx],
        [cy, h],
      ],
      [
        [cx, w],
        [cy, h],
      ],
    ]
    let failedAttempts = 0

    for (let i = 0; i < count; i++) {
      let maxIerations = 10_000_000
      let next
      let thisMaxRadius = maxRadius
      while (!next) {
        const mostSparseQuandrant = quadrantCounts.indexOf(
          Math.min(...quadrantCounts),
        )
        const [xRange, yRange] = quadrantRanges[mostSparseQuandrant]
        next = {
          position: p.createVector(p.random(...xRange), p.random(...yRange)),
          radius: p.random(minRadius, thisMaxRadius),
        }
        if (
          prevs.every((prev) => {
            const combinedRadii = prev.radius + next.radius
            const distance = p5.Vector.dist(prev.position, next.position)
            return distance >= combinedRadii
          })
        ) {
          p.fill(colors(p.random()).alpha(0.6).rgba())
          const { x, y } = next.position
          p.circle(x, y, next.radius)
          prevs.push(next)
          if (x < cx && y < cy) {
            quadrantCounts[0]++
          } else if (x > cx && y < cy) {
            quadrantCounts[1]++
          } else if (x < cx && y > cy) {
            quadrantCounts[2]++
          } else {
            quadrantCounts[3]++
          }
        } else {
          next = null
          thisMaxRadius = Math.max(minRadius, thisMaxRadius - 1)
          failedAttempts++
        }
        maxIerations--
        if (maxIerations < 0) {
          console.log({
            failedAttempts,
            prevs,
          })
          console.timeEnd('circlePacking')
          throw new Error('maxIerations reached')
        }
      }
    }

    console.log({
      failedAttempts,
      prevs,
    })
    console.timeEnd('circlePacking')
  }

  // This is awful. Can only draw maybe 60 circles before it fails.
  // Tons of wasted attempts; around 36 million at circle 60!
  // eslint-disable-next-line no-unused-vars
  function naiveAlgorith() {
    console.time('circlePacking')
    const { count, minRadius, maxRadius } = controlPanel.values()
    p.background(255)
    p.noStroke()

    const prevs = []
    let failedAttempts = 0

    for (let i = 0; i < count; i++) {
      let maxIerations = 10_000_000
      let next
      let thisMaxRadius = maxRadius
      while (!next) {
        next = {
          position: p.createVector(p.random(0, w), p.random(0, h)),
          radius: p.random(minRadius, thisMaxRadius),
        }
        if (
          prevs.every((prev) => {
            const combinedRadii = prev.radius + next.radius
            const distance = p5.Vector.dist(prev.position, next.position)
            return distance >= combinedRadii
          })
        ) {
          p.fill(colors(p.random()).alpha(0.6).rgba())
          p.circle(next.position.x, next.position.y, next.radius)
          prevs.push(next)
        } else {
          next = null
          thisMaxRadius = Math.max(minRadius, thisMaxRadius - 1)
          failedAttempts++
        }
        maxIerations--
        if (maxIerations < 0) {
          console.log({
            failedAttempts,
            prevs,
          })
          console.timeEnd('circlePacking')
          throw new Error('maxIerations reached')
        }
      }
    }

    console.log({
      failedAttempts,
      prevs,
    })
    console.timeEnd('circlePacking')
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
