import ControlPanel, {
  Range,
} from '../ControlPanel/index.mjs'

const scale = 20
let p

export default function (p5Instance) {
  p = p5Instance
  const [w, h] = [500, 500]

  const particles = []
  const flowField = []
  let zoff = 0

  const metadata = {
    name: 'flowField4',
    frameRate: 60,
  }

  const controlPanel = new ControlPanel({
    id: metadata.name,
    attemptReload: true,
    controls: {
      increment: new Range({
        name: 'increment',
        value: 1,
        min: 0.001,
        max: 1,
        step: 0.001,
      }),
      zVelocity: new Range({
        name: 'zVelocity',
        value: 0.01,
        min: 0.001,
        max: 1,
        step: 0.001,
      }),
    },
    inputHandler() {
      !p.isLooping() && draw()
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)
    p.background(255)

    for (let i = 0; i < 500; i++) {
      particles[i] = new Particle()
    }

    return {
      canvas,
    }
  }

  function draw() {
    const { increment, zVelocity } = controlPanel.values()

    p.background(255, 0)
    p.strokeWeight(1)
    p.stroke(0, 5)

    const cols = p.floor(w / scale)
    const rows = p.floor(h / scale)

    let xoff = 0
    for (let x = 0; x < rows; x++) {
      let yoff = 0
      for (let y = 0; y < cols; y++) {
        const angle =
          p.noise(xoff, yoff, zoff) * p.TWO_PI * 2
        const v = p5.Vector.fromAngle(angle)
        v.setMag(2)
        flowField[x + y * cols] = v
        p.push()
        const nudge = 5
        p.translate(x * scale + nudge, y * scale + nudge)
        p.rotate(v.heading())
        p.line(0, 0, scale, 0)
        p.pop()
        yoff += increment
      }
      xoff += increment
    }
    zoff += zVelocity

    // for (let i = 0; i < particles.length; i++) {
    //   const particle = particles[i]
    //   particle.follow(flowField)
    //   particle.update()
    //   particle.edges()
    //   particle.show()
    // }
  }

  return {
    setup,
    draw,
    destroy() {
      controlPanel.destroy()
    },
    metadata,
  }
}

class Particle {
  constructor() {
    this.pos = p.createVector(
      p.random(0, p.width),
      p.random(0, p.height),
    )
    this.prevPos = this.pos.copy()
    this.vel = p5.Vector.random2D()
    this.acc = p.createVector(0, 0)
    this.maxSpeed = 4
  }

  update() {
    this.vel.add(this.acc)
    this.vel.limit(this.maxSpeed)
    this.pos.add(this.vel)
    this.acc.mult(0)
  }

  applyForce(force) {
    this.acc.add(force)
  }

  show() {
    p.stroke(0, 10)
    p.strokeWeight(2)
    p.line(
      this.pos.x,
      this.pos.y,
      this.prevPos.x,
      this.prevPos.x,
    )
    this.updatePrev()
  }

  updatePrev() {
    this.prevPos.x = this.pos.x
    this.prevPos.y = this.pos.y
  }

  edges() {
    if (this.pos.x > p.width) {
      this.pos.x = 0
      this.updatePrev()
    } else if (this.pos.x < 0) {
      this.pos.x = p.width
      this.updatePrev()
    }
    if (this.pos.y > p.height) {
      this.pos.y = 0
      this.updatePrev()
    } else if (this.pos.y < 0) {
      this.pos.y = p.height
      this.updatePrev()
    }
  }

  follow(vectors) {
    const x = p.floor(this.pos.x / scale)
    const y = p.floor(this.pos.y / scale)
    const index = x + y * (p.width / scale)
    const force = vectors[index]
    this.applyForce(force)
  }
}
