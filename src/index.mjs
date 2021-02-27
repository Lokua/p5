import { $, uuid } from './util.mjs'
import sketch from './sketches/sin.mjs'

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
  const body = document.body
  const BLACK = 'rgb(0, 0, 0)'
  const WHITE = 'rgb(255, 255, 255)'

  setBg(localStorage.getItem('bg') || BLACK)

  $('#redraw-button').addEventListener('click', p.draw)
  $('#save-button').addEventListener('click', save)
  $('#bg-button').addEventListener('click', toggleBg)
  $('#loop-button').addEventListener('click', toggleLoop)
  body.addEventListener('keyup', onKeyUp)

  const eventMap = {
    d: p.draw,
    s: save,
    b: toggleBg,
    l: toggleLoop,
  }

  function onKeyUp(e) {
    eventMap[e] && eventMap[e]()
  }

  function save() {
    const id = uuid()
    p.saveCanvas(`${metadata.name}-${id}`, 'png')
  }

  function toggleLoop() {
    p.isLooping() ? p.noLoop() : p.loop()
  }

  function toggleBg() {
    const bg = getBg()
    setBg(bg === BLACK ? WHITE : BLACK)
    localStorage.setItem('bg', bg)
  }

  function setBg(color) {
    body.style.backgroundColor = color
  }

  function getBg() {
    return body.style.backgroundColor
  }
}
