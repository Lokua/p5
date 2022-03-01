import ControlPanel, {
  Range,
} from '../ControlPanel/index.mjs'

export default function (p) {
  const [w, h] = [500, 500]
  let xx = 0

  const controlPanel = new ControlPanel({
    controls: {
      size: new Range({
        name: 'size',
        value: 30,
        min: 1,
        max: w,
        step: 1,
      }),
      period: new Range({
        name: 'period',
        value: 496,
        min: 2,
        max: 1000,
        step: 1,
      }),
      amplitude: new Range({
        name: 'amplitude',
        value: 100,
        min: 0,
        max: h / 2,
      }),
    },
    inputHandler() {
      !p.isLooping() && draw()
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    p.ellipseMode(p.CENTER)
    p.noLoop()
    p.background(0)
    p.frameRate(10)

    return {
      canvas,
    }
  }

  function draw() {
    const {
      size,
      period,
      amplitude,
    } = controlPanel.controls
    p.clear()
    p.background(0)
    const n = Math.floor(w / size.value)
    const dx = ((Math.PI * 2) / period.value) * n
    const emptySpaceOnRightSide = 16

    drawHorizontal(h / 4)
    drawHorizontal(h / 2)
    drawHorizontal(h / 2 + h / 4)

    function drawHorizontal(yCenter) {
      for (
        let x = n;
        x < w - n - emptySpaceOnRightSide;
        x += n
      ) {
        const yOffset = p.sin(xx) * amplitude.value
        p.fill(
          127,
          p.map(x, 0, w, 0, 255),
          Math.abs(yOffset) + 100,
          127,
        )
        p.stroke(255, 127)
        p.quad(
          x,
          yCenter + yOffset,
          // 2
          x + n,
          p.map(
            yCenter + yOffset + 300,
            0,
            yCenter + yOffset + 300,
            0,
            h / 2,
          ),
          // 3
          x + n,
          yCenter - yOffset * 2,
          // 4
          x + n * 1.5,
          yCenter + yOffset + 3,
        )
        xx += dx
      }
    }
  }

  return {
    setup,
    draw,
    destroy() {
      controlPanel.destroy()
    },
    metadata: {
      name: 'sin2',
    },
  }
}
