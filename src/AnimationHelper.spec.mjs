import { describe, it } from 'node:test'
import assert from 'node:assert'
import AnimationHelper from './AnimationHelper.mjs'

describe('animate', () => {
  describe('(forward)', () => {
    it('should play forward with number schema', () => {
      const p = { frameCount: 0 }
      const ax = new AnimationHelper(p, 60, 120)

      p.frameCount = ax.beatsToFrames(0.5)

      assert.equal(
        ax.animate({
          keyframes: [0, 10],
          duration: 1,
        }),
        5,
      )
    })

    it('should play forward with object schema', () => {
      const p = { frameCount: 0 }
      const ax = new AnimationHelper(p, 60, 120)

      p.frameCount = ax.beatsToFrames(0.5)

      assert.equal(
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
      const ax = new AnimationHelper(p, 60, 120)

      const params = {
        keyframes: [0, 10],
        duration: 1,
        every: 3,
      }

      p.frameCount = ax.beatsToFrames(3)
      assert.equal(ax.animate(params), 0)

      p.frameCount = ax.beatsToFrames(3.5)
      assert.equal(ax.animate(params), 5)

      p.frameCount = ax.beatsToFrames(4)
      assert.equal(ax.animate(params), 10)
    })

    it('should divide duration equally among segments', () => {
      const p = { frameCount: 0 }
      const ax = new AnimationHelper(p, 60, 120)

      p.frameCount = ax.beatsToFrames(0.5)

      assert.equal(
        ax.animate({
          keyframes: [1, 2, 3],
          duration: 1,
        }),
        2,
      )
    })
  })

  describe('(backward)', () => {
    it('should play backward with number schema', () => {
      const p = { frameCount: 0 }
      const ax = new AnimationHelper(p, 60, 120)

      p.frameCount = ax.beatsToFrames(0.5)

      assert.equal(
        ax.animate({
          keyframes: [0, 10],
          duration: 1,
          mode: 'backward',
        }),
        5,
      )
    })

    it('should play backward with object schema', () => {
      const p = { frameCount: 0 }
      const ax = new AnimationHelper(p, 60, 120)

      p.frameCount = ax.beatsToFrames(0.5)

      assert.equal(
        ax.animate({
          keyframes: [
            { value: 0, duration: 9 },
            { value: 10, duration: 1 },
          ],
          mode: 'backward',
        }),
        5,
        // "last" being first, since it will be reversed
        'Should ignore last keyframe duration',
      )
    })

    it('should play forward and respect the every duration', () => {
      const p = { frameCount: 0 }
      const ax = new AnimationHelper(p, 60, 120)

      const params = {
        keyframes: [0, 10],
        duration: 1,
        every: 3,
        mode: 'backward',
      }

      p.frameCount = ax.beatsToFrames(3)
      assert.equal(ax.animate(params), 10)

      p.frameCount = ax.beatsToFrames(3.5)
      assert.equal(ax.animate(params), 5)

      p.frameCount = ax.beatsToFrames(4)
      assert.equal(ax.animate(params), 0)
    })

    it('should divide duration equally among segments', () => {
      const p = { frameCount: 0 }
      const ax = new AnimationHelper(p, 60, 120)

      p.frameCount = ax.beatsToFrames(0.5)

      assert.equal(
        ax.animate({
          keyframes: [1, 2, 3],
          duration: 1,
          mode: 'backward',
        }),
        2,
      )
    })
  })
})
