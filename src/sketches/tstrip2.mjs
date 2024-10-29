import ControlPanel, { Range } from '../ControlPanel/index.mjs'

export default function tstrip2(p) {
  const [w, h] = [500, 500]
  const randomInts = []
  const scale = 2
  let flying = 0
  let index = 0

  const metadata = {
    name: 'tstrip2',
    frameRate: 30,
  }

  const controlPanel = new ControlPanel({
    p,
    id: metadata.name,
    controls: {
      cameraX: new Range({
        name: 'cameraX',
        value: 0,
        min: -1000,
        max: 1000,
      }),
      cameraY: new Range({
        name: 'cameraY',
        value: 50,
        min: -1000,
        max: 1000,
      }),
      cameraZ: new Range({
        name: 'cameraZ',
        value: 80,
        min: 0,
        max: 2000,
      }),
      saturation: new Range({
        name: 'saturation',
        value: 100,
        min: 0,
        max: 100,
      }),
      brightness: new Range({
        name: 'brightness',
        value: 100,
        min: 0,
        max: 100,
      }),
      colorOffset: new Range({
        name: 'colorOffset',
        value: 0,
        min: 0,
        max: 100,
      }),
      colorRange: new Range({
        name: 'colorRange',
        value: 100,
        min: 0,
        max: 100,
      }),
      noise: new Range({
        name: 'noise',
        value: 5,
        min: 0,
        max: 1000,
      }),
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h, p.WEBGL)

    p.colorMode(p.HSB, 100)
    p.noiseSeed(617)
    p.noStroke()
    p.frameRate(metadata.frameRate)

    Array(w)
      .fill()
      .forEach((_, i) => {
        randomInts.push(Math.floor(p.noise(i) * 100))
      })

    return {
      canvas,
    }
  }

  function draw() {
    const { saturation, brightness, colorOffset, colorRange, noise } =
      controlPanel.values()
    const count = w / scale
    const terrain = createTerrain(count, noise * 0.01, flying)
    const colors = createColors({
      count,
      saturation,
      brightness,
      colorOffset,
      colorRange,
    })

    setCamera()
    p.background(0)
    p.translate(-w / 2, -h / 2, 0)

    for (let y = 0; y < count; y++) {
      p.beginShape(p.TRIANGLE_STRIP)
      p.fill(colors[(y + index) % count])

      for (let x = 0; x < count; x++) {
        p.vertex(x * scale, y * scale, terrain[x][y])
        p.vertex(x * scale, (y + 1) * scale, terrain[x][y + 1])
      }
      p.endShape()
    }

    index = (index + 1) % count
  }

  function setCamera() {
    const { cameraX, cameraY, cameraZ } = controlPanel.values()

    p.camera(
      // eye
      cameraX,
      cameraY,
      cameraZ,
      // center
      0,
      0,
      0,
      // up
      0,
      1,
      0,
    )
  }

  function createTerrain(count, offset) {
    const terrain = []
    let yoff = flying
    for (let y = 0; y < count; y++) {
      let xoff = 0
      for (let x = 0; x < count; x++) {
        terrain[x] = terrain[x] || []
        terrain[x].push(p.map(p.noise(xoff, yoff), 0, 1, -50, 50))
        xoff += offset
      }
      yoff += offset
    }
    flying += offset
    return terrain
  }

  function createColors({ count, saturation, brightness, colorRange }) {
    return Array(count)
      .fill()
      .map((_, index) =>
        p.color(p.map(index, 0, count, 0, colorRange), saturation, brightness),
      )
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
