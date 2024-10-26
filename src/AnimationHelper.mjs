import { beatsToFrames, lerp } from './util.mjs'

export const EasingFunctions = {
  easeIn: (x) => x * x,
  easeOut: (x) => x * (2 - x),
  easeInOut: (x) => (x < 0.5 ? 2 * x * x : -1 + (4 - 2 * x) * x),
  linear: (x) => x,
  easeInQuad: (x) => x * x,
  easeOutQuad: (x) => x * (2 - x),
  easeInOutQuad: (x) => (x < 0.5 ? 2 * x * x : -1 + (4 - 2 * x) * x),
}

export default class AnimationHelper {
  static PLAY_MODE_FORWARD = 'forward'
  static PLAY_MODE_BACKWARD = 'backward'
  static PLAY_MODE_PINGPONG = 'pingpong'
  static TRIGGER_MODE_DEFAULT = 'default'
  static TRIGGER_MODE_ROUND_ROBIN = 'roundRobin'

  constructor(p, frameRate, bpm = 120) {
    this.p = p
    this.frameRate = frameRate
    this.bpm = bpm
  }

  /**
   * Calculates normalized progress based on note duration.
   *
   * @param {number} noteDuration - The duration of the note (e.g., 1 for a quarter note).
   * @returns {number} - Normalized progress between 0 and 1.
   */
  getLoopProgress(noteDuration = 1) {
    const beatDuration = 60 / this.bpm
    const totalFramesForNote = beatDuration * noteDuration * this.frameRate
    const currentFrame = this.p.frameCount % totalFramesForNote
    const progress = currentFrame / totalFramesForNote
    return progress
  }

  /**
   * Calculates normalized progress based on note duration.
   *
   * @param {number} noteDuration - The duration of the note (e.g., 1 for a quarter note).
   * @returns {number} - Normalized progress between 0 and 1.
   */
  getPingPongLoopProgress(duration = 1) {
    const progress = this.getLoopProgress(duration * 2)
    return progress < 0.5 ? progress * 2 : (1 - progress) * 2
  }

  /**
   * Chains multiple animation stages based on internal progress.
   *
   * @param {Array} stages - An array of stages, each a two-member array [duration, optional easing].
   * @returns {number} - The eased progress value for the current stage.
   */
  chainAnimations(stages) {
    const totalDuration = stages.reduce((sum, stage) => sum + stage[0], 0)
    const progress = this.getLoopProgress(totalDuration)

    let accumulatedDuration = 0

    for (const [duration, easingArgument] of stages) {
      const easing = safeGetEasing(easingArgument)

      const stageStart = accumulatedDuration / totalDuration
      const stageEnd = (accumulatedDuration + duration) / totalDuration

      if (progress >= stageStart && progress < stageEnd) {
        const stageProgress = (progress - stageStart) / (stageEnd - stageStart)
        return easing(stageProgress)
      }

      accumulatedDuration += duration
    }

    const lastEasing = safeGetEasing(stages[stages.length - 1][1])
    return lastEasing(1)
  }

  /**
   * Animates a property over time.
   *
   * @param {object} params - Parameters for the animation.
   * @param {number} params.from - The starting value of the property.
   * @param {number} params.to - The ending value of the property.
   * @param {number} [params.duration=1] - The duration of the animation in beats.
   * @param {function} [params.easing=EasingFunctions.linear] - The easing function to use.
   * @param {function} [params.playMode=AnimationHelper.PLAY_MODE_FORWARD] - The easing function to use.
   * @returns {number} - Animated property value.
   */
  animateProperty({
    from,
    to,
    duration = 1,
    easing = EasingFunctions.linear,
    playMode = AnimationHelper.PLAY_MODE_FORWARD,
  }) {
    const getProgressBasedOnPlayMode = (mode) => {
      switch (mode) {
        case AnimationHelper.PLAY_MODE_BACKWARD: {
          return 1 - this.getLoopProgress(duration)
        }
        case AnimationHelper.PLAY_MODE_PINGPONG: {
          return this.getPingPongLoopProgress(duration)
        }
        case AnimationHelper.PLAY_MODE_FORWARD:
        default: {
          return this.getLoopProgress(duration)
        }
      }
    }

    const progress = getProgressBasedOnPlayMode(playMode)
    const easedProgress = safeGetEasing(easing)(progress)

    return from + (to - from) * easedProgress
  }

  /**
   * Triggers an animation based on the provided keyframes and timing parameters.
   *
   * @param {Object} params - The params for the animation.
   * @param {number} params.value - The base value to be animated.
   * @param {number[]} params.keyframes - An array of keyframe values for the animation.
   * @param {number} params.duration - The duration of the animation in beats.
   * @param {number} params.every - The interval in beats at which the animation should be triggered.
   * @param {string} [params.easing=EasingFunctions.linear] - The easing function to be used for the animation.
   * @param {number} [params.delay=0] - The delay before the animation starts, in beats.
   * @param {string} [params.mode=AnimationHelper.TRIGGER_MODE_DEFAULT]
   * @returns {number} - The interpolated value based on the current frame and keyframes.
   */
  triggeredAnimation({
    value,
    keyframes,
    duration,
    every,
    easing = 'linear',
    delay = 0,
    mode = AnimationHelper.TRIGGER_MODE_DEFAULT,
  }) {
    const beatDuration = 60 / this.bpm
    const totalFramesForEvery = every * beatDuration * this.frameRate
    const totalFramesForDuration = duration * beatDuration * this.frameRate
    const totalFramesForDelay = delay * beatDuration * this.frameRate

    const currentFrameInEvery =
      (this.p.frameCount - totalFramesForDelay + totalFramesForEvery) %
      totalFramesForEvery

    if (currentFrameInEvery < totalFramesForDuration) {
      let progress = currentFrameInEvery / totalFramesForDuration
      progress = safeGetEasing(easing)(progress)
      progress = Math.min(progress, 1)

      const totalSegments = keyframes.length + 2
      let segmentIndex, segmentFraction

      if (mode === 'roundRobin') {
        const totalFramesSinceStart = this.p.frameCount - totalFramesForDelay
        const triggerCount = Math.floor(
          totalFramesSinceStart / totalFramesForEvery,
        )
        segmentIndex = triggerCount % (totalSegments - 1)
        segmentFraction = progress
      } else {
        const segmentProgress = progress * (totalSegments - 1)
        segmentIndex = Math.min(Math.floor(segmentProgress), totalSegments - 2)
        segmentFraction = segmentProgress - segmentIndex
      }

      let startValue, endValue

      if (segmentIndex === 0) {
        startValue = 0
        endValue = keyframes[0]
      } else if (segmentIndex <= keyframes.length - 1) {
        startValue = keyframes[segmentIndex - 1]
        endValue = keyframes[segmentIndex]
      } else {
        startValue = keyframes[keyframes.length - 1]
        endValue = 0
      }

      const output =
        value + startValue + (endValue - startValue) * segmentFraction

      return output
    }

    return value
  }

  /**
   * Performs a one-time animation based on the provided keyframes and timing parameters.
   *
   * @param {Object} params - The parameters for the animation.
   * @param {number[]} params.keyframes - An array of keyframe values for the animation.
   * @param {number} params.duration - The duration of the animation in beats.
   * @param {string} [params.easing='linear'] - The easing function to be used for the animation.
   * @returns {number} - The interpolated value based on the current frame and keyframes.
   */
  oneTimeAnimation({ keyframes, duration, easing = 'linear' }) {
    const beatDuration = 60 / this.bpm
    const totalFramesForDuration = duration * beatDuration * this.frameRate

    // Calculate progress from the start of the animation
    const currentFrame = this.p.frameCount
    const progress = Math.min(currentFrame / totalFramesForDuration, 1)
    const easedProgress = safeGetEasing(easing)(progress)

    const totalSegments = keyframes.length - 1
    const segmentProgress = easedProgress * totalSegments
    const segmentIndex = Math.min(
      Math.floor(segmentProgress),
      totalSegments - 1,
    )
    const segmentFraction = segmentProgress - segmentIndex

    const startValue = keyframes[segmentIndex]
    const endValue = keyframes[segmentIndex + 1]

    const output = startValue + (endValue - startValue) * segmentFraction

    return progress < 1 ? output : keyframes[keyframes.length - 1]
  }

  /**
   * Repeats the values of keyframes based on the duration and the current frame count.
   *
   * @param {Object} params - The parameters for the function.
   * @param {Array} params.keyframes - An array of keyframes to cycle through.
   * @param {number} params.duration - The duration of each keyframe segment in beats.
   * @returns {*} The current keyframe based on the current frame in the cycle.
   */
  repeatValues({ keyframes, duration }) {
    const beatDuration = 60 / this.bpm
    const totalFramesForSegment = duration * beatDuration * this.frameRate
    const totalFramesForCycle = totalFramesForSegment * keyframes.length
    const currentFrameInCycle = this.p.frameCount % totalFramesForCycle
    const currentSegmentIndex = Math.floor(
      currentFrameInCycle / totalFramesForSegment,
    )
    return keyframes[currentSegmentIndex]
  }

  /**
   * Returns the total beats elapsed since the sketch started.
   * @returns {number} - Total beats elapsed.
   */
  getTotalBeatsElapsed() {
    const beatDuration = 60 / this.bpm
    const totalTimeInSeconds = this.p.frameCount / this.frameRate
    return totalTimeInSeconds / beatDuration
  }

  /**
   * Animates a property based on provided keyframes and options.
   *
   * @param {object} params - Animation parameters.
   * @param {Array} params.keyframes - Array of values or keyframe objects.
   * @param {number} [params.duration=1] - Default duration for unspecified keyframes (in beats).
   * @param {number} [params.every=null] - Interval at which the animation is triggered (in beats).
   * @param {number} [params.delay=0] - Delay before starting the animation within each 'every' interval (in beats).
   * @param {string} [params.mode='forward'] - Playback mode ('forward', 'backward').
   * @param {boolean} [params.loop=false] - Whether the animation should loop continuously.
   * @param {string|function} [params.easing='linear'] - Default easing function for the animation.
   * @returns {number} - The interpolated value based on the animation progress.
   */
  animate({
    keyframes,
    duration = 1,
    every = null,
    delay = 0,
    mode = 'forward',
    // eslint-disable-next-line no-unused-vars
    loop = false,
    easing = 'linear',
  }) {
    console.log(`[debug] 1 beat = ${this.beatsToFrames(1)} frames`)

    const keyframeMode = keyframes.every((kf) => typeof kf === 'number')
      ? 'number'
      : 'object'

    const processedKeyframes =
      keyframeMode === 'number'
        ? keyframes.map((value) => ({
            value,
            duration: duration / (keyframes.length - 1),
            durationFrames: this.beatsToFrames(
              duration / (keyframes.length - 1),
            ),
            easing,
          }))
        : keyframes.map((kf) => ({
            value: kf.value,
            duration: kf.duration ?? duration,
            durationFrames: this.beatsToFrames(kf.duration ?? duration),
            easing: kf.easing || easing,
          }))

    let totalFrames = 0
    let playbackSequence = []

    const sumDurationFrames = (sum, x) => sum + x.durationFrames

    switch (mode) {
      case 'forward':
      case 'forwards': {
        playbackSequence = processedKeyframes.slice()
        totalFrames = processedKeyframes
          .slice(0, -1)
          .reduce(sumDurationFrames, 0)
        break
      }
      case 'backward':
      case 'backwards': {
        playbackSequence = processedKeyframes.toReversed()
        totalFrames = processedKeyframes
          .slice(0, -1)
          .reduce(sumDurationFrames, 0)
        break
      }
      default: {
        throw new Error(`[AnimationHelper#animate] unknown mode ${mode}`)
      }
    }

    const totalFramesForEvery = this.beatsToFrames(
      every ?? this.framesToBeats(totalFrames),
    )
    if (totalFramesForEvery < totalFrames) {
      throw new Error(
        `[AnimationHelper#animate] The "every" duration (${totalFramesForEvery}) is shorter than the playback sequence duration. Adjust "every" to be at least ${totalFrames} frames.`,
      )
    }

    const totalFramesForDelay = this.beatsToFrames(delay)

    // Calculate what frame we're at within a single animation cycle
    const currentFrameInEvery =
      (this.p.frameCount - totalFramesForDelay) % totalFramesForEvery

    if (this.p.frameCount < totalFramesForDelay) {
      return playbackSequence[0].value
    }

    // If we're past the animation duration in this cycle, show final value
    if (currentFrameInEvery >= totalFrames) {
      return playbackSequence[playbackSequence.length - 1].value
    }

    // Determine which segment we're in using a cleaner reduce approach
    const currentSegmentIndex = playbackSequence
      .slice(0, -1)
      .reduce((segmentIndex, _, i) => {
        const totalDurationToHere = playbackSequence
          .slice(0, i + 1)
          .reduce((sum, kf) => sum + kf.durationFrames, 0)

        return currentFrameInEvery < totalDurationToHere ? i : segmentIndex
      }, 0)

    const currentKeyframe = playbackSequence[currentSegmentIndex]
    const nextKeyframe = playbackSequence[currentSegmentIndex + 1]

    // Calculate progress within the current segment
    const segmentStartFrame = playbackSequence
      .slice(0, currentSegmentIndex)
      .reduce((sum, kf) => sum + kf.durationFrames, 0)

    const frameInSegment = currentFrameInEvery - segmentStartFrame
    const segmentDurationFrames = currentKeyframe.durationFrames
    const segmentProgress = frameInSegment / segmentDurationFrames

    // Interpolate between current and next keyframe values
    return lerp(
      currentKeyframe.value,
      nextKeyframe.value,
      safeGetEasing(currentKeyframe.easing)(segmentProgress),
    )
  }

  beatsToFrames(beats) {
    return beatsToFrames(beats, this.bpm, this.frameRate)
  }

  framesToBeats(frames) {
    return frames / ((this.frameRate / this.bpm) * 60)
  }
}

function safeGetEasing(easing) {
  return typeof easing === 'string'
    ? EasingFunctions[easing]
    : typeof easing === 'function'
      ? easing
      : EasingFunctions.linear
}
