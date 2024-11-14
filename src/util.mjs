export const PHI = (1 + Math.sqrt(5)) / 2

export const logInfo = (...args) =>
  console.info('%c[info]%c', 'color: teal;', '', ...args)

// Good for using template strings for multiline log comments;
// avoids long strings and ugly concatenation
export const formatLog = (str) =>
  str
    .replace(/\\n/g, '__NEWLINE__')
    .replace(/\s*\n\s*/g, ' ')
    .replace(/__NEWLINE__/g, '\n')

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
// min and max are inclusive
export function randomInt(minimum, maximum) {
  if (maximum === undefined) {
    maximum = minimum
    minimum = 0
  }

  return Math.floor(Math.random() * (maximum - minimum + 1) + minimum)
}

export const randomItem = (array) => array[randomInt(0, array.length - 1)]
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

export const isEven = (x) => x % 2 === 0
export const isOdd = (x) => !isEven(x)

export const $ = globalThis?.document?.querySelector?.bind(document)

export const average = (values) =>
  values.reduce((total, value) => total + value, 0) / values.length

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
    console.warn(
      'P5Helpers is deprecated. Use P5Extensions (available directly on p5 instance)',
    )
    this.p = p
    this.Vector = this.p.constructor.Vector
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

export function arrayModLookup(array, i) {
  const index = Math.floor(((i % array.length) + array.length) % array.length)
  return array[index]
}

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

export function beatsToFrames(beats, bpm, frameRate) {
  const secondsPerBeat = 60 / bpm
  const totalSeconds = beats * secondsPerBeat
  return totalSeconds * frameRate
}

export function getShaderFiles(name) {
  const prefix = `./sketches/${name}`
  return [`${prefix}.vert`, `${prefix}.frag`]
}

export class InvalidArgumentsException extends Error {
  constructor(message) {
    super(message)
    this.name = 'InvalidArgumentsException'
  }
}

export function msToTime(duration) {
  const milliseconds = Math.floor((duration % 1000) / 100)
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24)

  const format = (num) => (num < 10 ? '0' + num : num)

  return `${format(hours)}:${format(minutes)}:${format(seconds)}.${milliseconds}`
}

export function onScreen(v, w, h) {
  return v.x >= 0 && v.x <= w && v.y >= 0 && v.y <= h
}

const intervalStates = new Map()
export function logAtInterval(interval, callback) {
  const key = callback.toString()
  let state = intervalStates.get(key)
  if (!state) {
    state = { lastLogTime: 0 }
    intervalStates.set(key, state)
  }

  const currentTime = Date.now()
  if (currentTime - state.lastLogTime > interval) {
    callback()
    state.lastLogTime = currentTime
  }
}

export function getAverageFrameRate(
  p,
  atFrameCount,
  callback = (x) => {
    console.log('Average frame rate:', x)
  },
) {
  getAverageFrameRate.frameRates = getAverageFrameRate.frameRates || []
  getAverageFrameRate.frameRates.push(p.frameRate())
  if (p.frameCount === atFrameCount) {
    callback(average(getAverageFrameRate.frameRates))
  }
}

export function profile(id = uuid(), limit = Infinity, average = false) {
  let callCount = 0
  let totalMs = 0
  let called = false
  let startTime = null

  function start() {
    startTime = performance.now()
  }

  function end(
    callback = (report) => {
      console.log(report)
    },
  ) {
    const ms = performance.now() - startTime
    totalMs += ms
    callCount++

    const time = average ? totalMs / callCount : ms
    const report = {
      id,
      ms: Number(time.toFixed(3)),
      time: msToTime(time),
      µs: Math.round(time * 1000),
      ns: Math.round(time * 1_000_000),
      // z so the less readable one shows up at the end in
      // console logs
      z_ms: time,
    }

    if (average && !called && callCount >= limit) {
      callback(report)
      called = true
    } else if (!average && callCount <= limit) {
      callback(report)
    }
  }

  return {
    start,
    end,
  }
}
