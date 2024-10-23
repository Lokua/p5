// @ts-check
import { $, uuid, P5Helpers, get } from './util.mjs'
import bus from './bus.mjs'
import defaultSketch from './sketches/sketch.mjs'

let recording = false
let defaultPixelDensity
let maxRecordingFrames
const recordingDurationSeconds = 60
let frames = []
let frameRate

// TODO: find a better way
let stopRecording_

loadInitialSketch()

async function loadInitialSketch() {
  const lastSketch = localStorage.getItem('lastSketch')

  if (lastSketch) {
    try {
      const sketch = await import(sketchNameToPath(lastSketch))
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
  /**
   * @param {import("p5")} p
   */
  return (p) => {
    window.p = p

    const { draw, setup, metadata, destroy, preload } = sketch(
      p,
      new P5Helpers(p),
    )

    if (preload) {
      p.preload = preload
    }

    p.setup = () => {
      frameRate = metadata.frameRate || 24
      defaultPixelDensity = p.pixelDensity()
      // p.pixelDensity(2)
      const { canvas } = setup()
      p.frameRate(frameRate)
      canvas.parent('sketch')
      maxRecordingFrames = recordingDurationSeconds * frameRate
    }

    p.draw = () => {
      if (recording) {
        captureFrame(p)
        if (p.frameCount >= maxRecordingFrames) {
          stopRecording_()
        }
      }
      draw()
    }

    setupPage({
      p,
      metadata,
      destroy,
    })
  }
}

function captureFrame(p) {
  const image = p.createImage(p.width, p.height)
  image.copy(p, 0, 0, p.width, p.height, 0, 0, p.width, p.height)
  frames.push(image)
}

async function sendFramesToBackend() {
  console.log('Converting frames...')
  const formData = new FormData()

  formData.append('name', localStorage.getItem('lastSketch') || 'recording')
  formData.append('frameRate', frameRate)

  // Convert to base64 URL
  frames.forEach((frame, index) => {
    const imgDataUrl = frame.canvas.toDataURL()
    formData.append(`frame-${index}`, imgDataUrl)
  })

  // Send the data to the backend (implementation depends on your backend)
  await fetch('/upload-frames', {
    method: 'POST',
    body: formData,
  })

  console.log('Frames sent to the backend. Check backend logs for progress.')
}

function setupPage({ p, metadata, destroy }) {
  stopRecording_ = stopRecording
  const body = document.body
  const backgroundColors = [
    'rgb(0, 0, 0)',
    'rgb(127, 127, 127)',
    'rgb(200, 200, 200)',
    'rgb(255, 255, 255)',
  ]
  let backgroundColorIndex = initBackground()

  const eventMap = {
    r: p.draw,
    s: save,
    b: changeBackground,
    l: toggleLoop,
    d: debug,
  }

  initialize()

  function initialize() {
    addEventListeners()
    populateSketchesDropdown()
    setTimeout(() => {
      updateLabelColors(backgroundColorIndex)
    }, 100)
  }

  function onKeyUp(e) {
    eventMap[e.key]?.()
  }

  async function populateSketchesDropdown() {
    const sketches = await get('/sketches')
    const sketchesSelect = $('#sketches-select')
    sketchesSelect.innerHTML = sketches
      .map((sketch) => {
        const sketchName = sketch.replace('.mjs', '')
        return `<option value="${sketchName}">${sketchName}</option>`
      })
      .join('\n')
    sketchesSelect.value = localStorage.getItem('lastSketch')
  }

  function onSelectSketch(e) {
    loadSketch(e.target.value)
  }

  function initBackground() {
    const storedBg =
      localStorage.getItem('backgroundColor') || backgroundColors[0]
    setBackground(storedBg)
    setControlsBackground(
      localStorage.getItem('controlsBackgroundColor') || '#444',
    )
    return backgroundColors.indexOf(storedBg)
  }

  async function save() {
    const id = uuid()
    const defaultDensity = p.pixelDensity() // Save the default pixel density
    p.pixelDensity(6)
    setTimeout(() => {
      p.saveCanvas(`${metadata.name}-${id}`, 'png')
      p.pixelDensity(defaultDensity)
    }, 100)
  }

  function toggleLoop() {
    p.isLooping() ? p.noLoop() : p.loop()
  }

  function changeBackground() {
    backgroundColorIndex = (backgroundColorIndex + 1) % backgroundColors.length
    const backgroundColor = backgroundColors[backgroundColorIndex]
    setBackground(backgroundColor)
    localStorage.setItem('backgroundColor', backgroundColor)

    const isDark = [backgroundColors[2], backgroundColors[3]].includes(
      backgroundColor,
    )

    const controlsBackgroundColor = isDark ? '#ddd' : '#444'

    setControlsBackground(controlsBackgroundColor)
    localStorage.setItem('controlsBackgroundColor', controlsBackgroundColor)

    updateLabelColors(backgroundColorIndex)

    document.documentElement.style.colorScheme = isDark ? 'light' : 'dark'
  }

  function setBackground(color) {
    body.style.backgroundColor = color
  }

  function setControlsBackground(color) {
    $('#controls').style.backgroundColor = color
  }

  function updateLabelColors(bgIndex) {
    const labelColorIndex =
      (bgIndex - 2 + backgroundColors.length) % backgroundColors.length
    const labelColor = backgroundColors[labelColorIndex]

    document.querySelectorAll('label').forEach((label) => {
      label.style.color = labelColor
    })
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
    addEventListeners()
  }

  async function onClickRecord() {
    if (!recording) {
      startRecording()
    } else {
      stopRecording()
    }
  }

  function onReset() {
    p.frameCount = 0
  }

  function startRecording() {
    console.info('recording started')
    recording = true
    p.frameCount = 0
    frames = []
    $('#record-button').textContent = 'RECORDING'
  }

  function stopRecording() {
    console.info('recording stopped')
    recording = false
    $('#record-button').textContent = 'record'
    sendFramesToBackend()
  }

  function addEventListeners() {
    $('#redraw-button').addEventListener('click', p.draw)
    $('#save-button').addEventListener('click', save)
    $('#bg-button').addEventListener('click', changeBackground)
    $('#loop-button').addEventListener('click', toggleLoop)
    $('#debug-button').addEventListener('click', debug)
    $('#record-button').addEventListener('click', onClickRecord)
    $('#sketches-select').addEventListener('change', onSelectSketch)
    $('#reset-button').addEventListener('click', onReset)
    body.addEventListener('keyup', onKeyUp)
  }

  function removeEventListeners() {
    $('#redraw-button').removeEventListener('click', p.draw)
    $('#save-button').removeEventListener('click', save)
    $('#bg-button').removeEventListener('click', changeBackground)
    $('#loop-button').removeEventListener('click', toggleLoop)
    $('#debug-button').removeEventListener('click', debug)
    $('#record-button').removeEventListener('click', onClickRecord)
    $('#sketches-select').removeEventListener('change', onSelectSketch)
    $('#reset-button').addEventListener('click', onReset)
    body.removeEventListener('keyup', onKeyUp)
  }
}

function sketchNameToPath(name) {
  return `./sketches/${name}.mjs`
}
