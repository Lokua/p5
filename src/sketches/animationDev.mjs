// @ts-check
import ControlPanel, { Range } from '../ControlPanel/index.mjs'
import AnimationHelper, { EasingFunctions } from '../AnimationHelper.mjs'

/**
 * @param {import("p5")} p
 */
export default function (p) {
  const metadata = {
    name: 'template',
    frameRate: 24,
  }

  const [w, h] = [500, 500]

  const animationHelper = new AnimationHelper(p, metadata.frameRate, 134)

  const controlPanel = new ControlPanel({
    id: metadata.name,
    attemptReload: true,
    controls: {
      a: new Range({
        name: 'a',
        value: 50,
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

    p.colorMode(p.HSB, 100)

    return {
      canvas,
    }
  }

  function draw() {
    p.background(255)
    p.noStroke()

    const count = 8
    const diameter = 50
    const spacing = w / (count + 1)
    const y = h / 2

    const amplitude = animationHelper.animateProperty({
      from: 1,
      to: h / 4,
      duration: 16,
      playMode: AnimationHelper.PLAY_MODE_PINGPONG,
    })

    for (let i = 1; i <= count; i++) {
      const x = spacing * i

      switch (i) {
        case 1: {
          const progress = animationHelper.getLoopProgress(4)
          p.circle(x, y + amplitude * p.sin(progress * p.TWO_PI), diameter)
          break
        }
        case 2: {
          const progress = EasingFunctions.easeIn(
            animationHelper.getLoopProgress(4),
          )
          p.circle(x, y + amplitude * p.sin(progress * p.TWO_PI), diameter)
          break
        }
        case 3: {
          const progress = EasingFunctions.easeOut(
            animationHelper.getLoopProgress(4),
          )
          p.circle(x, y + amplitude * p.sin(progress * p.TWO_PI), diameter)
          break
        }
        case 4: {
          const progress = EasingFunctions.easeInOut(
            animationHelper.getLoopProgress(4),
          )
          p.circle(x, y + amplitude * p.sin(progress * p.TWO_PI), diameter)
          break
        }
        case 5: {
          const progress = animationHelper.chainAnimations([[8], [3]])
          p.circle(x, y + amplitude * p.sin(progress * p.TWO_PI), diameter)
          break
        }
        case 6: {
          // Get normalized progress from 0 to 1 over 16 units of time
          const progress = animationHelper.animateProperty({
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
          const offsetY = animationHelper.triggeredAnimation({
            value: 0,
            keyframes: [-amplitude, amplitude, -amplitude * 2],
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
