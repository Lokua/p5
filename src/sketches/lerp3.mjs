import ControlPanel, {
  Range,
} from '../ControlPanel/index.mjs'
// import Counter from '../Counter.mjs'
import { mapTimes, isOdd } from '../util.mjs'

export default function lerp3(p) {
  const [w, h] = [500, 500]

  const noiseList = mapTimes(w * h, (i) =>
    p.noise(i * w * h),
  )

  const controlPanel = new ControlPanel({
    id: 'lerp3',
    attemptReload: true,
    controls: {
      nLines: new Range({
        name: 'nLines',
        value: 100,
        min: 3,
        max: 100,
      }),
      size: new Range({
        name: 'size',
        value: 1,
        min: 1,
        max: 100,
      }),
      segmentCount: new Range({
        name: 'segmentCount',
        value: 4,
        min: 4,
        max: 100,
        step: 2,
      }),
      noiseOffset: new Range({
        name: 'noiseOffset',
        value: 2,
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
    const canvas = p.createCanvas(w, h)

    p.colorMode(p.HSB, 1)
    p.noStroke()

    return {
      canvas,
    }
  }

  function draw() {
    const {
      nLines,
      size,
      segmentCount,
      noiseOffset,
    } = controlPanel.values()

    p.background(1, 0.02, 1)
    p.stroke(1, 0, 0)
    p.strokeWeight(size)

    const segmentLength = Math.floor(w / segmentCount)
    const pivotStretch = 4

    for (let y = 0; y < h; y += Math.floor(h / nLines)) {
      for (
        let x = 0, i = 0;
        x < w;
        x += segmentLength, i++
      ) {
        const pivotY =
          y +
          pivotStretch +
          noiseList[y % noiseList.length] * noiseOffset

        if (i !== 0 && isOdd(i)) {
          p.line(x, y, x + segmentLength, pivotY)
        } else {
          p.line(x, pivotY, x + segmentLength, y)
        }
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
      name: 'lerp3',
    },
  }
}
