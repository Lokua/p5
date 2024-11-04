// https://openprocessing.org/sketch/1036179/
import ControlPanel, { Range } from '../lib/ControlPanel/index.mjs'

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const [w, h] = [500, 500]
  const cx = w / 2
  const cy = h / 2

  const metadata = {
    name: 'ztudy__un',
    frameRate: 30,
  }

  const count = 200
  const points = []
  let virtualMouseX = cx
  let virtualMouseY = cy

  // draw to a buffer so we keep trails while still
  // drawing a white bg every frame
  let buffer

  const controlPanel = new ControlPanel({
    p,
    id: metadata.name,
    controls: {
      stepSize: new Range({
        name: 'stepSize',
        value: 10,
        min: 1,
        max: 100,
      }),
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)
    buffer = p.createGraphics(w, h)

    p.colorMode(p.RGB, 255, 255, 255, 1)
    buffer.background(255)

    for (let i = 0; i < count; i++) {
      points.push({
        pos: p.createVector(cx, cy),
        dir: p.random(p.TWO_PI),
        size: p.random(1, 50),
      })
    }

    return {
      canvas,
    }
  }

  function draw() {
    const { stepSize } = controlPanel.values()

    const time = p.millis() / 1000

    p.background(255, 255, 255)
    simulateRandomMouse(stepSize)

    for (let i = 0; i < count; i++) {
      const point = points[i]

      point.dir += p.noise(point.pos.x, point.pos.y, time) - 0.477

      const mouseAngle = p.atan2(
        virtualMouseY - point.pos.y,
        virtualMouseX - point.pos.x,
      )

      const velocity = 0.5
      point.dir += (mouseAngle - point.dir) * velocity

      point.size *= 0.95
      if (point.size < 0.5) {
        point.size = p.random(10, 60)
        point.pos.x = virtualMouseX + p.random(-50, 50)
        point.pos.y = virtualMouseY + p.random(-50, 50)
      }

      point.pos.x += (Math.cos(point.dir) / (point.size + 2.5)) * 10
      point.pos.y += (Math.sin(point.dir) / (point.size + 2.5)) * 10

      buffer.circle(point.pos.x, point.pos.y, point.size)
    }

    p.image(buffer, 0, 0)
  }

  function simulateRandomMouse(stepSize) {
    virtualMouseX += p.random(-stepSize, stepSize)
    virtualMouseY += p.random(-stepSize, stepSize)
    virtualMouseX = p.constrain(virtualMouseX, 0, w)
    virtualMouseY = p.constrain(virtualMouseY, 0, h)
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
