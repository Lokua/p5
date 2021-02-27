import { $, cross } from '../util.mjs'

/* @see https://processing.org/examples/sinewave.html */

export default function (p) {
  const [w, h] = [500, 500]
  const n = Math.floor(w / 250)
  const period = 100
  const dx = ((Math.PI * 2) / period) * n
  let xx = 0

  // dynamic controls
  let amplitude = 100

  function setup() {
    addControls()
    const canvas = p.createCanvas(w, h)

    p.background(0)
    p.ellipseMode(p.CENTER)
    const color = p.color(200, 0, 180)
    p.stroke(color)
    p.fill(color)

    return {
      canvas,
    }
  }

  function draw() {
    p.clear()
    for (let x = n; x < w; x += n) {
      const yCenter = h / 2
      const yOffset = p.sin(xx) * (amplitude * p.noise(x))
      p.ellipse(x, yCenter + yOffset, n, n)
      xx += dx
    }
  }

  function addControls() {
    const panel = $('#dynamic-controls')
    panel.innerHTML = `
      <div class="control">
        <label>amplitude</label>
        <input 
          id="sin-amp" 
          type="range" 
          min="0" 
          max="${h}" 
          value="${amplitude}"
        >
      </div>
    `
    const amp = $('#sin-amp')
    amp.addEventListener('input', (e) => {
      amplitude = e.target.valueAsNumber
    })
  }

  return {
    setup,
    draw,
    metadata: {
      name: 'sin',
    },
  }
}
