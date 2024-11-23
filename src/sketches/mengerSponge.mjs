import chroma from 'chroma-js'
import AnimationHelper from '../lib/AnimationHelper.mjs'
import { createControlPanel } from '../lib/ControlPanel/index.mjs'

// I failed miserably :(
// https://thecodingtrain.com/challenges/2-menger-sponge

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const metadata = {
    name: 'mengerSponge',
    frameRate: 30,
    pixelDensity: 6,
  }

  const [w, h] = [500, 500]
  const center = p.createVector(w / 2, h / 2, w / 2)
  const ah = new AnimationHelper({ p, frameRate: metadata.frameRate, bpm: 134 })
  // eslint-disable-next-line no-unused-vars
  const colorScale = chroma.scale(['white', 'black', 'red']).mode('lab')

  let boxSystem

  const cp = createControlPanel({
    p,
    id: metadata.name,
    onChange() {
      boxSystem = new BoxSystem(p, center, cp.size, ah)
    },
    controls: [
      {
        type: 'Range',
        name: 'size',
        value: 200,
        min: 40,
        max: 500,
      },
      {
        type: 'Checkbox',
        name: 'rotate',
        value: false,
      },
    ],
  })

  function setup() {
    cp.init()
    const canvas = p.createCanvas(w, h, p.WEBGL)
    p.colorMode(p.RGB, 255, 255, 255, 1)
    p.setAttributes('alpha', true)
    p.setAttributes('depth', true)

    boxSystem = new BoxSystem(p, center, cp.size, ah)

    return {
      canvas,
    }
  }

  function draw() {
    p.background('gainsboro')
    p.noStroke()
    p.lights()

    p.$.pushPop(() => {
      if (cp.rotate) {
        p.rotateX(p.map(ah.getLoopProgress(16), 0, 1, 0, p.TWO_PI))
        p.rotateY(p.map(ah.getLoopProgress(24), 0, 1, 0, p.TWO_PI))
        p.rotateZ(p.map(ah.getLoopProgress(32), 0, 1, 0, p.TWO_PI))
      }

      boxSystem.draw()
    })
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

class BoxSystem {
  constructor(p, center, size, ah) {
    this.p = p
    this.boxes = []
    this.ah = ah
    this.size = size
    this.generate(center, size)

    this.animatedBox = this.boxes.find(
      (box) => box.position.x > 0 && box.position.y > 0 && box.position.z > 0,
    )

    if (this.animatedBox) {
      this.animatedBox.originalPosition = this.animatedBox.position.copy()
      this.animatedBox.outerPosition = this.animatedBox.position
        .copy()
        .mult(1.5)
    }
  }

  generate(center, mainSize) {
    const size = mainSize / 3
    for (let x = -1; x < 2; x++) {
      for (let y = -1; y < 2; y++) {
        for (let z = -1; z < 2; z++) {
          if (Math.abs(x) + Math.abs(y) + Math.abs(z) > 1) {
            const position = this.p.createVector(x * size, y * size, z * size)
            this.boxes.push({ position, size })
          }
        }
      }
    }
  }

  draw() {
    if (this.animatedBox) {
      this.animatedBox.position = p5.Vector.lerp(
        this.animatedBox.originalPosition,
        this.animatedBox.outerPosition,
        this.ah.getPingPongLoopProgress(1),
      )
    }

    this.p.fill('white')
    for (const box of this.boxes) {
      this.p.$.pushPop(() => {
        this.p.$.vTranslate(box.position)
        this.p.box(box.size)
      })
    }
  }
}
