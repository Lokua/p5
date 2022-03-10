import ControlPanel, {
  Range,
} from '../ControlPanel/index.mjs'

export default function sphereOfCubes(p, u) {
  const [w, h] = [500, 500]
  const controlPanel = new ControlPanel({
    controls: {
      cameraX: new Range({
        name: 'cameraX',
        value: 10,
        min: 0,
        max: 100,
      }),
      cameraY: new Range({
        name: 'cameraY',
        value: 10,
        min: 0,
        max: 100,
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
    },
    inputHandler() {
      !p.isLooping() && draw()
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h, p.WEBGL)
    // p.noLoop()

    return {
      canvas,
    }
  }

  function draw() {
    const { resolution, radius } = controlPanel.values()

    setCamera()

    p.background(0)
    p.stroke(255)
    p.fill(255, 100)
    p.lights()

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
            p.translate(x, y, z)
            p.box(10, 10, 10)
          })
        }
      }
    })
  }

  function setCamera() {
    const { cameraX, cameraY } = controlPanel.values()

    p.camera(
      // eye
      p.map(
        0,
        controlPanel.controls.cameraX.max,
        cameraX,
        -w / 2,
        w / 2,
      ),
      p.map(
        0,
        controlPanel.controls.cameraY.max,
        cameraY,
        -h / 2,
        h / 2,
      ),
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
