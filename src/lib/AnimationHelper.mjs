import { beatsToFrames, lerp, InvalidArgumentsException } from '../util.mjs'
import { interpolators } from './scaling.mjs'

export default class AnimationHelper {
  static interpolators = interpolators

  constructor({
    p,
    frameRate,
    bpm = 120,
    frameSystemIsZeroIndexed = false,
    latencyOffset = 0,
    disabled = false,
  }) {
    if (!p || !frameRate || !bpm) {
      const missingArgs = []
      if (!p) {
        missingArgs.push('p')
      }
      if (!frameRate) {
        missingArgs.push('frameRate')
      }
      if (!bpm) {
        missingArgs.push('bpm')
      }
      throw new InvalidArgumentsException(
        `Invalid arguments provided: ${missingArgs.join(', ')}`,
      )
    }

    this.p = p
    this.frameRate = frameRate
    this.bpm = bpm
    this.frameSystemIsZeroIndexed = frameSystemIsZeroIndexed
    this.latencyOffset = latencyOffset
    this.disabled = disabled
  }

  getFrameCount() {
    // p5 frame system is effectively 1-indexed
    const frameCount = this.frameSystemIsZeroIndexed
      ? this.p.frameCount
      : this.p.frameCount - 1

    // Stall at 0 until latencyOffset is met
    if (frameCount < Math.abs(this.latencyOffset)) {
      return 0
    }

    return frameCount
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
    const currentFrame = this.getFrameCount() % totalFramesForNote
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
      const easing = this.#safeGetEasing(easingArgument)

      const stageStart = accumulatedDuration / totalDuration
      const stageEnd = (accumulatedDuration + duration) / totalDuration

      if (progress >= stageStart && progress < stageEnd) {
        const stageProgress = (progress - stageStart) / (stageEnd - stageStart)
        return easing(stageProgress)
      }

      accumulatedDuration += duration
    }

    const lastEasing = this.#safeGetEasing(stages[stages.length - 1][1])
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
   * @param {function} [params.playMode='forward'] - The easing function to use.
   * @returns {number} - Animated property value.
   */
  animateProperty({
    from,
    to,
    duration = 1,
    easing = interpolators.linear,
    playMode = 'forward',
  }) {
    const getProgressBasedOnPlayMode = (mode) => {
      switch (mode) {
        case 'backward': {
          return 1 - this.getLoopProgress(duration)
        }
        case 'pingpong': {
          return this.getPingPongLoopProgress(duration)
        }
        case 'forward':
        default: {
          return this.getLoopProgress(duration)
        }
      }
    }

    const progress = getProgressBasedOnPlayMode(playMode)
    const easedProgress = this.#safeGetEasing(easing)(progress)

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
    console.warn(
      '[AnimationHelper] #triggeredAnimation is deprecated. Use #animate instead.',
    )
    const beatDuration = 60 / this.bpm
    const totalFramesForEvery = every * beatDuration * this.frameRate
    const totalFramesForDuration = duration * beatDuration * this.frameRate
    const totalFramesForDelay = delay * beatDuration * this.frameRate

    const currentFrameInEvery =
      (this.getFrameCount() - totalFramesForDelay + totalFramesForEvery) %
      totalFramesForEvery

    if (currentFrameInEvery < totalFramesForDuration) {
      let progress = currentFrameInEvery / totalFramesForDuration
      progress = this.#safeGetEasing(easing)(progress)
      progress = Math.min(progress, 1)

      const totalSegments = keyframes.length + 2
      let segmentIndex, segmentFraction

      if (mode === 'roundRobin') {
        const totalFramesSinceStart = this.getFrameCount() - totalFramesForDelay
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
    const currentFrame = this.getFrameCount()
    const progress = Math.min(currentFrame / totalFramesForDuration, 1)
    const easedProgress = this.#safeGetEasing(easing)(progress)

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

  repeat(keyframes, duration) {
    return this.repeatValues({
      keyframes,
      duration,
    })
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
    const currentFrameInCycle = this.getFrameCount() % totalFramesForCycle
    const currentSegmentIndex = Math.floor(
      currentFrameInCycle / totalFramesForSegment,
    )
    return keyframes[currentSegmentIndex]
  }

  /**
   * Returns a function that executes 'fn' every 'every' beats and returns its result.
   * The result is cached and returned on subsequent calls until the next trigger.
   *
   * @param {function} fn - The function to execute every 'every' beats.
   * @param {number} every - The interval in beats at which to execute the function.
   * @returns {function} - A function that when called, returns the result of 'fn' executed at the correct interval.
   */
  triggerEvery(fn, every) {
    if (this.disabled) {
      return fn
    }

    let lastTriggerCount = -1
    let lastValue = undefined

    return () => {
      const totalBeatsElapsed = this.getTotalBeatsElapsed()
      const timesTriggered = Math.floor(totalBeatsElapsed / every)

      if (timesTriggered !== lastTriggerCount) {
        lastTriggerCount = timesTriggered
        lastValue = fn()
      }

      return lastValue
    }
  }

  // make call sites verbose since we only use keyframes and duration 99% of time
  anim8(keyframes, duration, every, delay, easing) {
    return this.animate({
      keyframes,
      duration,
      every,
      delay,
      easing,
    })
  }

  /**
   * Animates a property based on provided keyframes and options.
   *
   * @param {object} params - Animation parameters.
   * @param {Array} params.keyframes - Array of values or keyframe objects.
   * @param {number} [params.duration=1] - Default duration for unspecified keyframes (in beats).
   * @param {number} [params.every=null] - Interval at which the animation is triggered (in beats).
   * @param {number} [params.delay=0] - Delay before starting the animation within each 'every' interval (in beats).
   * @param {boolean} [params.loop=false] - Whether the animation should loop continuously.
   * @param {string|function} [params.easing='linear'] - Default easing function for the animation.
   * @returns {number} - The interpolated value based on the animation progress.
   */
  animate({
    keyframes,
    duration = 1,
    every = duration,
    delay = 0,
    easing = 'linear',
    debugLabel = '',
  }) {
    if (this.disabled) {
      return keyframes[0].value ?? keyframes[0]
    }

    if (debugLabel) {
      console.group(debugLabel)
      console.log('[debug] FRAME COUNT', this.getFrameCount())
      console.log(`[debug] 1 beat = ${this.beatsToFrames(1)} frames`)
    }

    const processedKeyframes = keyframes.every((kf) => typeof kf === 'number')
      ? keyframes.map((value) => ({
          value,
          duration: duration / (keyframes.length - 1),
          durationFrames: this.beatsToFrames(duration / (keyframes.length - 1)),
          easing,
        }))
      : keyframes.map((kf) => ({
          value: kf.value,
          duration: kf.duration ?? duration,
          durationFrames: this.beatsToFrames(kf.duration ?? duration),
          easing: kf.easing || easing,
        }))

    const sumDurationFrames = (sum, x) => sum + x.durationFrames

    const playbackSequence = processedKeyframes.slice()
    const totalFrames = processedKeyframes
      .slice(0, -1)
      .reduce(sumDurationFrames, 0)

    const totalFramesForEvery = this.beatsToFrames(
      every ?? this.framesToBeats(totalFrames),
    )
    if (totalFramesForEvery < totalFrames) {
      throw new Error(
        `[AnimationHelper#animate] The "every" duration (${totalFramesForEvery}) is shorter than the playback sequence duration. Adjust "every" to be at least ${totalFrames} frames.`,
      )
    }

    const totalFramesForDelay = this.beatsToFrames(delay)

    const currentFrameInEvery =
      (this.getFrameCount() - totalFramesForDelay) % totalFramesForEvery

    if (this.getFrameCount() < totalFramesForDelay) {
      return playbackSequence[0].value
    }
    if (currentFrameInEvery >= totalFrames) {
      return playbackSequence[playbackSequence.length - 1].value
    }

    let currentSegmentIndex = 0
    for (let i = 0; i < playbackSequence.length; i++) {
      const totalDurationToHere = playbackSequence
        .slice(0, i + 1)
        .reduce(sumDurationFrames, 0)

      if (currentFrameInEvery < totalDurationToHere) {
        currentSegmentIndex = i
        break
      }
    }

    const currentKeyframe = playbackSequence[currentSegmentIndex]
    const nextKeyframe = playbackSequence[currentSegmentIndex + 1]

    // Calculate progress within the current segment
    const segmentStartFrame = playbackSequence
      .slice(0, currentSegmentIndex)
      .reduce(sumDurationFrames, 0)

    const frameInSegment = currentFrameInEvery - segmentStartFrame
    const segmentProgress = frameInSegment / currentKeyframe.durationFrames

    // Interpolate between current and next keyframe values
    const value = lerp(
      currentKeyframe.value,
      nextKeyframe.value,
      this.#safeGetEasing(currentKeyframe.easing)(segmentProgress),
    )

    if (debugLabel) {
      console.log('[debug] currentKeyframe:', currentKeyframe)
      console.log('[debug] currentKeyframe.value:', currentKeyframe.value)
      console.log('[debug] nextKeyframe.value:', nextKeyframe.value)
      console.log('[debug] segmentStartFrame:', segmentStartFrame)
      console.log('[debug] frameInSegment:', frameInSegment)
      console.log('[debug] currentFrameInEvery:', currentFrameInEvery)
      console.log('[debug] currentSegmentIndex:', currentSegmentIndex)
      console.log('[debug] segmentProgress:', segmentProgress)
      console.log('[debug] value:', value)
      console.groupEnd(debugLabel)
    }

    return value
  }

  // NOTE: untested
  /**
   * Accumulates a value by incrementing it by 'step' every 'every' beats.
   * @param {Object} params - Parameters for accumulation.
   * @param {number} params.step - The amount to increment the value each time.
   * @param {number} params.every - The interval in beats at which to increment the value.
   * @returns {number} - The accumulated value.
   */
  accumulateValue(step, every) {
    const totalBeatsElapsed = this.getTotalBeatsElapsed()
    const numberOfIncrements = Math.floor(totalBeatsElapsed / every)
    return step * numberOfIncrements
  }

  /**
   * Returns the total beats elapsed since the sketch started.
   * @returns {number} - Total beats elapsed.
   */
  getTotalBeatsElapsed() {
    const beatDuration = 60 / this.bpm
    const totalTimeInSeconds = this.getFrameCount() / this.frameRate
    return totalTimeInSeconds / beatDuration
  }

  beatsToFrames(beats) {
    return beatsToFrames(beats, this.bpm, this.frameRate)
  }

  framesToBeats(frames) {
    return frames / ((this.frameRate / this.bpm) * 60)
  }

  #safeGetEasing(easing) {
    return typeof easing === 'string'
      ? interpolators[easing]
      : typeof easing === 'function'
        ? easing
        : interpolators.linear
  }
}
