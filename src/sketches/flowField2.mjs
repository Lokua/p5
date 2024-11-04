// https://editor.p5js.org/generative-design/sketches/M_1_5_03

import ControlPanel, { Range } from '../lib/ControlPanel/index.mjs'

let p

export default function (p5Instance) {
  p = p5Instance
  const [w, h] = [500, 500]

  const agents = []
  const agentCount = 10000
  const noiseZRange = 0.4
  const overlayAlpha = 10
  const agentAlpha = 90

  const metadata = {
    name: 'flowField2',
  }

  const controlPanel = new ControlPanel({
    p,
    id: metadata.name,
    controls: {
      strokeWidth: new Range({
        name: 'strokeWidth',
        value: 0.3,
        min: 0.1,
        max: 2,
        step: 0.1,
      }),
      noiseScale: new Range({
        name: 'noiseScale',
        value: 100,
        min: 1,
        max: 1000,
      }),
      noiseStrength: new Range({
        name: 'noiseStrength',
        value: 10,
        min: 1,
        max: 100,
      }),
      noiseZVelocity: new Range({
        name: 'noiseZVelocity',
        value: 0.1,
        min: 0.001,
        max: 1,
        step: 0.001,
      }),
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    for (let i = 0; i < agentCount; i++) {
      // eslint-disable-next-line no-use-before-define
      agents[i] = new Agent(noiseZRange)
    }

    return {
      canvas,
    }
  }

  function draw() {
    const { strokeWidth, noiseScale, noiseStrength, noiseZVelocity } =
      controlPanel.values()

    p.fill(255, overlayAlpha)
    p.noStroke()
    p.rect(0, 0, w, h)
    p.stroke(0, agentAlpha)

    for (var i = 0; i < agentCount; i++) {
      agents[i].update(strokeWidth, noiseScale, noiseStrength, noiseZVelocity)
    }
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

class Agent {
  constructor(noiseZRange) {
    this.vector = p.createVector(p.random(p.width), p.random(p.height))
    this.vectorOld = this.vector.copy()
    this.stepSize = p.random(1, 5)
    this.angle
    this.noiseZ = p.random(noiseZRange)
  }

  update(strokeWidth, noiseScale, noiseStrength, noiseZVelocity) {
    this.angle =
      p.noise(
        this.vector.x / noiseScale,
        this.vector.y / noiseScale,
        this.noiseZ,
      ) * noiseStrength

    this._update(strokeWidth, noiseZVelocity)
  }

  _update(strokeWidth, noiseZVelocity) {
    this.vector.x += p.cos(this.angle) * this.stepSize
    this.vector.y += p.sin(this.angle) * this.stepSize

    if (this.vector.x < -10) {
      this.vector.x = this.vectorOld.x = p.width + 10
    }
    if (this.vector.x > p.width + 10) {
      this.vector.x = this.vectorOld.x = -10
    }
    if (this.vector.y < -10) {
      this.vector.y = this.vectorOld.y = p.height + 10
    }
    if (this.vector.y > p.height + 10) {
      this.vector.y = this.vectorOld.y = -10
    }

    p.strokeWeight(strokeWidth * this.stepSize)
    p.line(this.vectorOld.x, this.vectorOld.y, this.vector.x, this.vector.y)

    this.vectorOld = this.vector.copy()

    this.noiseZ += noiseZVelocity
  }
}
