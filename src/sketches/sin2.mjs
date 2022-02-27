import { $ } from '../util.mjs'

export default function (p) {
  const [w, h] = [1500, 1500]
  let xx = 0

  // dynamic controls
  let period = 496
  let amplitude = 100
  let size = 30

  function setup() {
    addControls()
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
    p.clear()
    p.background(0)
    const n = Math.floor(w / size)
    const dx = ((Math.PI * 2) / period) * n
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
        const yOffset = p.sin(xx) * amplitude
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

    function safeResume() {
      !p.isLooping() && draw()
    }
  }

  return {
    setup,
    draw,
    metadata: {
      name: 'sin2',
    },
  }
}
