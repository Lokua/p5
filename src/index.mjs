import 'p5'
import { findPortByName, getPorts, isStart, statusMap } from '@lokua/midi-util'
import { $, get, logInfo, uuid } from './util.mjs'
import SketchManager from './SketchManager.mjs'

const defaultSketch = 'gridTemplate'
const backgroundColors = ['#000000', '#7F7F7F', '#C8C8C8', '#FFFFFF']
let backgroundColorIndex = 0
let recording = false
let midiInputPort
let midiOutputPort

const sketchManager = new SketchManager('sketch', () => midiInputPort)

initialize()

async function initialize() {
  await initMidi()
  setupEventListeners()
  initBackground()
  await Promise.all([
    loadSketch(localStorage.getItem('lastSketch')),
    populateSketchesDropdown(),
  ])
}

async function initMidi() {
  const { inputs, outputs } = await getPorts()
  midiInputPort = findPortByName('IAC Driver p5 to', inputs)
  midiOutputPort = findPortByName('IAC Driver p5 from', outputs)
  if (!midiInputPort) {
    console.warn(
      '[initMidi] Failed to find "IAC Driver p5 to port". Inputs:',
      inputs,
    )
  } else {
    midiInputPort.addEventListener('midimessage', onMidiMessage)
  }
  if (!midiOutputPort) {
    console.warn(
      '[initMidi] Failed to find "IAC Driver p5 from port". Outputs:',
      outputs,
    )
  }
}

function onMidiMessage(e) {
  const [status] = e.data

  if (isStart(status)) {
    logInfo('Received midi start message. Resetting frameCount.')
    resetSketch()
  }
}

function setupEventListeners() {
  $('#redraw-button').addEventListener('click', () => {
    sketchManager.getCurrentP5()?.redraw()
  })
  $('#save-button').addEventListener('click', saveCanvas)
  $('#bg-button').addEventListener('click', changeBackground)
  $('#loop-button').addEventListener('click', toggleLoop)
  $('#record-button').addEventListener('click', onClickRecord)
  $('#sketches-select').addEventListener('change', (e) => {
    loadSketch(e.target.value)
  })
  $('#reset-button').addEventListener('click', resetSketch)
  $('#midi-start').addEventListener('click', sendExternalStart)
  document.body.addEventListener('keyup', onKeyUp)
}

async function loadSketch(name) {
  try {
    await sketchManager.loadSketch(name)
    localStorage.setItem('lastSketch', name)
  } catch (error) {
    console.error(error)
    logInfo('Falling back to default sketch', defaultSketch)
    await sketchManager.loadSketch(defaultSketch)
    localStorage.setItem('lastSketch', defaultSketch)
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

function onKeyUp(e) {
  const p = sketchManager.getCurrentP5()
  if (!p) return
  switch (e.key) {
    case 'd':
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
    case 'r':
      resetSketch()
      break
    case 'p':
      sendExternalStart()
      break
    case 'm':
      configureTransportMappings()
      break
    default:
      break
  }
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

function saveCanvas() {
  const p = sketchManager.getCurrentP5()
  const metadata = sketchManager.getCurrentSketch()?.metadata
  if (p && metadata) {
    const id = uuid()
    const fileName = `${metadata.name}-${id}`
    p.saveCanvas(fileName, 'png')
  }
}

async function sendFramesToBackend(frames) {
  logInfo('Converting frames...')
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
  logInfo('Frames sent to the backend.')
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

function updateLabelColors() {
  const labelColorIndex =
    (backgroundColorIndex - 2 + backgroundColors.length) %
    backgroundColors.length
  const labelColor = backgroundColors[labelColorIndex]
  document.querySelectorAll('label').forEach((label) => {
    label.style.color = labelColor
  })
}

function sendExternalStart() {
  if (midiOutputPort) {
    // Ableton cannot be started remotely via START unless it is also synced :(
    midiOutputPort.send([statusMap.get('controlChange') + 15, 1, 127])
    setTimeout(() => {
      midiOutputPort.send([statusMap.get('controlChange') + 15, 0, 127])
    }, 100)
  } else {
    console.warn('[sendExternalStart] `midiOutputPort` is undefined')
  }
}

function configureTransportMappings() {
  if (midiOutputPort) {
    const dialog = $('#midi-mappings')
    dialog.showModal()

    const startButton = $('#midi-mappings-start')
    const stopButton = $('#midi-mappings-stop')
    const exitButton = $('#midi-mappings-exit')

    const onClickStart = () =>
      midiOutputPort.send([statusMap.get('controlChange') + 15, 0, 127])
    startButton.addEventListener('click', onClickStart)

    const onClickStop = () =>
      midiOutputPort.send([statusMap.get('controlChange') + 15, 1, 127])
    stopButton.addEventListener('click', onClickStop)

    const onClose = () => {
      dialog.close()
      startButton.removeEventListener('click', onClickStart)
      stopButton.removeEventListener('click', onClose)
      exitButton.removeEventListener('click', onClickStop)
    }
    exitButton.addEventListener('click', onClose)
  } else {
    console.warn('[configureTransportMappings] `midiOutputPort` is undefined')
  }
}
