import { describe, it } from 'node:test'
import assert from 'node:assert'
import AnimationHelper from './AnimationHelper.mjs'

describe('animate', () => {
  // this way each 1/16 = 1 frame, 4 frames per beat,
  // less likely to deal with precision issues.
  // const [FRAME_RATE, BPM] = [60, 120]
  const [FRAME_RATE, BPM] = [24, 360]

  const assertEqual = (animationValue, ...rest) =>
    assert.equal(Math.round(animationValue), ...rest)

  it('should play forward with number schema', () => {
    const p = { frameCount: 0 }
    const ax = new AnimationHelper(p, FRAME_RATE, BPM, true)

    p.frameCount = ax.beatsToFrames(0.5)

    console.log(p.frameCount)

    assertEqual(
      ax.animate({
        keyframes: [0, 10],
        duration: 1,
      }),
      5,
    )
  })

  it('should play forward with object schema', () => {
    const p = { frameCount: 0 }
    const ax = new AnimationHelper(p, FRAME_RATE, BPM, true)

    p.frameCount = ax.beatsToFrames(0.5)

    assertEqual(
      ax.animate({
        keyframes: [{ value: 0 }, { value: 10, duration: 9 }],
        duration: 1,
      }),
      5,
      'Should ignore last keyframe duration',
    )
  })

  it('should play forward and respect the every duration', () => {
    const p = { frameCount: 0 }
    const ax = new AnimationHelper(p, FRAME_RATE, BPM, true)

    const params = {
      keyframes: [0, 10],
      duration: 1,
      every: 3,
    }

    p.frameCount = ax.beatsToFrames(3)
    assertEqual(ax.animate(params), 0)

    p.frameCount = ax.beatsToFrames(3.5)
    assertEqual(ax.animate(params), 5)

    p.frameCount = ax.beatsToFrames(4)
    assertEqual(ax.animate(params), 10)
  })

  it('should divide duration equally among segments', () => {
    const p = { frameCount: 0 }
    const ax = new AnimationHelper(p, FRAME_RATE, BPM, true)

    p.frameCount = ax.beatsToFrames(0.5)

    assertEqual(
      ax.animate({
        keyframes: [1, 2, 3],
        duration: 1,
      }),
      2,
    )
  })

  it('should result in last keyframe value when beyond duration', () => {
    const p = { frameCount: 0 }
    const ax = new AnimationHelper(p, FRAME_RATE, BPM, true)

    ;[1, 1.25, 1.5, 1.75, 3, 3.25, 3.5, 3.75].forEach((beats) => {
      p.frameCount = ax.beatsToFrames(beats)

      assertEqual(
        ax.animate({
          keyframes: [1, 2, 3],
          duration: 1,
          every: 2,
        }),
        3,
      )
    })
  })
})
