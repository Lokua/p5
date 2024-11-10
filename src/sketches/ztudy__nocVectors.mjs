// https://natureofcode.com/vectors/
import ControlPanel, { Range, Select } from '../lib/ControlPanel/index.mjs'
import { interpolators } from '../lib/scaling.mjs'
import { times } from '../util.mjs'

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const [w, h] = [500, 500]

  const metadata = {
    name: 'ztudy__nocVectors',
    frameRate: 60,
  }

  const center = p.createVector(w / 2, h / 2)
  const mover = new Mover(p, w, h)
  const mover2 = new Mover2(p, w, h)
  const movers = Array.from(
    { length: 1000 },
    () => new Mover3(p, w, h, p.random(1, 20)),
  )

  const controlPanel = new ControlPanel({
    p,
    id: metadata.name,
    controls: {
      example: new Select({
        name: 'example',
        value: '1.3',
        options: [
          '1.3',
          '1.5',
          '1.9',
          '3',
          'forces',
          '3.4',
          '3.4b',
          '3.5',
          'harmonicMotion',
          'harmonicMotion2',
        ],
      }),
      paramA: new Range({
        name: 'paramA',
        value: 50,
        min: 0,
        max: 100,
      }),
      paramB: new Range({
        name: 'paramB',
        value: 50,
        min: 0,
        max: 100,
      }),
      paramC: new Range({
        name: 'paramC',
        value: 50,
        min: 0,
        max: 100,
      }),
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    p.colorMode(p.RGB, 255, 255, 255, 1)

    return {
      canvas,
    }
  }

  const examples = {
    1.3() {
      p.background(255)
      p.strokeWeight(4)

      const point = center.copy().add(w / 4)

      p.stroke('red')
      p.line(0, 0, center.x, center.y)
      p.stroke('green')
      p.line(0, 0, point.x, point.y)

      p.stroke('blue')
      point.sub(center)
      p.$.pushPop(() => {
        p.translate(center.x, center.y)
        p.line(0, 0, point.x, point.y)
      })

      // why wouldn't we just do this?
      // p.line(center.x, center.y, point.x, point.y)
    },
    1.5() {
      p.background(255)
      p.fill(0)
      p.stroke(0)
      p.strokeWeight(1)

      const mouse = p.createVector(p.mouseX, p.mouseY)
      mouse.sub(center)

      p.$.pushPop(() => {
        p.translate(center.x, center.y)
        p.line(0, 0, mouse.x, mouse.y)
      })

      p.fill(0)
      const point = mouse.copy()

      for (let i = 0; i < 8; i++) {
        const drawLine = () => p.rect(0, i * 12, point.mag(), 10)

        // top left
        drawLine()

        // bottom right
        p.$.pushPop(() => {
          p.translate(w, h)
          p.rotate(p.PI)
          drawLine()
        })

        // top right
        p.$.pushPop(() => {
          p.translate(w, 0)
          p.rotate(p.PI / 2)
          drawLine()
        })

        // bottom left
        p.$.pushPop(() => {
          p.translate(0, h)
          p.rotate(-p.PI / 2)
          drawLine()
        })

        point.setMag(point.mag() / 2)
      }
    },
    1.9() {
      p.background(255)
      mover.show()
      mover.update()
    },
    3() {
      p.background(255)
      const mover = mover2
      mover.show()
      mover.update()
    },
    forces() {
      p.background(255)

      movers.forEach((mover) => {
        const gravity = p.createVector(0, 0.1)
        mover.applyForce(gravity)

        if (p.mouseIsPressed) {
          const wind = p.createVector(0.01, 0)
          mover.applyForce(wind)
        }

        mover.update()
        mover.show()
      })
    },
    3.4: (() => {
      const r = h * 0.45
      let theta = 0

      return () => {
        p.background(255)
        p.stroke(0)
        p.strokeWeight(4)
        p.fill(0)

        p.translate(center.x, center.y)

        // Polar to Cartesian conversion
        const x = r * p.cos(theta)
        const y = r * p.sin(theta) // theta % p.PI === pendululm

        p.line(0, 0, x, y)
        p.circle(x, y, 50)

        theta += 0.1
      }
    })(),
    // same as 3.4 only using fromAngle
    '3.4b': (() => {
      const r = h * 0.45
      let theta = 0

      return () => {
        p.background(255)
        p.stroke(0)
        p.strokeWeight(4)
        p.fill(0)

        p.translate(center.x, center.y)
        const position = p5.Vector.fromAngle(theta).mult(r)
        p.line(0, 0, position.x, position.y)
        p.circle(position.x, position.y, 50)

        theta += 0.1
      }
    })(),
    3.5: (() => {
      let r = 0
      let theta = 0

      return () => {
        p.background(255, 0)
        p.stroke(0)
        p.strokeWeight(4)
        p.fill(0)

        // loop is just to make the drawing happen faster
        times(10, () => {
          p.$.pushPop(() => {
            p.translate(center.x, center.y)
            const x = r * p.cos(theta)
            const y = r * p.sin(theta)
            p.circle(x, y, 16)
            theta += 0.01
            r += 0.05
          })
        })
      }
    })(),
    harmonicMotion: (() => {
      const count = 20
      const size = 10
      const spacing = h / (count + 1)
      const offsetY = -((count - 1) * spacing) / 2
      let angle = 0
      const angleVelocity = 0.05
      const amplitude = 100

      return () => {
        p.background(255)
        p.stroke('red')
        p.strokeWeight(2)
        p.fill(255)

        p.$.pushPop(() => {
          p.translate(center.x, center.y)
          let prevCircle
          times(count, (i) => {
            const x = amplitude * p.sin((i / count) * angle)
            const thisCircle = p.createVector(x, offsetY + i * spacing)
            if (prevCircle) {
              p.line(prevCircle.x, prevCircle.y, thisCircle.x, thisCircle.y)
            }
            prevCircle = thisCircle
          })
          times(count, (i) => {
            const x = amplitude * p.sin((i / count) * angle)
            p.circle(x, offsetY + i * spacing, size)
          })
        })

        angle += angleVelocity
      }
    })(),
    harmonicMotion2: (() => {
      const amplitude = 50
      let theta = 0

      return () => {
        p.background(255)
        p.noFill()

        // const count = controlPanel.get('paramA')
        const f1 = controlPanel.get('paramB') * 0.001
        const f2 = controlPanel.get('paramC') * 0.001
        const modIndex = 10

        p.stroke('blue')
        p.beginShape()
        for (let x = 0; x < w; x += 1) {
          const y2 = center.y + amplitude * p.sin(theta + x * f2)
          p.vertex(x, y2)
        }
        p.endShape()

        p.stroke('green')
        p.beginShape()
        for (let x = 0; x < w; x += 1) {
          const modulation = modIndex * p.sin(theta + x * f2)
          const y3 = center.y + amplitude * p.sin(theta + x * f1 + modulation)
          p.vertex(x, y3)
        }
        p.endShape()

        p.stroke('red')
        p.beginShape()
        for (let x = 0; x < w; x += 1) {
          const y = center.y + amplitude * p.sin(theta + x * f1)
          p.vertex(x, y)
        }
        p.endShape()

        // Increment theta to animate the wave over time
        theta += 0.05
      }
    })(),
  }

  function draw() {
    examples[controlPanel.get('example')]()
  }

  return {
    setup,
    draw,
    destroy() {},
    metadata,
  }
}

class Mover {
  constructor(p, w, h) {
    this.p = p
    this.w = w
    this.h = h
    this.position = p.createVector(w / 2, h / 2)
    this.velocity = p.createVector(0, 0)
    this.acceleration = p.createVector(-0.001, 0.01)
    this.topSpeed = 10
  }

  update() {
    this.acceleration = p5.Vector.random2D()
    this.acceleration.mult(this.p.random(2))
    if (this.p.random(1) < 0.05) {
      this.velocity.mult(0)
    } else {
      this.velocity.add(this.acceleration)
      this.velocity.limit(this.topSpeed)
    }
    this.position.add(this.velocity)
    this.checkEdges()
  }

  show() {
    this.p.stroke(0)
    this.p.strokeWeight(2)
    this.p.fill(127)
    this.p.circle(this.position.x, this.position.y, 48)
  }

  checkEdges() {
    if (this.position.x > this.w) {
      this.position.x = this.w
      this.velocity.mult(-1)
    } else if (this.position.x < 0) {
      this.position.x = 0
      this.velocity.mult(-1)
    }

    if (this.position.y > this.h) {
      this.position.y = this.h
      this.velocity.mult(-1)
    } else if (this.position.y < 0) {
      this.position.y = 0
      this.velocity.mult(-1)
    }
  }
}

class Mover2 {
  constructor(p, w, h) {
    this.p = p
    this.w = w
    this.h = h
    this.position = p.createVector(w / 2, h / 2)
    this.velocity = p.createVector(0, 0)
    this.acceleration = 0
    this.topSpeed = 4
    this.xoff = 1000
    this.yoff = 0
    this.r = 16
  }

  update() {
    const mouse = this.p.createVector(this.p.mouseX, this.p.mouseY)
    const direction = mouse.copy().sub(this.position).setMag(0.5)
    this.acceleration = direction
    this.velocity.add(this.acceleration)
    this.velocity.limit(this.topSpeed)
    this.position.add(this.velocity)
    this.checkEdges()
  }

  show() {
    this.p.stroke(0)
    this.p.strokeWeight(2)
    this.p.fill(0)

    // const angle = this.p.atan2(this.velocity.x, this.velocity.y)
    const angle = this.velocity.heading()
    const rectWidth = 30

    this.p.$.pushPop(() => {
      this.p.rectMode(this.p.CENTER)
      this.p.translate(this.position.x, this.position.y)
      this.p.rotate(angle)
      this.p.rect(0, 0, rectWidth, 10)
      this.p.triangle(rectWidth, 0, 0, 10, 0, -10)
    })
  }

  checkEdges() {
    if (this.position.x > this.w) {
      this.position.x = this.w
      this.velocity.mult(-1)
    } else if (this.position.x < 0) {
      this.position.x = 0
      this.velocity.mult(-1)
    }

    if (this.position.y > this.h) {
      this.position.y = this.h
      this.velocity.mult(-1)
    } else if (this.position.y < 0) {
      this.position.y = 0
      this.velocity.mult(-1)
    }
  }
}

class Mover3 {
  constructor(p, w, h, mass) {
    this.p = p
    this.w = w
    this.h = h
    this.position = p.createVector(p.random(w), p.random(h))
    this.velocity = p.createVector()
    this.acceleration = p.createVector()
    this.mass = mass
    this.size = p.map(
      interpolators.exponential(this.p.random(), 3),
      0,
      1,
      3,
      50,
    )
  }

  applyForce(force) {
    force.copy().div(this.mass)
    this.acceleration.add(force)
  }

  update() {
    this.velocity.add(this.acceleration)
    this.position.add(this.velocity)
    this.acceleration.mult(0)
    this.#constrain()
  }

  show() {
    this.p.stroke(0)
    this.p.strokeWeight(2)
    this.p.fill(127, 0.5)
    this.p.circle(this.position.x, this.position.y, this.size)
  }

  #constrain() {
    if (this.position.x > this.w) {
      this.position.x = this.w
      this.velocity.x *= -1
    } else if (this.position.x < 0) {
      this.velocity.x *= -1
      this.position.x = 0
    }
    if (this.position.y > this.h) {
      this.velocity.y *= -1
      this.position.y = this.h
    }
  }
}
