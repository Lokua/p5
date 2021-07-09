import { $, isEven } from '../util.mjs'

/* @see https://processing.org/examples/sinewave.html */

export default function (p) {
  const [w, h] = [500, 500]
  let xx = 0

  // dynamic controls
  let period = 496
  let amplitude = 100
  let size = 100
  let frameRate = 30

  function setup() {
    addControls()
    const canvas = p.createCanvas(w, h)

    p.ellipseMode(p.CENTER)
    p.noLoop()

    return {
      canvas,
    }
  }

  function draw() {
    p.clear()
    p.background(0)
    p.frameRate(frameRate)

    const n = Math.floor(w / size)
    const dx = ((Math.PI * 2) / period) * n

    for (let x = -n; x < w - n; x += n) {
      const yCenter = h / 2
      const yOffset = p.sin(xx) * amplitude
      const vc = p.map(x, 0, w, 0, 127)
      p.fill(Math.abs(yOffset) + 10, vc, 100, 230)
      p.stroke(Math.abs(yOffset), vc, 50)
      if (isEven(x)) {
        p.ellipse(
          w - x,
          h - yCenter + yOffset,
          x / 4,
          x / 4,
        )
      } else {
        p.ellipse(x, yCenter + yOffset, x / 4, x / 4)
      }
      xx += dx
    }
  }

  function addControls() {
    const panel = $('#dynamic-controls')

    panel.innerHTML = `
      <div class="control size-control">
        <label>size (<span>${size}</span>)</label>
        <input 
          id="sin-size" 
          type="range" 
          min="1" 
          max="${w}" 
          step="1"
          value="${size}"
        >
      </div>
      <div class="control period-control">
        <label>frequency (<span>${period}</span>)</label>
        <input 
          id="sin-period" 
          type="range" 
          min="2" 
          max="1000" 
          step="1"
          value="${period}"
        >
      </div>
      <div class="control amp-control">
        <label>amplitude (<span>${amplitude}</span>)</label>
        <input 
          id="sin-amp" 
          type="range" 
          min="0" 
          max="${h / 2}" 
          value="${amplitude}"
        >
      </div>
      <div class="control frameRate-control">
        <label>frameRate (<span>${frameRate}</span>)</label>
        <input 
          id="sin-frameRate" 
          type="range" 
          min="1" 
          max="30" 
          value="${frameRate}"
        >
      </div>
    `

    const sizeValue = $('.size-control > label > span')
    $('#sin-size').addEventListener('input', (e) => {
      size = e.target.valueAsNumber
      sizeValue.textContent = size
      safeResume()
    })

    const ampValue = $('.amp-control > label > span')
    $('#sin-amp').addEventListener('input', (e) => {
      amplitude = e.target.valueAsNumber
      ampValue.textContent = amplitude
      safeResume()
    })

    const periodValue = $('.period-control > label > span')
    $('#sin-period').addEventListener('input', (e) => {
      period = e.target.valueAsNumber
      periodValue.textContent = period
      safeResume()
    })

    const frameRateValue = $(
      '.frameRate-control > label > span',
    )
    $('#sin-frameRate').addEventListener('input', (e) => {
      frameRate = e.target.valueAsNumber
      frameRateValue.textContent = frameRate
      safeResume()
    })

    function safeResume() {
      !p.isLooping() && draw()
    }
  }

  return {
    setup,
    draw,
    metadata: {
      name: 'sin3',
    },
  }
}
