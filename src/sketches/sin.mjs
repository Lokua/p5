import { $, cross } from '../util.mjs'

/* @see https://processing.org/examples/sinewave.html */

export default function (p) {
  const [w, h] = [500, 500]
  let xx = 0

  // dynamic controls
  let period = 496
  let amplitude = 100
  let size = 100

  function setup() {
    addControls()
    const canvas = p.createCanvas(w, h)

    p.ellipseMode(p.CENTER)
    p.noStroke()

    return {
      canvas,
    }
  }

  function draw() {
    p.clear()
    p.background(0)

    const n = Math.floor(w / size)
    const dx = ((Math.PI * 2) / period) * n

    for (let x = n; x < w; x += n) {
      const yCenter = h / 2
      const yOffset = p.sin(xx) * amplitude
      p.fill(200, 0, Math.abs(yOffset) + 100)
      p.ellipse(x, yCenter + yOffset, n, n)
      xx += dx
    }
  }

  function addControls() {
    const panel = $('#dynamic-controls')

    panel.innerHTML = `
      <div class="control">
        <label>size</label>
        <input 
          id="sin-size" 
          type="range" 
          min="1" 
          max="${w}" 
          step="1"
          value="${size}"
        >
      </div>
      <div class="control">
        <label>frequency</label>
        <input 
          id="sin-period" 
          type="range" 
          min="2" 
          max="1000" 
          step="1"
          value="${period}"
        >
      </div>
      <div class="control">
        <label>amplitude</label>
        <input 
          id="sin-amp" 
          type="range" 
          min="0" 
          max="${h / 2}" 
          value="${amplitude}"
        >
      </div>
    `

    $('#sin-size').addEventListener('input', (e) => {
      size = e.target.valueAsNumber
      safeResume()
    })

    $('#sin-amp').addEventListener('input', (e) => {
      amplitude = e.target.valueAsNumber
      safeResume()
    })

    $('#sin-period').addEventListener('input', (e) => {
      period = e.target.valueAsNumber
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
      name: 'sin',
    },
  }
}
