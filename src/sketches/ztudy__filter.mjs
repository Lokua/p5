import chroma from 'chroma-js'
import ControlPanel, {
  Range,
  createFilter,
} from '../lib/ControlPanel/index.mjs'
import { Simplex } from '../lib/Noise.mjs'

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const [w, h] = [500, 500]

  const metadata = {
    name: 'ztudy__filter',
    frameRate: 30,
  }

  const scale = chroma.scale(['blue', 'green', 'yellow', 'red'])
  const simplex = new Simplex('2d')

  const controlPanel = new ControlPanel({
    p,
    id: metadata.name,
    controls: {
      noiseSeed: new Range({
        name: 'noiseSeed',
        value: 9,
        min: 9,
        max: 33,
        step: 1,
      }),
      perlinScale: new Range({
        name: 'perlinScale',
        value: 0.02,
        min: 0.001,
        max: 0.1,
        step: 0.001,
      }),
      simplexScale: new Range({
        name: 'simplexScale',
        value: 0.02,
        min: 0.001,
        max: 0.1,
        step: 0.001,
      }),
      pixelSize: new Range({
        name: 'pixelSize',
        value: 1,
        min: 1,
        max: 20,
        step: 1,
      }),
      ...createFilter(),
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    p.colorMode(p.RGB, 255, 255, 255, 1)
    p.noLoop()
    p.noStroke()

    return {
      canvas,
    }
  }

  function draw() {
    const {
      noiseSeed,
      pixelSize,
      perlinScale,
      simplexScale,
      filter,
      filterParam,
    } = controlPanel.values()

    p.background(255)

    simplex.setSeed(noiseSeed)
    p.noiseSeed(noiseSeed)

    for (let x = 0; x < w / 2; x += pixelSize) {
      for (let y = 0; y < h; y += pixelSize) {
        const noiseValue = p.noise(x * perlinScale, y * perlinScale)
        p.fill(scale(noiseValue).rgba())
        p.rect(x, y, pixelSize, pixelSize)
      }
    }

    for (let x = w / 2; x < w; x += pixelSize) {
      for (let y = 0; y < h; y += pixelSize) {
        const noiseValue =
          (simplex.noise(x * simplexScale, y * simplexScale) + 1) / 2
        p.fill(scale(noiseValue).rgba())
        p.rect(x, y, pixelSize, pixelSize)
      }
    }

    // TODO: we need a helper
    if (filter !== 'none') {
      const param =
        filter === 'THRESHOLD'
          ? p.map(filterParam, 0, 100, 0, 1)
          : filter === 'POSTERIZE'
            ? p.map(filterParam, 0, 100, 2, 255)
            : filterParam

      p.filter(p[filter], param)
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
