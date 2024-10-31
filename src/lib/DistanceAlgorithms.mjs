// Circular Symmetry
export const euclidean = (x, y, centerX, centerY) =>
  Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2))

// Diamond Symmetry
export const manhattan = (x, y, centerX, centerY) =>
  Math.abs(x - centerX) + Math.abs(y - centerY)

// Square Symmetry
export const chebyshev = (x, y, centerX, centerY) =>
  Math.max(Math.abs(x - centerX), Math.abs(y - centerY))

// (Blend of Euclidean and Manhattan)
export const minkowski = (x, y, centerX, centerY, p = 2) =>
  Math.pow(
    Math.pow(Math.abs(x - centerX), p) + Math.pow(Math.abs(y - centerY), p),
    1 / p,
  )

export function radialSinusoidal(x, y, centerX, centerY) {
  const distance = Math.sqrt(
    Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2),
  )
  // Adjust scale as needed
  return Math.abs(Math.sin(distance / 50)) * 100
}

// Polar Distance (Symmetric radial patterns)
export const polar = (x, y, centerX, centerY) =>
  Math.atan2(y - centerY, x - centerX)

export function spiral(x, y, centerX, centerY) {
  const distance = Math.sqrt(
    Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2),
  )
  const angle = Math.atan2(y - centerY, x - centerX)
  return distance + angle * 100 // Creates spiral effect
}

export function harmonic(x, y, centerX, centerY) {
  const distance = Math.sqrt(
    Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2),
  )
  return Math.sin(distance / 50) * 50 + Math.cos(distance / 75) * 30
}
