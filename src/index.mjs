import { $, uuid } from './util.mjs'
import bus from './bus.mjs'
import sketch from './sketches/sketch.mjs'

loadInitialSketch()

async function loadInitialSketch() {
  const lastSketch = localStorage.getItem('lastSketch')

  if (lastSketch) {
    const sketch = await import(
      sketchNameToPath(lastSketch)
    )
    new p5(init(sketch.default))
  } else {
    new p5(init(sketch))
  }
}

function init(sketch) {
  return (p) => {
    const { draw, setup, metadata, destroy } = sketch(p)

    p.setup = () => {
      // turns 500x500 into 3000x3000
      // note: width and height of 500 renders a 1000x1000 image due to
      // default pixel density
      p.pixelDensity(6)
      const { canvas } = setup()
      canvas.parent('sketch')
    }

    p.draw = draw

    setupPage({ p, metadata, destroy })
  }
}

function setupPage({ p, metadata, destroy }) {
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
  applyActiveClassToLastLoadedSketch()

  function onKeyUp(e) {
    eventMap[e.key]?.()
  }

  function applyActiveClassToLastLoadedSketch() {
    document
      .querySelectorAll('#sketches li')
      .forEach((element) => {
        if (element.textContent === metadata.name) {
          element.classList.add('active')
        }
      })
  }

  function initBg() {
    const storedBg =
      localStorage.getItem('backgroundColor') || BLACK
    setBg(storedBg)
    return backgroundColors.indexOf(storedBg)
  }

  async function save() {
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

  async function onClickSketch(e) {
    if (e.target.tagName === 'LI') {
      loadSketch(e.target.textContent)
      const lastActiveElement = document.querySelector(
        '#sketches .active',
      )
      lastActiveElement?.classList?.remove('active')
      e.target.classList.add('active')
    }
  }

  async function loadSketch(name) {
    destroy?.()
    removeEventListeners()
    p.remove()
    const sketch = await import(sketchNameToPath(name))
    new p5(init(sketch.default))
    localStorage.setItem('lastSketch', name)
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

function sketchNameToPath(name) {
  return `./sketches/${name}.mjs`
}
