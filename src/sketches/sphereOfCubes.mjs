import ControlPanel, {
  Range,
} from '../ControlPanel/index.mjs'

export default function sphereOfCubes(p, u) {
  const [w, h] = [500, 500]
  const controlPanel = new ControlPanel({
    controls: {
      cameraX: new Range({
        name: 'cameraX',
        value: 0,
        min: -400,
        max: 400,
      }),
      cameraY: new Range({
        name: 'cameraY',
        value: 0,
        min: -400,
        max: 400,
      }),
      resolution: new Range({
        name: 'resolution',
        value: 50,
        min: 1,
        max: 500,
      }),
      radius: new Range({
        name: 'radius',
        value: 200,
        min: 1,
        max: 500,
      }),
      boxSize: new Range({
        name: 'boxSize',
        value: 10,
        min: 1,
        max: 100,
      }),
      colorRange: new Range({
        name: 'colorRange',
        value: 100,
        min: 1,
        max: 200,
      }),
      colorOffset: new Range({
        name: 'colorOffset',
        value: 0,
        min: 0,
        max: 100,
      }),
    },
    inputHandler() {
      !p.isLooping() && draw()
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h, p.WEBGL)
    p.noFill()
    p.colorMode(p.HSB, 1)

    return {
      canvas,
    }
  }

  function draw() {
    const {
      resolution,
      radius,
      boxSize,
      colorRange,
      colorOffset,
    } = controlPanel.values()

    setCamera()

    p.background(0)

    u.pushPop(() => {
      for (let i = 0; i < resolution; i++) {
        const longitude = u.xToLongitude(resolution, i)
        for (let j = 0; j < resolution; j++) {
          const latitude = u.yToLatitude(resolution, j)
          const [x, y, z] = u.geographicToCartesian(
            longitude,
            latitude,
            radius,
          )
          u.pushPop(() => {
            p.stroke(
              p.fract(i / colorRange + colorOffset * 0.01),
              1,
              1,
              0.1,
            )
            p.translate(x, y, z)
            p.box(boxSize, boxSize, boxSize)
          })
        }
      }
    })
  }

  function setCamera() {
    const { cameraX, cameraY } = controlPanel.values()

    p.camera(
      // eye
      cameraX,
      cameraY,
      h / 2 / p.tan(p.PI / 6),
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

  return {
    setup,
    draw,
    destroy() {
      controlPanel.destroy()
    },
    metadata: {
      name: 'sphereOfCubes',
    },
  }
}
