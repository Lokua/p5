import { $, uuid } from './util.mjs'
import bus from './bus.mjs'
import sketch from './sketches/sketch.mjs'

let p5Instance = new p5(init(sketch))

function init(sketch) {
  return (p) => {
    const { draw, setup, metadata } = sketch(p)

    p.setup = () => {
      const { canvas } = setup()
      canvas.parent('sketch')
    }

    p.draw = draw

    setupPage(p, metadata)
  }
}

function setupPage(p, metadata) {
  const body = document.body
  const BLACK = 'rgb(0, 0, 0)'
  const WHITE = 'rgb(255, 255, 255)'
  const GRAY = 'rgb(127, 127, 127)'
  const backgroundColors = [BLACK, GRAY, WHITE]
  let backgroundColorIndex = initBg()

  const eventMap = {
    r: p.draw,
    s: save,
    b: changeBg,
    l: toggleLoop,
    d: debug,
  }

  addEventListeners()

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

    // turns 500x500 into 3000x300
    p.pixelDensity(6)

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

  async function onClickSketch(e) {
    if (e.target.tagName === 'LI') {
      removeEventListeners()
      p5Instance.remove()
      const { default: sketch } = await import(
        `./sketches/${e.target.textContent}.mjs`
      )
      p5Instance = new p5(init(sketch))
    }
  }

  function addEventListeners() {
    $('#redraw-button').addEventListener('click', p.draw)
    $('#save-button').addEventListener('click', save)
    $('#bg-button').addEventListener('click', changeBg)
    $('#loop-button').addEventListener('click', toggleLoop)
    $('#debug-button').addEventListener('click', debug)
    $('#sketches').addEventListener('click', onClickSketch)
    body.addEventListener('keyup', onKeyUp)
  }

  function removeEventListeners() {
    $('#redraw-button').removeEventListener('click', p.draw)
    $('#save-button').removeEventListener('click', save)
    $('#bg-button').removeEventListener('click', changeBg)
    $('#loop-button').removeEventListener(
      'click',
      toggleLoop,
    )
    $('#debug-button').removeEventListener('click', debug)
    $('#sketches').removeEventListener(
      'click',
      onClickSketch,
    )
    body.removeEventListener('keyup', onKeyUp)
  }
}
