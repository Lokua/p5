export const PHI = (1 + Math.sqrt(5)) / 2
export const FRAMERATE_BPM_130 = Math.round(34.67)

export function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n)
}

export function times(n, fn) {
  return Array(n)
    .fill(null)
    .forEach((_, index) => {
      fn(index)
    })
}

export function mapTimes(n, fn = (x) => x) {
  return Array(n)
    .fill(null)
    .map((_, index) => fn(index))
}

export const apply =
  (...args) =>
  (fn) =>
    fn(...args)

// https://github.com/sindresorhus/random-int/blob/main/index.js
export function randomInt(minimum, maximum) {
  if (maximum === undefined) {
    maximum = minimum
    minimum = 0
  }

  return Math.floor(Math.random() * (maximum - minimum + 1) + minimum)
}

export const randomBool = () => randomInt(1) > 0
export const randomSign = () => (randomBool() ? 1 : -1)

export function uuid(length = 5) {
  const letters = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'

  return mapTimes(length, () =>
    randomBool()
      ? letters.charAt(randomInt(letters.length))
      : numbers.charAt(randomInt(numbers.length)),
  ).join('')
}

export function cross(p, w, h = w, color = [0, 0, 0]) {
  p.strokeWeight(3)
  p.stroke(color)
  p.line(w / 2, 0, w / 2, h)
  p.line(0, h / 2, w, h / 2)
}

export const isEven = (x) => x % 2 === 0
export const isOdd = (x) => !isEven(x)

export const $ = document.querySelector.bind(document)

export function average(values) {
  return values.reduce((total, value) => total + value, 0) / values.length
}

// https://github.com/tmcw-up-for-adoption/simple-linear-scale/blob/master/index.js
export function linearScale(domain, range, clamp) {
  return function (value) {
    if (domain[0] === domain[1] || range[0] === range[1]) {
      return range[0]
    }

    const ratio = (range[1] - range[0]) / (domain[1] - domain[0])

    const result = range[0] + ratio * (value - domain[0])

    return clamp ? Math.min(range[1], Math.max(range[0], result)) : result
  }
}

// bipolar float [-1, 1] to unipolar float [0, 1]
export const b2u = (x) => (x + 1) / 2

export function isPrime(n) {
  for (let i = 2; i < n; i++) {
    if (n % i === 0) {
      return false
    }
  }
  return true
}

export function primes(n) {
  const array = []
  for (let i = 1; array.length < n; i++) {
    if (isPrime(i)) {
      array.push(i)
    }
  }
  return array
}

// default 2 and 4 will create a grid like:
// +-------+
// | X   X |
// |   X   |
// | X   X |
// +-------+
export function createQuintants(w, h, a = 2, b = 4) {
  return [
    // center
    [w / a, h / a],
    // top left
    [w / b, h / b],
    // top-right
    [w / a + w / b, h / b],
    // bottom left
    [w / b, h / a + h / b],
    // bottom right
    [w / a + w / b, h / a + h / b],
  ]
}

export function setAlpha(color, alpha) {
  const copy = color.levels.slice()
  copy[3] = alpha
  return copy
}

export function toXY(index, nColumns) {
  const y = index / nColumns
  const x = index % nColumns
  return [x, y]
}

export function fromXY(x, y, nColumns) {
  return nColumns * x + y
}

export class P5Helpers {
  constructor(p) {
    this.p = p
  }

  pushPop = (fn) => {
    this.p.push()
    fn()
    this.p.pop()
  }

  xToLongitude(resolution, x) {
    return this.p.map(x, 0, resolution, 0, this.p.PI)
  }

  yToLatitude(resolution, y) {
    return this.p.map(y, 0, resolution, 0, this.p.TWO_PI)
  }

  geographicToCartesian(longitude, latitude, radius) {
    const x = radius * this.p.sin(longitude) * this.p.cos(latitude)
    const y = radius * this.p.sin(longitude) * this.p.sin(latitude)
    const z = radius * this.p.cos(longitude)

    return [x, y, z]
  }
}

export class BidirectionalCounter {
  constructor(min, max, initialValue) {
    console.warn(
      '[BidirectionalCounter] deprecated. Use `src/Counter.mjs` instead.',
    )
    this.min = min
    this.max = max
    this.direction = 1
    this.count = initialValue ?? min
  }

  tick() {
    if (this.count === this.min) {
      this.direction = 1
    } else if (this.count === this.max) {
      this.direction = -1
    }

    this.count += this.direction
  }

  get value() {
    console.warn('value() is deprecated. use count')
    return this.count
  }
}

export function chunk(array, chunkSize) {
  if (!chunkSize) {
    throw new Error('chunkSize must be greater than 0')
  }

  return array.reduce((chunked, value, i) => {
    if (!(i % chunkSize)) {
      chunked.push([])
    }

    chunked[chunked.length - 1].push(value)

    return chunked
  }, [])
}

export const post = (url, data) =>
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

export const upload = (url, formData) =>
  fetch(url, {
    method: 'POST',
    body: formData,
  })

export const get = (url) =>
  fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((res) => res.json())

export const arrayModLookup = (array, i) => array[i % array.length]

export const sigmoid = (x) => 1 / (1 + Math.exp(-x))

export function erf(x) {
  // constants
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911

  // Save the sign of x
  let sign = 1
  if (x < 0) {
    sign = -1
  }
  x = Math.abs(x)

  // A&S formula 7.1.26
  const t = 1.0 / (1.0 + p * x)
  const y =
    1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)

  return sign * y
}

export const DistanceAlgorithms = {
  // Euclidean Distance (Circular Symmetry)
  euclidean(x, y, centerX, centerY) {
    return Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2))
  },

  // Manhattan Distance (Diamond Symmetry)
  manhattan(x, y, centerX, centerY) {
    return Math.abs(x - centerX) + Math.abs(y - centerY)
  },

  // Chebyshev Distance (Square Symmetry)
  chebyshev(x, y, centerX, centerY) {
    return Math.max(Math.abs(x - centerX), Math.abs(y - centerY))
  },

  // Minkowski Distance (Blend of Euclidean and Manhattan)
  minkowski(x, y, centerX, centerY, p = 2) {
    return Math.pow(
      Math.pow(Math.abs(x - centerX), p) + Math.pow(Math.abs(y - centerY), p),
      1 / p,
    )
  },

  // Radial Sinusoidal Distance (Wave-like Patterns)
  radialSinusoidal(x, y, centerX, centerY) {
    const distance = Math.sqrt(
      Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2),
    )
    // Adjust scale as needed
    return Math.abs(Math.sin(distance / 50)) * 100
  },

  // Polar Distance (Symmetric radial patterns)
  polar(x, y, centerX, centerY) {
    return Math.atan2(y - centerY, x - centerX)
  },

  // Spiral Distance (Creates spiral-like patterns)
  spiral(x, y, centerX, centerY) {
    const distance = Math.sqrt(
      Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2),
    )
    const angle = Math.atan2(y - centerY, x - centerX)
    return distance + angle * 100 // Creates spiral effect
  },

  // Harmonic Distance (Repeating patterns)
  harmonic(x, y, centerX, centerY) {
    const distance = Math.sqrt(
      Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2),
    )
    return Math.sin(distance / 50) * 50 + Math.cos(distance / 75) * 30
  },
}

export function lerp(start, end, t) {
  return start + (end - start) * t
}

export function multiLerp(values, t) {
  const numSegments = values.length - 1
  const scaledT = t * numSegments
  const index = Math.floor(scaledT)
  const segmentT = scaledT - index

  // If t is exactly 1, return the last value to prevent out-of-bounds access
  if (index >= numSegments) {
    return values[numSegments]
  }

  // Interpolate between the current and next value
  return lerp(values[index], values[index + 1], segmentT)
}
