import 'p5'
import { findPortByName, getPorts, isStart, statusMap } from '@lokua/midi-util'
import { $, formatLog, get, logInfo, uuid } from './util.mjs'
import SketchManager from './SketchManager.mjs'
import bus from './lib/bus.mjs'

// experimental; requires redraw, not ideal
const INCREASE_DENSITY_ON_SAVE = false
const LOAD_DEFAULT_SKETCH_ON_FAIL = false

const defaultSketch = 'ztudy__circleOfCircles'
const themes = ['theme-white', 'theme-light', 'theme-dark', 'theme-black']
let recording = false
let recordingQueued = false
let midiInputPort
let midiOutputPort

const sketchManager = new SketchManager('sketch', () => midiInputPort)

initialize()

async function initialize() {
  await initMidi()
  setupEventListeners()
  initBackground()
  await Promise.all([
    loadSketch(localStorage.getItem('@lokua/p5/lastSketch')),
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
  $('#que-record-button').addEventListener('click', onClickQueRecord)
  $('#sketches-select').addEventListener('change', (e) => {
    loadSketch(e.target.value)
  })
  $('#reset-button').addEventListener('click', resetSketch)
  $('#midi-start').addEventListener('click', sendExternalStart)
  $('#clear-storage').addEventListener('click', clearStorage)
  document.body.addEventListener('keyup', onKeyUp)
}

async function loadSketch(name) {
  try {
    await sketchManager.loadSketch(name)
    localStorage.setItem('@lokua/p5/lastSketch', name)
  } catch (error) {
    console.error(error)
    if (LOAD_DEFAULT_SKETCH_ON_FAIL) {
      logInfo('Falling back to default sketch', defaultSketch)
      await sketchManager.loadSketch(defaultSketch)
      localStorage.setItem('@lokua/p5/lastSketch', defaultSketch)
    }
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
  sketchesSelect.value =
    localStorage.getItem('@lokua/p5/lastSketch') || defaultSketch
}

function onKeyUp(e) {
  const p = sketchManager.getCurrentP5()
  if (!p) {
    return
  }
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
    bus.emit('resetSketch')
  }
}

function clearStorage() {
  const path = `@lokua/p5/controlPanel/${sketchManager.currentSketchName}`
  localStorage.removeItem(path)
  window.location.reload()
}

function onClickRecord() {
  if (!recording) {
    startRecording()
  } else {
    stopRecording()
  }
}

function onClickQueRecord() {
  recordingQueued = true
  logInfo('Recording queued')
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
    const originalDensity = p.pixelDensity()

    if (INCREASE_DENSITY_ON_SAVE) {
      // Set pixel density to achieve 3000x3000 output from 500x500 canvas
      // 500 * 6 = 3000
      p.pixelDensity(6)

      // This unfortunately is needed or we'll get a blank image :(
      // dafuq
      if (!p.isLooping()) {
        p.loop()
        p.redraw()
        p.noLoop()
      } else {
        p.redraw()
      }

      p.saveCanvas(fileName, 'png')
      p.pixelDensity(originalDensity)
    } else {
      if (p.pixelDensity() <= 2) {
        console.warn(
          formatLog(`
            You are saving at pixelDensity <= 2 
            which you probably don't want.
            Export pixelDensity=6 in sketch metadata to 
            turn 500x canvas to 3000x image
          `),
        )
      }
      p.saveCanvas(fileName, 'png')
    }
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
  const defaultTheme = 'theme-dark'
  const storedClass = localStorage.getItem('@lokua/p5/theme') || defaultTheme
  const theme = themes.includes(storedClass) ? storedClass : defaultTheme
  document.body.classList.add(theme)
  localStorage.setItem('@lokua/p5/theme', theme)
}

function changeBackground() {
  const currentTheme = localStorage.getItem('@lokua/p5/theme') || 'theme-dark'
  const currentIndex = themes.indexOf(currentTheme)
  const className = themes[(currentIndex + 1) % themes.length]
  document.body.classList.remove(currentTheme)
  document.body.classList.add(className)
  localStorage.setItem('@lokua/p5/theme', className)
}

function sendExternalStart() {
  if (midiOutputPort) {
    // Ableton cannot be started remotely via START unless it is also synced :(
    midiOutputPort.send([statusMap.get('controlChange') + 15, 1, 127])
    setTimeout(() => {
      midiOutputPort.send([statusMap.get('controlChange') + 15, 0, 127])
    }, 100)

    if (recordingQueued) {
      startRecording()
    } else {
      resetSketch()
    }
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
