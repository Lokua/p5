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

// noteDuration 1 = 1 quarter, returns value between 0 and 1
export function loopProgress(
  frameRate,
  frameCount,
  bpm = 120,
  noteDuration = 1,
) {
  const beatDuration = 60 / bpm
  const totalFrames = beatDuration * noteDuration * frameRate
  return (frameCount % totalFrames) / totalFrames
}

export function easeIn(progress) {
  return progress * progress
}

export function easeOut(progress) {
  return progress * (2 - progress)
}

export function easeInOut(progress) {
  return progress < 0.5
    ? 2 * progress * progress
    : -1 + (4 - 2 * progress) * progress
}

export function linear(progress) {
  return progress
}

export function easeInQuad(progress) {
  return progress * progress
}

export function easeOutQuad(progress) {
  return progress * (2 - progress)
}

export function easeInOutQuad(progress) {
  return progress < 0.5
    ? 2 * progress * progress
    : -1 + (4 - 2 * progress) * progress
}

export function chainAnimations(progress, stages) {
  const totalDuration = stages.reduce((sum, stage) => sum + stage.duration, 0)
  let accumulated = 0

  for (let stage of stages) {
    const stageStart = accumulated
    const stageEnd = accumulated + stage.duration / totalDuration

    if (progress >= stageStart && progress < stageEnd) {
      const stageProgress = (progress - stageStart) / (stageEnd - stageStart)
      return (stage.easing || linear)(stageProgress)
    }

    accumulated += stage.duration / totalDuration
  }

  const lastStage = stages[stages.length - 1]
  return lastStage.easing(1)
}
