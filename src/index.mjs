import { $, get, uuid } from './util.mjs'
import SketchManager from './SketchManager.mjs'

const sketchManager = new SketchManager('sketch')
const defaultSketch = 'gridTemplate'
let recording = false
const backgroundColors = [
  'rgb(0, 0, 0)',
  'rgb(127, 127, 127)',
  'rgb(200, 200, 200)',
  'rgb(255, 255, 255)',
]
let backgroundColorIndex = 0

initialize()

async function initialize() {
  setupEventListeners()
  initBackground()
  await loadSketch(localStorage.getItem('lastSketch'))
  await populateSketchesDropdown()
}

async function loadSketch(name) {
  try {
    await sketchManager.loadSketch(name)
    localStorage.setItem('lastSketch', name)
  } catch (error) {
    await sketchManager.loadSketch(defaultSketch)
    localStorage.setItem('lastSketch', defaultSketch)
  }
}

function setupEventListeners() {
  $('#redraw-button').addEventListener('click', () => {
    sketchManager.getCurrentP5()?.redraw()
  })
  $('#save-button').addEventListener('click', saveCanvas)
  $('#bg-button').addEventListener('click', changeBackground)
  $('#loop-button').addEventListener('click', toggleLoop)
  $('#debug-button').addEventListener('click', debug)
  $('#record-button').addEventListener('click', onClickRecord)
  $('#sketches-select').addEventListener('change', (e) => {
    loadSketch(e.target.value)
  })
  $('#reset-button').addEventListener('click', resetSketch)
  document.body.addEventListener('keyup', onKeyUp)
}

function toggleLoop() {
  const p = sketchManager.getCurrentP5()
  if (p) {
    p.isLooping() ? p.noLoop() : p.loop()
  }
}

function resetSketch() {
  const p = sketchManager.getCurrentP5()
  if (p) {
    p.frameCount = 0
  }
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
  sketchesSelect.value = localStorage.getItem('lastSketch') || defaultSketch
}

function onClickRecord() {
  if (!recording) {
    startRecording()
  } else {
    stopRecording()
  }
}

function startRecording() {
  recording = true
  sketchManager.startRecording()
  $('#record-button').textContent = 'RECORDING'
}

async function stopRecording() {
  recording = false
  const frames = sketchManager.stopRecording()
  await sendFramesToBackend(frames)
  $('#record-button').textContent = 'record'
}

async function sendFramesToBackend(frames) {
  console.log('Converting frames...')
  const formData = new FormData()
  const sketchName = sketchManager.getSketchName() || 'recording'
  formData.append('name', sketchName)
  formData.append('frameRate', sketchManager.getFrameRate().toString())
  frames.forEach((frame, index) => {
    const imgDataUrl = frame.canvas.toDataURL()
    formData.append(`frame-${index}`, imgDataUrl)
  })
  await fetch('/upload-frames', {
    method: 'POST',
    body: formData,
  })
  console.log('Frames sent to the backend.')
}

function saveCanvas() {
  const p = sketchManager.getCurrentP5()
  const metadata = sketchManager.getCurrentSketch()?.metadata
  if (p && metadata) {
    const id = uuid()
    const fileName = `${metadata.name}-${id}`
    p.saveCanvas(fileName, 'png')
  }
}

function onKeyUp(e) {
  const p = sketchManager.getCurrentP5()
  if (!p) return
  switch (e.key) {
    case 'r':
      p.redraw()
      break
    case 's':
      saveCanvas()
      break
    case 'b':
      changeBackground()
      break
    case 'l':
      toggleLoop()
      break
    case 'd':
      debug()
      break
    default:
      break
  }
}

function changeBackground() {
  backgroundColorIndex = (backgroundColorIndex + 1) % backgroundColors.length
  const backgroundColor = backgroundColors[backgroundColorIndex]
  document.body.style.backgroundColor = backgroundColor
  localStorage.setItem('backgroundColor', backgroundColor)
  const isDark = [backgroundColors[2], backgroundColors[3]].includes(
    backgroundColor,
  )
  const controlsBackgroundColor = isDark ? '#ddd' : '#444'
  $('#controls').style.backgroundColor = controlsBackgroundColor
  localStorage.setItem('controlsBackgroundColor', controlsBackgroundColor)
  updateLabelColors(backgroundColorIndex)
  document.documentElement.style.colorScheme = isDark ? 'light' : 'dark'
}

function initBackground() {
  const storedBg =
    localStorage.getItem('backgroundColor') || backgroundColors[0]
  backgroundColorIndex = backgroundColors.indexOf(storedBg)
  document.body.style.backgroundColor = storedBg
  $('#controls').style.backgroundColor =
    localStorage.getItem('controlsBackgroundColor') || '#444'
  updateLabelColors()
}

function updateLabelColors() {
  const labelColorIndex =
    (backgroundColorIndex - 2 + backgroundColors.length) %
    backgroundColors.length
  const labelColor = backgroundColors[labelColorIndex]
  document.querySelectorAll('label').forEach((label) => {
    label.style.color = labelColor
  })
}

function debug() {
  console.debug('Debugging...')
}
