import { uuid } from './util.mjs'
import sketch from './sketches/grid2.mjs'

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

  const save = () => p.saveCanvas(`${metadata.name}-${uuid()}`, 'png')

  document.body.style.backgroundColor = localStorage.getItem('bg') || BLACK

  document.getElementById('redraw-button').addEventListener('click', p.draw)
  document.getElementById('save-button').addEventListener('click', save)

  document.getElementById('bg-button').addEventListener('click', () => {
    document.body.style.backgroundColor =
      document.body.style.backgroundColor === BLACK ? WHITE : BLACK
    localStorage.setItem('bg', document.body.style.backgroundColor)
  })

  document.body.addEventListener('keyup', (e) => {
    if (e.key === 'r') {
      p.draw()
    } else if (e.key === 's') {
      save()
    }
  })
}
