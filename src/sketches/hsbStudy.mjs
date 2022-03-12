import ControlPanel, {
  Range,
} from '../ControlPanel/index.mjs'

export default function hsbStudy(p) {
  const [w, h] = [500, 500]

  const controlPanel = new ControlPanel({
    controls: {
      count: new Range({
        name: 'count',
        value: 20,
      }),
      hue: new Range({
        name: 'hue',
        value: 0,
      }),
      saturation: new Range({
        name: 'saturation',
        value: 100,
      }),
      lightness: new Range({
        name: 'lightness',
        value: 100,
      }),
    },
    inputHandler() {
      !p.isLooping() && draw()
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)
    p.noLoop()
    p.rectMode(p.CENTER)
    p.colorMode(p.HSB, 100)

    return {
      canvas,
    }
  }

  function draw() {
    const {
      count: n,
      // eslint-disable-next-line no-unused-vars
      hue,
      saturation,
      lightness,
    } = controlPanel.values()
    p.background(255)

    const colors1 = Array(n)
      .fill()
      .map((_, i) =>
        p.color(
          Math.abs(p.map(i, 0, n, 0, 100)),
          saturation,
          lightness,
        ),
      )

    const colors2 = Array(n)
      .fill()
      .map((_, i) =>
        p.color(
          Math.abs(p.map(i, 0, n, 100, 0)),
          saturation,
          lightness,
        ),
      )

    const colors3 = Array(n)
      .fill()
      .map((_, i) =>
        p.color(
          Math.abs(
            i >= n / 2
              ? p.map(i, 0, n / 2, 0, 50)
              : p.map(i, 0, n, 100, 0),
          ),
          saturation,
          lightness,
        ),
      )

    for (let x = n, i = 0; x < w; x += n, i++) {
      try {
        p.fill(colors1[i])
        p.rect(x, n, n, n)

        p.fill(colors2[i])
        p.rect(x, n * 2, n, n)

        p.fill(colors3[i])
        p.rect(x, n * 3, n, n)
      } catch (error) {
        console.log(i)
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
      name: 'hsbStudy',
    },
  }
}
