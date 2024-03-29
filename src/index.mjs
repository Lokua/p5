import { $, uuid, P5Helpers, get } from './util.mjs'
import bus from './bus.mjs'
import defaultSketch from './sketches/sketch.mjs'

let canvasElement
let recording = false
let recorder = null

loadInitialSketch()

async function loadInitialSketch() {
  const lastSketch = localStorage.getItem('lastSketch')

  if (lastSketch) {
    try {
      const sketch = await import(
        sketchNameToPath(lastSketch)
      )
      new p5(init(sketch.default))
    } catch (error) {
      console.error(error)
      localStorage.removeItem('lastSketch')
      window.location.reload()
    }
  } else {
    new p5(init(defaultSketch))
  }
}

function init(sketch) {
  return (p) => {
    window.p = p

    const {
      draw,
      setup,
      metadata,
      destroy,
      preload,
    } = sketch(p, new P5Helpers(p))

    if (preload) {
      p.preload = preload
    }

    p.setup = () => {
      // turns 500x500 into 3000x3000
      // note: width and height of 500 renders a 1000x1000 image due to
      // default pixel density
      p.pixelDensity(6)
      const { canvas } = setup()
      canvas.parent('sketch')
      canvasElement = canvas.elt

      recorder = new CCapture({
        format: 'webm',
        timeLimit: 60,
        verbose: true,
        framerate: 24,
      })
    }

    p.draw = () => {
      draw()
      recorder.capture(canvasElement)
    }

    setupPage({
      p,
      metadata,
      destroy,
    })
  }
}

function setupPage({ p, metadata, destroy }) {
  const body = document.body
  const BLACK = 'rgb(0, 0, 0)'
  const WHITE = 'rgb(255, 255, 255)'
  const LIGHT_GRAY = 'rgb(200, 200, 200)'
  const GRAY = 'rgb(127, 127, 127)'
  const backgroundColors = [BLACK, GRAY, LIGHT_GRAY, WHITE]
  let backgroundColorIndex = initBg()

  const eventMap = {
    r: p.draw,
    s: save,
    b: changeBg,
    l: toggleLoop,
    d: debug,
  }

  addEventListeners()
  populateSketchesDropdown()

  function onKeyUp(e) {
    eventMap[e.key]?.()
  }

  async function populateSketchesDropdown() {
    const sketches = await get('/sketches')
    const sketchesSelect = $('#sketches-select')
    sketchesSelect.innerHTML = sketches
      .map((sketch) => {
        const name = sketch.replace('.mjs', '')
        return `<option value="${name}">${name}</option>`
      })
      .join('\n')
    sketchesSelect.value = localStorage.getItem(
      'lastSketch',
    )
  }

  function onSelectSketch(e) {
    loadSketch(e.target.value)
  }

  function initBg() {
    const storedBg =
      localStorage.getItem('backgroundColor') || BLACK
    setBg(storedBg)
    $('#controls').style.backgroundColor =
      localStorage.getItem('controlsBackgroundColor') ||
      '#444'
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
    const controlsBackgroundColor =
      backgroundColor === WHITE ||
      backgroundColor === LIGHT_GRAY
        ? '#ddd'
        : '#444'
    $(
      '#controls',
    ).style.backgroundColor = controlsBackgroundColor
    localStorage.setItem(
      'controlsBackgroundColor',
      controlsBackgroundColor,
    )
  }

  function setBg(color) {
    body.style.backgroundColor = color
  }

  function debug() {
    bus.emit('debug')
  }

  async function loadSketch(name) {
    destroy?.()
    removeEventListeners()
    p.remove()
    const sketch = await import(sketchNameToPath(name))
    new p5(init(sketch.default))
    localStorage.setItem('lastSketch', name)
  }

  async function onClickRecord() {
    if (!recording) {
      console.info('recording started')
      recording = true
      recorder.start()
      $('#record-button').textContent = 'RECORDING'
    } else {
      console.info('recording stopped')
      recording = false
      recorder.stop()
      recorder.save()
      $('#record-button').textContent = 'record'
    }
  }

  function addEventListeners() {
    $('#redraw-button').addEventListener('click', p.draw)
    $('#save-button').addEventListener('click', save)
    $('#bg-button').addEventListener('click', changeBg)
    $('#loop-button').addEventListener('click', toggleLoop)
    $('#debug-button').addEventListener('click', debug)
    $('#record-button').addEventListener(
      'click',
      onClickRecord,
    )
    $('#sketches-select').addEventListener(
      'change',
      onSelectSketch,
    )
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
    $('#record-button').removeEventListener(
      'click',
      onClickRecord,
    )
    $('#sketches-select').removeEventListener(
      'change',
      onSelectSketch,
    )
    body.removeEventListener('keyup', onKeyUp)
  }
}

function sketchNameToPath(name) {
  return `./sketches/${name}.mjs`
}
