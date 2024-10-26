import test from 'node:test'
import assert from 'node:assert'
import AnimationHelper from './AnimationHelper.mjs'

test.skip('animate2', () => {
  const p = { frameCount: 0 }
  const ax = new AnimationHelper(p, 60, 120)
  p.frameCount = ax.beatsToFrames(0.5)
  assert.deepStrictEqual(
    ax.animate2({
      keyframes: [0, 10],
      duration: 1,
    }),
    {
      totalFrames: ax.beatsToFrames(1),
      playbackSequence: [
        {
          value: 0,
          duration: 1,
          durationFrames: 30,
        },
        {
          value: 10,
          duration: 1,
          durationFrames: 30,
        },
      ],
    },
  )
})

test('animate (forward)', () => {
  const p = { frameCount: 0 }
  const ax = new AnimationHelper(p, 60, 120)

  p.frameCount = ax.beatsToFrames(0.5)
  assert.deepEqual(
    ax.animate({
      keyframes: [0, 10],
      duration: 1,
    }),
    5,
  )
  assert.deepEqual(
    ax.animate({
      keyframes: [{ value: 0 }, { value: 10, duration: 9 }],
      duration: 1,
    }),
    5,
    'Should ignore last keyframe duration',
  )
})
