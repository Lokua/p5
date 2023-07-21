// https://editor.p5js.org/generative-design/sketches/M_1_5_03

import ControlPanel, {
  Range,
  Toggle,
} from '../ControlPanel/index.mjs'
import Counter from '../Counter.mjs'

let p

export default function (p5Instance) {
  p = p5Instance
  const [w, h] = [500, 500]

  const agents = []
  const agentCount = 100000
  const noiseZRange = 0.4

  const noiseScaleCounter = new Counter({
    min: 1,
    max: 40,
  })

  const metadata = {
    name: 'flowField3',
  }

  const controlPanel = new ControlPanel({
    id: metadata.name,
    attemptReload: true,
    controls: {
      start: new Toggle({
        name: 'start',
        value: false,
      }),
      count: new Range({
        name: 'count',
        value: agentCount,
        min: 1,
        max: agentCount,
      }),
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
      stepSize: new Range({
        name: 'stepSize',
        value: 1,
        min: 1,
        max: 50,
      }),
      overlayAlpha: new Range({
        name: 'overlayAlpha',
        value: 10,
        min: 0,
        max: 255,
      }),
      agentAlpha: new Range({
        name: 'agentAlpha',
        value: 90,
        min: 0,
        max: 255,
      }),
      randomSeedEverySoOften: new Toggle({
        name: 'randomSeedEverySoOften',
        value: false,
      }),
    },
    inputHandler() {
      !p.isLooping() && draw()
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)
    p.background(0, 0, 50)

    for (let i = 0; i < agentCount; i++) {
      agents[i] = new Agent(
        noiseZRange,
        controlPanel.get('stepSize'),
      )
    }

    return {
      canvas,
    }
  }

  function draw() {
    const {
      start,
      strokeWidth,
      noiseScale,
      noiseStrength,
      noiseZVelocity,
      stepSize,
      count,
      overlayAlpha,
      agentAlpha,
      randomSeedEverySoOften,
    } = controlPanel.values()

    if (!start) {
      return
    }

    p.fill(0, 0, 50, overlayAlpha)
    p.noStroke()
    p.rect(0, 0, w, h)

    if (
      randomSeedEverySoOften &&
      p.frameCount % 200 === 0
    ) {
      p.noiseSeed(p.frameCount)
    }

    for (var i = 0; i < count; i++) {
      p.stroke(
        0,
        p.random(77, 120),
        p.random(120, 222),
        agentAlpha,
      )
      agents[i].stepSize = stepSize
      agents[i].update(
        strokeWidth,
        noiseScale + noiseScaleCounter.count,
        noiseStrength,
        noiseZVelocity,
      )
    }

    if (p.frameCount % 60 === 0) {
      noiseScaleCounter.tick()
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
  constructor(noiseZRange, stepSize) {
    this.vector = p.createVector(
      p.random(p.width),
      p.random(p.height),
    )
    this.vectorOld = this.vector.copy()
    this.stepSize = stepSize
    this.angle
    this.noiseZ = p.random(noiseZRange)
  }

  update(
    strokeWidth,
    noiseScale,
    noiseStrength,
    noiseZVelocity,
  ) {
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

    if (this.vector.x < -10)
      this.vector.x = this.vectorOld.x = p.width + 10
    if (this.vector.x > p.width + 10)
      this.vector.x = this.vectorOld.x = -10
    if (this.vector.y < -10)
      this.vector.y = this.vectorOld.y = p.height + 10
    if (this.vector.y > p.height + 10)
      this.vector.y = this.vectorOld.y = -10

    p.strokeWeight(strokeWidth * this.stepSize)
    p.line(
      this.vectorOld.x,
      this.vectorOld.y,
      this.vector.x,
      this.vector.y,
    )

    this.vectorOld = this.vector.copy()

    this.noiseZ += noiseZVelocity
  }
}
