// Circular Symmetry
export const euclidean = (x1, y1, x2, y2) => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

// Diamond Symmetry
export const manhattan = (x1, y1, x2, y2) => {
  return Math.abs(x2 - x1) + Math.abs(y2 - y1)
}

// Square Symmetry
export const chebyshev = (x1, y1, x2, y2) => {
  return Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1))
}

// (Blend of Euclidean and Manhattan)
export const minkowski = (x1, y1, x2, y2, p = 2) => {
  return Math.pow(
    Math.pow(Math.abs(x2 - x1), p) + Math.pow(Math.abs(y2 - y1), p),
    1 / p,
  )
}

export const radialSinusoidal = (x1, y1, x2, y2) => {
  const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  return Math.abs(Math.sin(distance / 50)) * 100
}

// Returns angle between two points in radians
export const polar = (x1, y1, x2, y2) => {
  return Math.atan2(y2 - y1, x2 - x1)
}

export const spiral = (x1, y1, x2, y2) => {
  const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  const angle = Math.atan2(y2 - y1, x2 - x1)
  return distance + angle * 100
}

export const harmonic = (x1, y1, x2, y2) => {
  const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  return Math.sin(distance / 50) * 50 + Math.cos(distance / 75) * 30
}

// Wave-like patterns that emanate from points
export const concentricWaves = (x1, y1, x2, y2, frequency = 0.05) => {
  const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  return Math.abs(Math.sin(distance * frequency)) * Math.exp(-distance * 0.01)
}

// Creates interference patterns between two points
export const waveInterference = (x1, y1, x2, y2, frequency = 0.1) => {
  const d1 = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  const d2 = Math.sqrt(Math.pow(x2 - x1 - 50, 2) + Math.pow(y2 - y1 - 50, 2))
  return (Math.sin(d1 * frequency) + Math.sin(d2 * frequency)) * 50
}

// Creates a ripple effect with customizable decay
export const ripple = (x1, y1, x2, y2, frequency = 0.1, decay = 0.005) => {
  const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  return Math.sin(distance * frequency) * Math.exp(-distance * decay) * 100
}

// Creates a moiré pattern effect
export const moire = (x1, y1, x2, y2, scale = 5) => {
  const dx = x2 - x1
  const dy = y2 - y1
  return Math.sin(dx / scale) * Math.sin(dy / scale) * 100
}

// Creates fractal-like noise patterns
export const fractalNoise = (x1, y1, x2, y2) => {
  const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  let value = 0
  for (let i = 1; i <= 4; i++) {
    value += Math.sin(distance * 0.05 * i) * (1 / i)
  }
  return value * 50
}

// Creates a vortex-like pattern
export const vortex = (x1, y1, x2, y2, spiralFactor = 0.1) => {
  const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  const angle = Math.atan2(y2 - y1, x2 - x1)
  return (distance + angle / spiralFactor) % 100
}

// Creates a cellular-like pattern
export const cellular = (x1, y1, x2, y2, scale = 50) => {
  const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  return Math.abs((distance % scale) - scale / 2) * 2
}

// Creates a pattern similar to wood grain
export const woodGrain = (x1, y1, x2, y2, grainSize = 20) => {
  const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  const angle = Math.atan2(y2 - y1, x2 - x1)
  return (Math.sin(distance / grainSize) + Math.sin(angle * 5)) * 50
}

// Creates patterns similar to topographic maps
export const topographic = (x1, y1, x2, y2, contourInterval = 20) => {
  const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  return (
    Math.abs(
      ((distance + x2 * 0.5 + y2 * 0.5) % contourInterval) -
        contourInterval / 2,
    ) * 2
  )
}

// Creates a pattern that looks like fabric weave
export const weave = (x1, y1, x2, y2, frequency = 0.1) => {
  return (
    (Math.sin(x2 * frequency) + Math.sin(y2 * frequency)) *
    Math.sin(Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) * 0.05) *
    50
  )
}

// Creates a kaleidoscope-like effect
export const kaleidoscope = (x1, y1, x2, y2, segments = 6) => {
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  const segmentAngle = (angle + Math.PI) % ((Math.PI * 2) / segments)
  return Math.sin(segmentAngle * segments + distance * 0.05) * 100
}
