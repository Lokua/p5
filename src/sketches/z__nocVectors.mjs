// https://natureofcode.com/vectors/

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const [w, h] = [500, 500]

  const metadata = {
    name: 'z__nocVectors',
    frameRate: 30,
  }

  const position = p.createVector(100, 100)
  const velocity = p.createVector(1, 10)

  function setup() {
    const canvas = p.createCanvas(w, h)
    p.colorMode(p.RGB, 255, 255, 255, 1)

    return {
      canvas,
    }
  }

  function draw() {
    p.background(255)

    position.add(velocity)

    if (position.x < 0 || position.x > w) {
      velocity.x *= -1
    }
    if (position.y < 0 || position.y > h) {
      velocity.y *= -1
    }

    p.fill('yellow')
    p.noStroke()
    p.circle(position.x, position.y, 48)

    p.stroke(0)
    p.fill('powderblue')

    const v1 = p.createVector(w / 2, h / 2)
    p.circle(v1.x, v1.y, 20)

    const v2 = v1.copy().sub(v1.copy().mult(0.5))
    p.circle(v2.x, v2.y, 20)

    const v3 = v1.copy().add(v1.copy().mult(0.5))
    p.circle(v3.x, v3.y, 20)
  }

  return {
    setup,
    draw,
    destroy() {},
    metadata,
  }
}
