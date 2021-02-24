export function mapTimes(n, fn) {
  return Array(n)
    .fill(null)
    .map((_, index) => fn(index))
}

export function p5Utils(p) {
  if (p5Utils.cachedReturn) {
    return p5Utils.cachedReturn
  }

  p5Utils.cachedReturn = {
    randomBool: () => p.random(1) > 0.5,
  }

  return p5Utils.cachedReturn
}
