import ControlPanel, {
  Button,
  File,
  Range,
} from '../lib/ControlPanel/index.mjs'
import { generatePalette, sortColorsDarkToLight } from '../lib/colors.mjs'
import { msToTime } from '../util.mjs'

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
  let colors = []
  let palette
  let showPalette = false

  const controlPanel = new ControlPanel({
    p,
    id: metadata.name,
    autoRedraw: false,
    controls: {
      file: new File({
        name: 'file',
        handler(file) {
          const dataUrl = URL.createObjectURL(file)
          p.loadImage(dataUrl, (loadedImage) => {
            const scaleFactor = Math.min(
              w / 2 / loadedImage.width,
              h / 2 / loadedImage.height,
            )
            loadedImage.resize(
              loadedImage.width * scaleFactor,
              loadedImage.height * scaleFactor,
            )
            image = loadedImage
            p.redraw()
          })
        },
      }),
      generatePalette: new Button({
        name: 'generatePalette',
        handler() {
          showPalette = true
          p.redraw()
        },
      }),
      resolution: new Range({
        name: 'resolution',
        value: 1,
        min: 1,
        max: 64,
      }),
      swatchCount: new Range({
        name: 'swatchCount',
        value: 12,
        min: 2,
        max: 13,
      }),
    },
  })

  function setup() {
    controlPanel.init()
    const canvas = p.createCanvas(w, h)

    p.colorMode(p.RGB, 255, 255, 255, 1)
    p.noLoop()

    return {
      canvas,
    }
  }

  function draw() {
    if (image && !showPalette) {
      p.background(255)
      renderImage()
    } else if (showPalette) {
      p.background(255)
      renderImage()
      generateAndDrawPalette()
      showPalette = false
    }
  }

  function renderImage() {
    const { resolution } = controlPanel.values()
    colors = []

    for (let y = 0; y < image.height; y += resolution) {
      for (let x = 0; x < image.width; x += resolution) {
        const color = image.get(x, y)
        colors.push(color)
        p.push()
        p.stroke(color)
        p.strokeWeight(resolution)
        p.translate(x, y)
        p.point(0, 0)
        p.pop()
      }
    }
  }

  function generateAndDrawPalette() {
    const { swatchCount } = controlPanel.values()

    const startTime = Date.now()
    console.log('Processing palette...')
    palette = sortColorsDarkToLight(generatePalette(colors, swatchCount))

    // Layout for palette display
    const totalHeight = h / 2
    const startY = h - totalHeight
    const margin = 20
    const padding = 10
    const availableWidth = w - 2 * margin
    const maxSwatchesPerRow = Math.min(
      palette.length,
      Math.floor(availableWidth / (padding + 20)),
    )
    const rows = Math.ceil(palette.length / maxSwatchesPerRow)
    const swatchSize = Math.min(
      (availableWidth - (maxSwatchesPerRow - 1) * padding) / maxSwatchesPerRow,
      (totalHeight - (rows + 1) * padding) / rows,
    )

    // Draw the palette swatches
    palette.forEach((color, i) => {
      const row = Math.floor(i / maxSwatchesPerRow)
      const col = i % maxSwatchesPerRow
      const x = margin + col * (swatchSize + padding)
      const y = startY + padding + row * (swatchSize + padding)
      p.noStroke()
      p.fill(color.rgba())
      p.rect(x, y, swatchSize, swatchSize)
    })

    p.stroke(200)
    p.strokeWeight(1)
    p.line(0, startY, w, startY)

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
