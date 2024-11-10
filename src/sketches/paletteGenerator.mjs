import chroma from 'chroma-js'
import { createControlPanel } from '../lib/ControlPanel/index.mjs'
import {
  generatePalette,
  sortColorsDarkToLightRespectingHue,
} from '../lib/colors.mjs'
import { formatLog, msToTime } from '../util.mjs'

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const metadata = {
    name: 'paletteGenerator',
    frameRate: 30,
    pixelDensity: 6,
  }
  const [w, h] = [500, 500]

  let image = null
  let colors
  let palette
  let imageBuffer
  let paletteBuffer
  let needsPaletteRender = false

  const controlPanel = createControlPanel({
    p,
    id: metadata.name,
    controls: [
      {
        type: 'File',
        name: 'file',
        handler(file) {
          const dataUrl = URL.createObjectURL(file)
          p.loadImage(dataUrl, (img) => {
            const scaleFactor = Math.min(w / img.width, h / img.height)
            img.resize(img.width * scaleFactor, img.height * scaleFactor)
            image = img
          })
        },
      },
      {
        type: 'Button',
        name: 'generatePalette',
        handler() {
          if (colors && colors.length > 0) {
            needsPaletteRender = true
          } else {
            alert(
              formatLog(`
                'No colors available to generate palette. 
                Please load an image first.',
              `),
            )
          }
        },
      },
      {
        type: 'Range',
        name: 'resolution',
        value: 1,
        min: 1,
        max: 64,
      },
      {
        type: 'Range',
        name: 'swatchCount',
        value: 5,
        min: 2,
        max: 15,
      },
      {
        type: 'Select',
        name: 'background',
        value: 'transparent',
        options: ['black', 'white', 'transparent'],
      },
      {
        type: 'Select',
        name: 'shape',
        value: 'rect',
        options: ['circle', 'rect'],
      },
    ],
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    imageBuffer = p.createGraphics(w, h)
    paletteBuffer = p.createGraphics(w, h / 6)

    imageBuffer.colorMode(p.RGB, 255, 255, 255, 1)
    paletteBuffer.colorMode(p.RGB, 255, 255, 255, 1)

    imageBuffer.background(255)
    paletteBuffer.background(255)

    return {
      canvas,
    }
  }

  function draw() {
    const { background } = controlPanel.values()
    p.clear()
    p.background(background === 'transparent' ? [0, 0, 0, 0] : background)

    if (image) {
      renderImageToBuffer()
    }

    if (image) {
      p.image(imageBuffer, 0, 0, w, h)
    }

    if (needsPaletteRender) {
      generateAndDrawPaletteToBuffer()
      needsPaletteRender = false
    }

    if (palette) {
      p.image(
        paletteBuffer,
        0,
        h - paletteBuffer.height,
        w,
        paletteBuffer.height,
      )
    }
  }

  function renderImageToBuffer() {
    const { resolution, shape } = controlPanel.values()
    const shapeSize = resolution

    imageBuffer.clear()
    colors = []

    const cols = Math.ceil(image.width / resolution)
    const rows = Math.ceil(image.height / resolution)

    const renderedWidth = cols * shapeSize
    const renderedHeight = rows * shapeSize

    const offsetX = (w - renderedWidth) / 2
    const offsetY = (h - renderedHeight) / 2

    for (let y = 0; y < image.height; y += resolution) {
      for (let x = 0; x < image.width; x += resolution) {
        const color = image.get(x, y)
        colors.push(color)
        imageBuffer.fill(color)
        imageBuffer.noStroke()

        const posX = offsetX + (x / resolution) * shapeSize + shapeSize / 2
        const posY = offsetY + (y / resolution) * shapeSize + shapeSize / 2

        if (shape === 'rect') {
          imageBuffer.rectMode(p.CENTER)
          imageBuffer.rect(posX, posY, shapeSize, shapeSize)
        } else {
          imageBuffer.ellipseMode(p.CENTER)
          imageBuffer.ellipse(posX, posY, shapeSize, shapeSize)
        }
      }
    }
  }

  function generateAndDrawPaletteToBuffer() {
    const { swatchCount } = controlPanel.values()

    const startTime = Date.now()
    console.log('Processing palette...')

    palette = sortColorsDarkToLightRespectingHue(
      generatePalette(colors, Math.min(swatchCount, 15)),
    )

    const margin = 20
    const padding = 10
    const availableWidth = w - 2 * margin

    const swatchSize = Math.max(
      Math.min(
        (availableWidth - (palette.length - 1) * padding) / palette.length,
        paletteBuffer.height - 2 * padding,
      ),
      10,
    )

    paletteBuffer.clear()
    paletteBuffer.rectMode(p.CORNER)
    paletteBuffer.noStroke()
    paletteBuffer.fill(chroma('gray').alpha(0.62).rgba())

    const totalSwatchWidth =
      palette.length * swatchSize + (palette.length - 1) * padding
    const rectWidth = totalSwatchWidth + 2 * padding
    const rectHeight = swatchSize + 2 * padding
    const rectX = (w - rectWidth) / 2
    const rectY = (paletteBuffer.height - rectHeight) / 2
    paletteBuffer.rect(rectX, rectY, rectWidth, rectHeight)

    const startX = rectX + padding
    const y = rectY + padding

    palette.forEach((color, i) => {
      const x = startX + i * (swatchSize + padding)
      paletteBuffer.fill(color.rgba())
      paletteBuffer.rect(x, y, swatchSize, swatchSize)
    })

    console.log('Done. Execution time:', msToTime(Date.now() - startTime))
    console.log(
      'Palette:',
      palette.map((color) => color.hex()),
    )
  }

  return {
    setup,
    draw,
    destroy() {
      controlPanel.destroy()
    },
    metadata,
  }
}
