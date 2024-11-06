export default class P5Extensions {
  constructor(p) {
    this.p = p
    this.V = window.p5.Vector
  }

  pushPop = (fn) => {
    this.p.push()
    fn()
    this.p.pop()
  }

  shape = (fn) => {
    this.p.beginShape()
    fn()
    this.p.endShape()
  }

  xToLongitude(resolution, x) {
    return this.p.map(x, 0, resolution, 0, this.p.PI)
  }

  yToLatitude(resolution, y) {
    return this.p.map(y, 0, resolution, 0, this.p.TWO_PI)
  }

  geographicToCartesian(longitude, latitude, radius) {
    const x = radius * Math.sin(longitude) * Math.cos(latitude)
    const y = radius * Math.sin(longitude) * Math.sin(latitude)
    const z = radius * Math.cos(longitude)
    return [x, y, z]
  }
}
