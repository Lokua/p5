import { $, uuid } from './util.mjs'
import bus from './bus.mjs'
import sketch from './sketches/sin3.mjs'

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
  const GRAY = 'rgb(127, 127, 127)'
  const backgroundColors = [BLACK, GRAY, WHITE]
  let backgroundColorIndex = initBg()

  $('#redraw-button').addEventListener('click', p.draw)
  $('#save-button').addEventListener('click', save)
  $('#bg-button').addEventListener('click', changeBg)
  $('#loop-button').addEventListener('click', toggleLoop)
  $('#debug-button').addEventListener('click', debug)
  body.addEventListener('keyup', onKeyUp)

  const eventMap = {
    r: p.draw,
    s: save,
    b: changeBg,
    l: toggleLoop,
    d: debug,
  }

  function onKeyUp(e) {
    eventMap[e.key]?.()
  }

  function initBg() {
    const storedBg =
      localStorage.getItem('backgroundColor') || BLACK
    setBg(storedBg)
    return backgroundColors.indexOf(storedBg)
  }

  function save() {
    const id = uuid()
    p.saveCanvas(`${metadata.name}-${id}`, 'png')
  }

  function toggleLoop() {
    p.isLooping() ? p.noLoop() : p.loop()
  }

  function changeBg() {
    backgroundColorIndex =
      (backgroundColorIndex + 1) % backgroundColors.length
    const backgroundColor =
      backgroundColors[backgroundColorIndex]
    setBg(backgroundColor)
    localStorage.setItem('backgroundColor', backgroundColor)
  }

  function setBg(color) {
    body.style.backgroundColor = color
  }

  function debug() {
    bus.emit('debug')
  }
}
