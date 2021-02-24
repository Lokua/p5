import sketch from './sketch.mjs'

new p5(main)

function main(p) {
  const { draw, setup } = sketch(p)

  p.setup = () => {
    const { canvas } = setup()
    canvas.parent('sketch')
  }

  p.draw = draw

  setupPage({
    draw: p.draw,
  })
}

function setupPage(p) {
  const BLACK = 'rgb(0, 0, 0)'
  const WHITE = 'rgb(255, 255, 255)'

  document.body.style.backgroundColor = localStorage.getItem('bg') || BLACK

  document.getElementById('redraw-button').addEventListener('click', p.draw)

  document.getElementById('bg').addEventListener('click', () => {
    document.body.style.backgroundColor =
      document.body.style.backgroundColor === BLACK ? WHITE : BLACK
    localStorage.setItem('bg', document.body.style.backgroundColor)
  })

  document.body.addEventListener('keyup', (e) => {
    if (e.key === 'r') {
      p.draw()
    }
  })
}
