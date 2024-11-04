// https://natureofcode.com/vectors/
import ControlPanel, { Range, Select } from '../lib/ControlPanel/index.mjs'
import { P5Helpers } from '../util.mjs'

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const [w, h] = [500, 500]

  const metadata = {
    name: 'z__nocVectors',
    frameRate: 30,
  }

  const center = p.createVector(w / 2, h / 2)
  const ph = new P5Helpers(p)
  const mover = new Mover(p, w, h)

  const controlPanel = new ControlPanel({
    p,
    id: metadata.name,
    controls: {
      example: new Select({
        name: 'example',
        value: '1.3',
        options: ['1.3', '1.5', '1.9'],
      }),
      paramA: new Range({
        name: 'paramA',
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
    // p.angleMode(p.DEGREES)

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
      ph.pushPop(() => {
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

      p.push()
      p.translate(center.x, center.y)
      p.line(0, 0, mouse.x, mouse.y)
      p.pop()

      p.fill(0)
      const point = mouse.copy()

      for (let i = 0; i < 8; i++) {
        const drawLine = () => p.rect(0, i * 12, point.mag(), 10)

        // top left
        drawLine()

        // bottom right
        ph.pushPop(() => {
          p.translate(w, h)
          p.rotate(p.PI)
          drawLine()
        })

        // top right
        ph.pushPop(() => {
          p.translate(w, 0)
          p.rotate(p.PI / 2)
          drawLine()
        })

        // bottom left
        ph.pushPop(() => {
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
    this.acceleration = this.p.constructor.Vector.random2D()
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
