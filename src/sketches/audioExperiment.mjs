import { cross } from '../util.mjs'

export default function (p) {
  const [w, h] = [500, 500]
  const n = Math.floor(w / 250)

  function setup() {
    addControls()
    const canvas = p.createCanvas(w, h)

    p.background(0)
    p.ellipseMode(p.CENTER)
    const color = p.color(200, 0, 180)
    p.stroke(color)
    p.fill(color)

    return {
      canvas,
    }
  }

  function draw() {
    for (let x = n; x < w; x += n) {
      const yCenter = h / 2
      p.ellipse(x, yCenter, n, n)
    }
  }

  function addControls() {}

  return {
    setup,
    draw,
    metadata: {
      name: 'sin',
    },
  }
}
