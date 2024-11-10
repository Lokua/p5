import { createControlPanel } from '../lib/ControlPanel/index.mjs'
import { generatePalette, sortColorsDarkToLight } from '../lib/colors.mjs'
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
            const scaleFactor = Math.min(
              w / img.width,
              (2 * h) / 3 / img.height,
            )
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
        value: 12,
        min: 2,
        max: 13,
      },
    ],
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    imageBuffer = p.createGraphics(w, (2 * h) / 3)
    paletteBuffer = p.createGraphics(w, h / 3)

    imageBuffer.colorMode(p.RGB, 255, 255, 255, 1)
    paletteBuffer.colorMode(p.RGB, 255, 255, 255, 1)

    imageBuffer.background(255)
    paletteBuffer.background(255)

    return {
      canvas,
    }
  }

  function draw() {
    p.background(255)

    if (image) {
      renderImageToBuffer()
    }

    if (image) {
      p.image(imageBuffer, 0, 0, w, (2 * h) / 3)
    }

    if (needsPaletteRender) {
      generateAndDrawPaletteToBuffer()
      needsPaletteRender = false
    }

    if (palette) {
      p.image(paletteBuffer, 0, (2 * h) / 3, w, h / 3)
    }
  }

  function renderImageToBuffer() {
    const { resolution } = controlPanel.values()
    colors = []
    imageBuffer.clear()
    imageBuffer.background(255)

    imageBuffer.strokeWeight(resolution)

    const offsetX = (w - image.width) / 2
    const offsetY = ((2 * h) / 3 - image.height) / 2

    for (let y = 0; y < image.height; y += resolution) {
      for (let x = 0; x < image.width; x += resolution) {
        const color = image.get(x, y)
        colors.push(color)
        imageBuffer.stroke(color)
        imageBuffer.point(x + offsetX, y + offsetY)
      }
    }
  }

  function generateAndDrawPaletteToBuffer() {
    const { swatchCount } = controlPanel.values()

    const startTime = Date.now()
    console.log('Processing palette...')

    palette = sortColorsDarkToLight(generatePalette(colors, swatchCount))

    const totalHeight = h / 2
    const startY = 0
    const margin = 20
    const padding = 10
    const availableWidth = w - 2 * margin

    const maxSwatchesPerRow = Math.min(
      palette.length,
      Math.floor(availableWidth / (padding + 20)),
    )

    const rows = Math.ceil(palette.length / maxSwatchesPerRow)

    const swatchSize = Math.max(
      Math.min(
        (availableWidth - (maxSwatchesPerRow - 1) * padding) /
          maxSwatchesPerRow,
        (totalHeight - (rows + 1) * padding) / rows,
      ),
      10,
    )

    paletteBuffer.clear()
    paletteBuffer.background(255)

    palette.forEach((color, i) => {
      const row = Math.floor(i / maxSwatchesPerRow)
      const col = i % maxSwatchesPerRow
      const x = margin + col * (swatchSize + padding)
      const y = startY + padding + row * (swatchSize + padding)

      paletteBuffer.noStroke()
      paletteBuffer.fill(color.rgba())
      paletteBuffer.rect(x, y, swatchSize, swatchSize)
    })

    paletteBuffer.stroke(200)
    paletteBuffer.strokeWeight(1)
    paletteBuffer.line(0, startY, w, startY)

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
