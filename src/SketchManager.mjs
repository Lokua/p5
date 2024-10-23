import { P5Helpers } from './util.mjs'

export default class SketchManager {
  constructor(containerId) {
    this.containerId = containerId
    this.currentP5 = null
    this.currentSketch = null
    this.currentSketchName = null
    this.eventHandlers = {}
    this.recording = false
    this.frames = []
    this.frameRate = 30
    this.recordingDurationSeconds = 60
    this.maxRecordingFrames = this.recordingDurationSeconds * this.frameRate
  }

  async loadSketch(sketchName) {
    await this.unloadSketch()
    const sketchModule = await import(this.sketchNameToPath(sketchName))
    const sketchFunction = sketchModule.default
    this.currentP5 = new p5(
      (p) => this.initSketch(p, sketchFunction),
      this.containerId,
    )
    this.currentSketchName = sketchName
  }

  initSketch(p, sketchFunction) {
    const { draw, setup, metadata, destroy, preload } = sketchFunction(
      p,
      new P5Helpers(p),
    )

    if (preload) {
      p.preload = preload
    }

    p.setup = () => {
      const { canvas } = setup()
      this.frameRate = metadata.frameRate || 30
      p.frameRate(this.frameRate)
      p.pixelDensity(metadata.pixelDensity || p.pixelDensity())
      canvas.parent(this.containerId)
      this.maxRecordingFrames = this.recordingDurationSeconds * this.frameRate
      this.currentSketch = { p, destroy, metadata }
    }

    p.draw = () => {
      if (this.recording) {
        this.captureFrame()
        if (p.frameCount >= this.maxRecordingFrames) {
          this.stopRecording()
        }
      }
      draw()
    }
  }

  async unloadSketch() {
    if (this.currentP5) {
      this.currentSketch?.destroy?.()
      this.currentP5.remove()
      this.currentP5 = null
      this.currentSketch = null
      this.recording = false
      this.frames = []
    }
  }

  startRecording() {
    this.recording = true
    this.frames = []
    const p = this.currentP5
    if (p) {
      p.frameCount = 0
    }
  }

  stopRecording() {
    this.recording = false
    return this.frames
  }

  captureFrame() {
    const p = this.currentP5
    if (p) {
      const image = p.get()
      this.frames.push(image)
    }
  }

  sketchNameToPath(name) {
    return `./sketches/${name}.mjs`
  }

  getCurrentP5() {
    return this.currentP5
  }

  getCurrentSketch() {
    return this.currentSketch
  }

  getRecordingFrames() {
    return this.frames
  }

  isRecording() {
    return this.recording
  }

  getFrameRate() {
    return this.frameRate
  }

  getSketchName() {
    return this.currentSketchName
  }
}
