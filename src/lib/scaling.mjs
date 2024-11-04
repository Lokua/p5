export const interpolators = {
  // 1. Linear
  linear: (t) => t,

  // 2. Polynomial (Ease In, Out, In-Out)
  easeIn: (t) => t * t,
  easeOut: (t) => t * (2 - t),
  easeInOut: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

  // 3. Cubic (Higher Biases in Polynomial)
  cubicEaseIn: (t) => t * t * t,
  cubicEaseOut: (t) => --t * t * t + 1,
  cubicEaseInOut: (t) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

  // 4. Exponential (More Intense Easing)
  exponential: (
    t,
    // Suggested range [1.5, 5]
    // 1 = linear
    exponent = 2,
  ) => Math.pow(t, exponent),

  // 5. Trigonometric (Sine Ease)
  sineEaseIn: (t) => 1 - Math.cos((t * Math.PI) / 2),
  sineEaseOut: (t) => Math.sin((t * Math.PI) / 2),
  sineEaseInOut: (t) => 0.5 * (1 - Math.cos(Math.PI * t)),

  // 6. Sigmoid (Logistic Curve)
  sigmoid: (
    t,
    // Suggested range [1, 10]
    // 1-5 Smooth
    // 5-15 = Balanced curves, noticable transition but not overly sharp
    // 15-20 = Very step curves, almost like a step function
    steepness = 10,
  ) => 1 / (1 + Math.exp(-steepness * (t - 0.5))),

  // 7. Logarithmic
  logarithmic: (t) => Math.log(1 + t * 9) / Math.log(10),

  // 8. Special Effects (Bounce, Elastic)
  bounce: (t) => {
    const n1 = 7.5625
    const d1 = 2.75
    if (t < 1 / d1) {
      return n1 * t * t
    }
    if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75
    }
    if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375
    }
    return n1 * (t -= 2.625 / d1) * t + 0.984375
  },
}

export function generateRange(min, max, steps, interpolation, ...args) {
  const interpolator =
    typeof interpolation === 'function'
      ? interpolation
      : interpolators[interpolation]

  if (!interpolator) {
    throw new Error(`Interpolation ${interpolation} not found`)
  }

  return Array.from({ length: steps }, (_, i) => {
    const t = i / (steps - 1)
    const interpolatedValue = interpolator(t, ...args)
    return min + interpolatedValue * (max - min)
  })
}
