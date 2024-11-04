// @ts-check
import ControlPanel, { Range } from '../lib/ControlPanel/index.mjs'
import AnimationHelper from '../lib/AnimationHelper.mjs'
import { interpolators } from '../lib/scaling.mjs'

/**
 * @param {import("p5")} p
 */
export default function (p) {
  const metadata = {
    name: 'animationDev',
    frameRate: 24,
  }

  const [w, h] = [500, 500]

  const ah = new AnimationHelper({ p, frameRate: metadata.frameRate, bpm: 134 })

  const controlPanel = new ControlPanel({
    p,
    id: metadata.name,
    controls: {
      amplitude: new Range({
        name: 'amplitude',
        value: 50,
        min: 0,
        max: 250,
      }),
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    p.colorMode(p.HSB, 100)

    return {
      canvas,
    }
  }

  function draw() {
    const { amplitude } = controlPanel.values()
    p.background(255)
    p.noStroke()

    const count = 8
    const diameter = 50
    const spacing = w / (count + 1)
    const y = h / 2

    for (let i = 1; i <= count; i++) {
      const x = spacing * i

      switch (i) {
        case 1: {
          const progress = ah.getLoopProgress(4)
          p.circle(x, y + amplitude * p.sin(progress * p.TWO_PI), diameter)
          break
        }
        case 2: {
          const progress = interpolators.easeIn(ah.getLoopProgress(4))
          p.circle(x, y + amplitude * p.sin(progress * p.TWO_PI), diameter)
          break
        }
        case 3: {
          const progress = interpolators.easeOut(ah.getLoopProgress(4))
          p.circle(x, y + amplitude * p.sin(progress * p.TWO_PI), diameter)
          break
        }
        case 4: {
          const progress = interpolators.easeInOut(ah.getLoopProgress(4))
          p.circle(x, y + amplitude * p.sin(progress * p.TWO_PI), diameter)
          break
        }
        case 5: {
          const progress = ah.chainAnimations([[8], [3]])
          p.circle(x, y + amplitude * p.sin(progress * p.TWO_PI), diameter)
          break
        }
        case 6: {
          // Get normalized progress from 0 to 1 over 16 units of time
          const progress = ah.animateProperty({
            from: 0,
            to: 1,
            duration: 16,
          })

          // Calculate the angle in radians for the sine function
          const angle = progress * p.TWO_PI

          // Define amplitude as less than h / 2 to reduce the range
          const amplitude = (h / 2) * 0.5

          // Calculate the y-position with adjusted amplitude
          const yPosition = h / 2 + amplitude * p.sin(angle)

          // Draw the circle at the calculated position
          p.circle(x, yPosition, diameter)
          break
        }
        case 7: {
          const offsetY = ah.animate({
            keyframes: [-amplitude, amplitude, -amplitude * 2, -amplitude],
            duration: 4,
            every: 12,
            delay: 2,
          })

          p.fill(0, 100, 100)
          p.circle(x, y + offsetY, diameter)
          break
        }
        default: {
          p.fill(0)
          p.circle(x, y, diameter)
          break
        }
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
