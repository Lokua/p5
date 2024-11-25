// Type for points/vectors: {x: number, y: number} or [number, number]
const getCoords = (a1, b1, a2, b2) => {
  // If we got 4 numbers, treat them as x1,y1,x2,y2
  if (typeof b1 === 'number') {
    return [
      [a1, b1],
      [a2, b2],
    ]
  }
  // Otherwise extract from points/vectors
  const [x1, y1] = Array.isArray(a1) ? a1 : [a1.x, a1.y]
  const [x2, y2] = Array.isArray(b1) ? b1 : [b1.x, b1.y]
  return [
    [x1, y1],
    [x2, y2],
  ]
}

// Circular Symmetry
export const euclidean = (p1, b1, p2, b2) => {
  const [[x1, y1], [x2, y2]] = getCoords(p1, b1, p2, b2)
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

// Diamond Symmetry
export const manhattan = (p1, b1, p2, b2) => {
  const [[x1, y1], [x2, y2]] = getCoords(p1, b1, p2, b2)
  return Math.abs(x2 - x1) + Math.abs(y2 - y1)
}

// Square Symmetry
export const chebyshev = (p1, b1, p2, b2) => {
  const [[x1, y1], [x2, y2]] = getCoords(p1, b1, p2, b2)
  return Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1))
}

// (Blend of Euclidean and Manhattan)
export const minkowski = (p1, b1, p2, b2, p = 2) => {
  const [[x1, y1], [x2, y2]] = getCoords(p1, b1, p2, b2)
  return Math.pow(
    Math.pow(Math.abs(x2 - x1), p) + Math.pow(Math.abs(y2 - y1), p),
    1 / p,
  )
}

export const radialSinusoidal = (p1, b1, p2, b2) => {
  const [[x1, y1], [x2, y2]] = getCoords(p1, b1, p2, b2)
  const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  return Math.abs(Math.sin(distance / 50)) * 100
}

// Returns angle between two points in radians
export const polar = (p1, b1, p2, b2) => {
  const [[x1, y1], [x2, y2]] = getCoords(p1, b1, p2, b2)
  return Math.atan2(y2 - y1, x2 - x1)
}

export const spiral = (p1, b1, p2, b2) => {
  const [[x1, y1], [x2, y2]] = getCoords(p1, b1, p2, b2)
  const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  const angle = Math.atan2(y2 - y1, x2 - x1)
  return distance + angle * 100
}

export const harmonic = (p1, b1, p2, b2) => {
  const [[x1, y1], [x2, y2]] = getCoords(p1, b1, p2, b2)
  const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  return Math.sin(distance / 50) * 50 + Math.cos(distance / 75) * 30
}

// Wave-like patterns that emanate from points
export const concentricWaves = (p1, b1, p2, b2, frequency = 0.05) => {
  const [[x1, y1], [x2, y2]] = getCoords(p1, b1, p2, b2)
  const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  return Math.abs(Math.sin(distance * frequency)) * Math.exp(-distance * 0.01) // Decay with distance
}

// Creates interference patterns between two points
export const waveInterference = (p1, b1, p2, b2, frequency = 0.1) => {
  const [[x1, y1], [x2, y2]] = getCoords(p1, b1, p2, b2)
  const d1 = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  // Create second wave center slightly offset
  const d2 = Math.sqrt(Math.pow(x2 - x1 - 50, 2) + Math.pow(y2 - y1 - 50, 2))
  return (Math.sin(d1 * frequency) + Math.sin(d2 * frequency)) * 50
}

// Creates a ripple effect with customizable decay
export const ripple = (p1, b1, p2, b2, frequency = 0.1, decay = 0.005) => {
  const [[x1, y1], [x2, y2]] = getCoords(p1, b1, p2, b2)
  const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  return Math.sin(distance * frequency) * Math.exp(-distance * decay) * 100
}

// Creates a moiré pattern effect
export const moire = (p1, b1, p2, b2, scale = 5) => {
  const [[x1, y1], [x2, y2]] = getCoords(p1, b1, p2, b2)
  const dx = x2 - x1
  const dy = y2 - y1
  return Math.sin(dx / scale) * Math.sin(dy / scale) * 100
}

// Creates fractal-like noise patterns
export const fractalNoise = (p1, b1, p2, b2) => {
  const [[x1, y1], [x2, y2]] = getCoords(p1, b1, p2, b2)
  const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  let value = 0
  for (let i = 1; i <= 4; i++) {
    value += Math.sin(distance * 0.05 * i) * (1 / i)
  }
  return value * 50
}

// Creates a vortex-like pattern
export const vortex = (p1, b1, p2, b2, spiralFactor = 0.1) => {
  const [[x1, y1], [x2, y2]] = getCoords(p1, b1, p2, b2)
  const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  const angle = Math.atan2(y2 - y1, x2 - x1)
  return (distance + angle / spiralFactor) % 100
}

// Creates a cellular-like pattern
export const cellular = (p1, b1, p2, b2, scale = 50) => {
  const [[x1, y1], [x2, y2]] = getCoords(p1, b1, p2, b2)
  const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  return Math.abs((distance % scale) - scale / 2) * 2
}

// Creates a pattern similar to wood grain
export const woodGrain = (p1, b1, p2, b2, grainSize = 20) => {
  const [[x1, y1], [x2, y2]] = getCoords(p1, b1, p2, b2)
  const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  const angle = Math.atan2(y2 - y1, x2 - x1)
  return (Math.sin(distance / grainSize) + Math.sin(angle * 5)) * 50
}

// Creates patterns similar to topographic maps
export const topographic = (p1, b1, p2, b2, contourInterval = 20) => {
  const [[x1, y1], [x2, y2]] = getCoords(p1, b1, p2, b2)
  const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  return (
    Math.abs(
      ((distance + x2 * 0.5 + y2 * 0.5) % contourInterval) -
        contourInterval / 2,
    ) * 2
  )
}

// Creates a pattern that looks like fabric weave
export const weave = (p1, b1, p2, b2, frequency = 0.1) => {
  const [[x1, y1], [x2, y2]] = getCoords(p1, b1, p2, b2)
  return (
    (Math.sin(x2 * frequency) + Math.sin(y2 * frequency)) *
    Math.sin(Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) * 0.05) *
    50
  )
}

// Creates a kaleidoscope-like effect
export const kaleidoscope = (p1, b1, p2, b2, segments = 6) => {
  const [[x1, y1], [x2, y2]] = getCoords(p1, b1, p2, b2)
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  const segmentAngle = (angle + Math.PI) % ((Math.PI * 2) / segments)
  return Math.sin(segmentAngle * segments + distance * 0.05) * 100
}
