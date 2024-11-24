// https://www.youtube.com/watch?v=p7IGZTjC008&t=613s
// https://people.csail.mit.edu/jaffer/Marbling/Dropping-Paint
import chroma from 'chroma-js'
import { createControlPanel } from '../lib/ControlPanel/index.mjs'
import { mapTimes, times, getAverageFrameRate } from '../util.mjs'
import AnimationHelper from '../lib/AnimationHelper.mjs'
import bus from '../lib/bus.mjs'

import { Drop } from './drop.mjs'

// https://lokua.bandcamp.com/track/dumb-out

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const metadata = {
    name: 'drop3',
    frameRate: 30,

    // WARNING! This is probably too big
    // if recording video but perfect for images
    // pixelDensity: 6,
  }

  const [w, h] = [500, 500]
  const center = p.createVector(w / 2, h / 2)
  const drops = []
  const maxDrops = 150
  const zone = new DropZone(p, center)

  const removeResetHandler = bus.on('resetSketch', () => {
    drops.length = 0
  })

  const ah = new AnimationHelper({ p, frameRate: metadata.frameRate, bpm: 134 })

  const bdScale = chroma.scale(['black', chroma('gray').darken(2)]).mode('lab')
  const stabScale = chroma.scale(['brown', 'orange', 'red']).mode('lab')
  const tomScale = chroma.scale(['purple', 'blue']).mode('lab')
  const hatScale = chroma
    .scale(['brown', 'cyan', 'azure', 'mistyrose'])
    .mode('lab')

  const cp = createControlPanel({
    p,
    id: metadata.name,
    controls: [
      {
        type: 'Range',
        name: 'resolution',
        value: 100,
        min: 3,
        max: 300,
      },
    ],
  })

  function setup() {
    cp.init()
    const canvas = p.createCanvas(w, h)

    p.colorMode(p.RGB, 255, 255, 255, 1)

    return {
      canvas,
    }
  }

  const dropBd = ah.triggerEvery(bd, 1)
  const dropOneEStab = ah.triggerEvery(stab, 2, 0.25)
  const dropTwoAndStab = ah.triggerEvery(stab, 2, 1.5)
  const dropOneATom = ah.triggerEvery(tom, 2, 0.75)
  const dropTwoAndTom = ah.triggerEvery(tom, 2, 1.5)
  const dropOh = ah.triggerEvery(oh, 1, 0.5)
  const dropHH = ah.triggerEvery(hh, 0.25)

  const tomRadiusAnimation = () => ah.repeat([75, 40, 50], 32)
  const stabRadiusAnimation = () => ah.repeat([30, 75, 50], 32)
  const hhRadiusAnimation = () => ah.repeat([50, 100], 16)

  function draw() {
    p.background(255)
    p.noStroke()

    const beatsElapsed = ah.getTotalBeatsElapsed()

    dropBd()
    dropOneATom()
    dropTwoAndTom()
    dropOneEStab()
    dropTwoAndStab()
    beatsElapsed > 32 && dropOh()
    beatsElapsed > 64 && dropHH()

    for (const drop of drops) {
      if (beatsElapsed > 128) {
        const direction = p.createVector(0, 1)
        const disp = 10
        const falloff = 2
        drop.tine(p.createVector(center.x / 2, 0), direction, disp, falloff)
        drop.tine(p.createVector(center.x, 0), direction, disp, falloff)
        drop.tine(p.createVector(center.x * 1.5, 0), direction, disp, falloff)
      }
      p.fill(drop.color)
      drop.display()
    }

    // getAverageFrameRate(p, 300)
  }

  function bd() {
    const [x, y] = nearbyPoint([center.x, center.y], 100)
    const drop = new Drop(p, x, y, p.random(50, 75), cp.resolution)
    marbleDrops(drop)
    drop.color = bdScale(p.random()).rgba()
    drops.push(drop)
    cullDrops()
  }

  function tom() {
    const [x, y] = nearbyPoint([center.x, center.y], 75)
    const radius = p.random(tomRadiusAnimation())
    const drop = new Drop(p, x, y, radius, cp.resolution)
    marbleDrops(drop)
    drop.color = tomScale(p.random()).rgba()
    drops.push(drop)
    cullDrops()
  }

  function stab() {
    const dropIt = ([x, y]) => {
      const radius = p.random(stabRadiusAnimation())
      const drop = new Drop(p, x, y, radius, cp.resolution)
      marbleDrops(drop)
      drop.color = stabScale(p.random()).rgba()
      drops.push(drop)
      cullDrops()
    }
    const point = zone.getRandomCircularPoint(25, 200)
    dropIt(point)
    times(3, () => {
      dropIt(nearbyPoint(point, 62))
    })
  }

  function oh() {
    const dropIt = () => {
      const [x, y] = zone.getRandomCircularPoint(center.x - 100, center.x - 50)
      const drop = new Drop(p, x, y, p.random(30), cp.resolution)
      marbleDrops(drop)
      drop.color = hatScale(p.random()).rgba()
      drops.push(drop)
      cullDrops()
    }
    times(2, () => {
      dropIt()
    })
  }
  function hh() {
    const dropIt = () => {
      const [x, y] = zone.getRandomCircularPoint(center.x - 100, center.x)
      const radius = p.random(hhRadiusAnimation())
      const drop = new Drop(p, x, y, radius, cp.resolution)
      marbleDrops(drop)
      drop.color = hatScale(p.random()).rgba()
      drops.push(drop)
      cullDrops()
    }
    times(3, () => {
      dropIt()
    })
  }

  function nearbyPoint(basePoint, radius = 50) {
    const angle = p.random(p.TWO_PI)
    const distance = p.random(radius)
    return [
      basePoint[0] + distance * Math.cos(angle),
      basePoint[1] + distance * Math.sin(angle),
    ]
  }

  function marbleDrops(drop) {
    for (const other of drops) {
      drop.marble(other)
    }
  }

  function cullDrops() {
    while (drops.length > maxDrops) {
      drops.shift()
    }
  }

  return {
    setup,
    draw,
    destroy() {
      cp.destroy()
      removeResetHandler()
    },
    metadata,
  }
}

class DropZone {
  constructor(p, center) {
    this.p = p
    this.center = center
  }

  getRandomCircularPoint(minRadius, maxRadius) {
    const angle = this.p.random(this.p.TWO_PI)
    const radius = this.p.sqrt(
      this.p.random(minRadius * minRadius, maxRadius * maxRadius),
    )

    return [
      this.center.x + radius * Math.cos(angle),
      this.center.y + radius * Math.sin(angle),
    ]
  }

  getRandomRectangularPoint(minRadius, maxRadius) {
    let point
    do {
      const x = this.p.random(-maxRadius, maxRadius)
      const y = this.p.random(-maxRadius, maxRadius)
      point = [this.center.x + x, this.center.y + y]
    } while (!this.isInRectangularZone(point, minRadius, maxRadius))

    return point
  }

  isInRectangularZone(point, minRadius, maxRadius) {
    const dx = Math.abs(point[0] - this.center.x)
    const dy = Math.abs(point[1] - this.center.y)
    const maxDist = Math.max(dx, dy)
    return maxDist >= minRadius && maxDist <= maxRadius
  }

  debugCircular(minRadius, maxRadius) {
    this.p.push()
    this.p.noFill()
    this.p.stroke('cyan')
    this.p.circle(this.center.x, this.center.y, minRadius * 2)
    this.p.circle(this.center.x, this.center.y, maxRadius * 2)
    this.p.pop()
  }

  debugRectangular(minRadius, maxRadius) {
    this.p.push()
    this.p.noFill()
    this.p.stroke('cyan')
    this.p.rectMode(this.p.CENTER)
    this.p.rect(this.center.x, this.center.y, minRadius * 2, minRadius * 2)
    this.p.rect(this.center.x, this.center.y, maxRadius * 2, maxRadius * 2)
    this.p.pop()
  }
}
