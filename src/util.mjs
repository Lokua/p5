export function times(n, fn) {
  return Array(n)
    .fill(null)
    .forEach((_, index) => {
      fn(index)
    })
}

export function mapTimes(n, fn) {
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

  return Math.floor(
    Math.random() * (maximum - minimum + 1) + minimum,
  )
}

export const randomBool = () => randomInt(1) > 0

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
  return (
    values.reduce((total, value) => total + value, 0) /
    values.length
  )
}

// https://github.com/tmcw-up-for-adoption/simple-linear-scale/blob/master/index.js
export function linearScale(domain, range, clamp) {
  return function (value) {
    if (domain[0] === domain[1] || range[0] === range[1]) {
      return range[0]
    }

    const ratio =
      (range[1] - range[0]) / (domain[1] - domain[0])

    const result = range[0] + ratio * (value - domain[0])

    return clamp
      ? Math.min(range[1], Math.max(range[0], result))
      : result
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

export function toXY(index, width) {
  const y = index / width
  const x = index % width
  return [x, y]
}

export function fromXY(width, x, y) {
  return x + width * y
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
    const x =
      radius * this.p.sin(longitude) * this.p.cos(latitude)
    const y =
      radius * this.p.sin(longitude) * this.p.sin(latitude)
    const z = radius * this.p.cos(longitude)

    return [x, y, z]
  }
}
