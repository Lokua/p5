// https://www.youtube.com/watch?v=vmhRlDyPHMQ&list=PLwUlLzAS3RYow0T9ZXB0IomwB-DyBRTfm

import ControlPanel, {
  Range,
  Checkbox,
  createBlendMode,
} from '../lib/ControlPanel/index.mjs'
import Counter from '../lib/Counter.mjs'

export default function (p) {
  const [w, h] = [500, 500]

  const metadata = {
    name: 'sineStructureAnimation',
  }

  const sizeCounter = new Counter({
    initialValue: 40,
    min: 40,
    max: 130,
  })

  const hueCounter = new Counter({
    min: 0,
    max: 1000,
  })

  const controlPanel = new ControlPanel({
    p,
    id: metadata.name,
    controls: {
      blendMode: createBlendMode(),
      size: new Range({
        name: 'size',
        value: 1,
        min: 1,
        max: 300,
      }),
      nCircles: new Range({
        name: 'nCircles',
        value: 3,
        min: 1,
        max: 100,
      }),
      zOffset: new Range({
        name: 'zOffset',
        value: 0,
        min: 1,
        max: 100,
      }),
      radOffset: new Range({
        name: 'radOffset',
        value: 1,
        min: 1,
        max: 100,
      }),
      rotateX: new Range({
        name: 'rotateX',
        value: 0,
        min: 0,
        max: 2,
        step: 0.01,
      }),
      rotate: new Range({
        name: 'rotate',
        value: 0,
        min: 0,
        max: 360,
      }),
      speed: new Range({
        name: 'speed',
        value: 1,
        min: 0,
        max: 1,
        step: 0.01,
      }),
      noiseFalloff: new Range({
        name: 'noiseFalloff',
        value: 0,
        min: 0,
        max: 10,
        step: 0.01,
      }),
      hue: new Range({
        name: 'hue',
        value: 0,
        min: 0,
        max: 1,
        step: 0.001,
      }),
      saturation: new Range({
        name: 'saturation',
        value: 0,
        min: 0,
        max: 1,
        step: 0.001,
      }),
      lightness: new Range({
        name: 'lightness',
        value: 0,
        min: 0,
        max: 1,
        step: 0.001,
      }),
      alpha: new Range({
        name: 'alpha',
        value: 0,
        min: 0,
        max: 1,
        step: 0.001,
      }),
      tanSinZFlip: new Checkbox({
        name: 'tanSinZFlip',
        value: false,
      }),
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h, p.WEBGL)

    p.colorMode(p.HSB, 1)
    p.angleMode(p.DEGREES)

    return {
      canvas,
    }
  }

  function draw() {
    const {
      blendMode,
      size: sizeControl,
      nCircles,
      noiseFalloff,
      zOffset,
      radOffset,
      rotateX,
      rotate,
      speed,
      hue,
      saturation,
      lightness,
      alpha,
      tanSinZFlip,
    } = controlPanel.values()
    p.blendMode(p[blendMode])
    p.noiseDetail(1, noiseFalloff)
    p.background(0)
    p.stroke(1, 0, 1)
    p.fill(hue + hueCounter.count * 0.001, saturation, lightness, alpha)

    const size = sizeControl + sizeCounter.count

    p.push()
    p.rotateX(p.frameCount * rotateX)
    for (let i = 0; i < nCircles; i++) {
      p.rotate(p.frameCount / rotate)
      p.beginShape()
      for (let j = 0; j < 360; j += size) {
        const rad = i * radOffset
        const x = rad * p.cos(j)
        const y = rad * p.sin(j)
        const z =
          p[tanSinZFlip ? 'tan' : 'sin'](p.frameCount * speed + i * zOffset) *
          50
        p.vertex(x, y, z)
      }
      p.endShape(p.CLOSE)
    }
    p.pop()

    hueCounter.tick()
    if (p.frameCount % 2 === 0) {
      sizeCounter.tick()
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
