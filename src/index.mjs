import { uuid } from './util.mjs'
import sketch from './sketches/grid4.mjs'

new p5(main)

function main(p) {
  const { draw, setup, metadata } = sketch(p)

  p.setup = () => {
    const { canvas } = setup()
    canvas.parent('sketch')
  }

  p.draw = draw

  setupPage(p, metadata)
}

function setupPage(p, metadata) {
  const BLACK = 'rgb(0, 0, 0)'
  const WHITE = 'rgb(255, 255, 255)'

  document.body.style.backgroundColor = localStorage.getItem('bg') || BLACK

  const save = () => {
    const id = uuid()
    p.saveCanvas(`${metadata.name}-${id}`, 'png')
  }

  const toggleBg = () => {
    document.body.style.backgroundColor =
      document.body.style.backgroundColor === BLACK ? WHITE : BLACK
    localStorage.setItem('bg', document.body.style.backgroundColor)
  }

  document.getElementById('redraw-button').addEventListener('click', p.draw)
  document.getElementById('save-button').addEventListener('click', save)
  document.getElementById('bg-button').addEventListener('click', toggleBg)

  document.body.addEventListener('keyup', (e) => {
    if (e.key === 'd') {
      p.draw()
    } else if (e.key === 's') {
      save()
    } else if (e.key === 'b') {
      toggleBg()
    }
  })
}
