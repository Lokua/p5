import chroma from 'chroma-js'
import AnimationHelper from '../lib/AnimationHelper.mjs'
import { createControlPanel } from '../lib/ControlPanel/index.mjs'
import { times, mapTimes } from '../util.mjs'

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const metadata = {
    name: 'stalk2',
    frameRate: 30,

    // WARNING! This is probably too big
    // if recording video but perfect for images
    pixelDensity: 6,
  }

  const [w, h] = [500, 500]
  let stalks = []

  const colorScale = chroma.scale(['palevioletred', 'orange', 'olive'])

  const ah = new AnimationHelper({
    p,
    frameRate: metadata.frameRate,
    bpm: 134,
  })

  const cp = createControlPanel({
    p,
    id: metadata.name,
    controls: [
      {
        type: 'Range',
        name: 'phaseIncrement',
        display: 'phaseInc',
        value: 0.2,
        min: 0.001,
        max: 1,
        step: 0.001,
      },
      {
        type: 'Range',
        name: 'amplitudeY',
        value: 20,
      },
      {
        type: 'Range',
        name: 'amplitudeZ',
        value: 100,
        max: w * 2,
      },
      {
        type: 'Range',
        name: 'frequency',
        value: 1,
        min: 0.01,
        max: 2,
        step: 0.01,
      },
      {
        type: 'Range',
        name: 'scale',
        value: 20,
      },
    ],
  })

  function setup() {
    cp.init()
    const canvas = p.createCanvas(w, h, p.WEBGL)

    p.colorMode(p.RGB, 255, 255, 255, 1)

    stalks = [
      new Stalk({
        p,
        color: colorScale(1),
        setPhase: ah.triggerEvery((phase) => phase + cp.phaseIncrement, 1 / 16),
        buds: [
          new Bud({
            p,
            color: colorScale(0.25),
            setPhase: () => ah.getLoopProgress(8),
          }),
          new Bud({
            p,
            color: colorScale(0.5),
            setPhase: () => ah.getLoopProgress(16),
          }),
          new Bud({
            p,
            color: colorScale(0.75),
            setPhase: () => ah.getLoopProgress(24),
          }),
        ],
      }),
    ]

    return {
      canvas,
    }
  }

  const backgroundColor = colorScale(1).desaturate(3).brighten(2.6).rgba()

  function draw() {
    // p.ambientLight(150)
    // p.directionalLight(255, 255, 255, 0, -1, 0)
    p.background(backgroundColor)

    for (const stalk of stalks) {
      stalk.update({
        amplitudeY: cp.amplitudeY,
        amplitudeZ: cp.amplitudeZ,
        frequency: cp.frequency,
        scale: cp.scale,
      })
      stalk.draw()
    }
  }

  return {
    setup,
    draw,
    destroy() {
      cp.destroy()
    },
    metadata,
  }
}

class Stalk {
  constructor({
    p,
    w = p.width,
    h = p.height,
    amplitudeY,
    amplitudeZ,
    frequency,
    scale,
    color,
    buds = [],
    setPhase,
  }) {
    this.p = p
    this.w = w
    this.h = h
    this.amplitudeY = amplitudeY
    this.amplitudeZ = amplitudeZ
    this.frequency = frequency
    this.scale = scale
    this.color = color
    this.buds = buds
    this.phase = 0
    this.setPhase = setPhase
    this.margin = 50
    this.xStart = -w / 2 - this.margin
    this.xEnd = w / 2 + this.margin
  }

  addBud(bud) {
    this.buds.push(bud)
  }

  update(state) {
    Object.assign(this, state)
    for (const bud of this.buds) {
      bud.update()
    }
  }

  draw() {
    this.p.noFill()
    this.p.stroke(this.color.rgba())

    this.p.$.shape(() => {
      for (let x = this.xStart; x <= this.xEnd; x += 1) {
        const theta = x / this.scale + this.phase
        const y = this.amplitudeY * Math.cos(this.frequency * theta)
        const z = this.amplitudeZ * Math.sin(this.frequency * theta)
        this.p.vertex(x, y, z)
      }
    })

    for (const bud of this.buds) {
      const budX = this.p.lerp(this.xStart, this.xEnd, bud.position % 1)
      const theta = budX / this.scale + this.phase
      const y = this.amplitudeY * Math.cos(this.frequency * theta)
      const z = this.amplitudeZ * Math.sin(this.frequency * theta)

      this.p.$.pushPop(() => {
        this.p.translate(budX, y, z)
        bud.draw()
      })
    }

    this.phase = this.setPhase(this.phase)
  }
}

class Bud {
  constructor({ p, position = Math.random(), color, setPhase }) {
    this.p = p
    this.position = position
    this.color = color
    this.setPhase = setPhase
  }

  update() {
    this.position = this.setPhase(this.position) % 1
  }

  draw() {
    const p = this.p
    const sphereRadius = 10
    p.noStroke()
    p.fill(this.color.rgba())

    // Draw the central sphere
    p.sphere(sphereRadius, 16, 16)
  }
}
