import express from 'express'
import fs from 'fs/promises'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { spawn } from 'child_process'
import c from 'chalk'
import os from 'os'
import multer from 'multer'

const getDirname = (importMetaUrl) => dirname(fileURLToPath(importMetaUrl))

const app = express()
const port = 3000

const upload = multer({
  limits: {
    // 50MB per field
    fieldSize: 50 * 1024 * 1024,
    // Can handle up to 10000 frames (about 5-6 minutes at 30fps)
    fieldsLimit: 10000,
    fieldNameSize: 100,
  },
})

const log = (...args) => {
  console.info(
    ...args.map((arg) => (typeof arg === 'string' ? c.cyan(arg) : arg)),
  )
}

app.use(express.static('src'))
app.use('/modules', express.static('node_modules'))
app.use('/assets', express.static('assets'))
app.use(
  express.json({
    limit: 1e9,
  }),
)

app.get('/', (req, res) => {
  res.sendFile(`${getDirname(import.meta.url)}/src/index.html`)
})

app.get('/sketches', async (req, res) => {
  res.send(
    (await fs.readdir('./src/sketches')).filter((file) =>
      file.endsWith('.mjs'),
    ),
  )
})

app.post('/upload-frames', upload.none(), async (req, res) => {
  try {
    const { name, frameRate } = req.body

    const frames = Object.keys(req.body)
      .filter((key) => key.startsWith('frame-'))
      .map((key) => req.body[key])

    if (frames.length === 0) {
      return res.status(400).send({ message: 'No frames received' })
    }

    const timestamp = prettyDate(new Date())
    const dirPath = `${os.homedir()}/Movies/p5/${name}-${timestamp}`

    await fs.mkdir(dirPath, { recursive: true })

    const totalFrames = frames.length
    const padding = String(totalFrames).length // Calculate padding length based on total frames

    res.send({
      message: 'Frames uploaded. View server logs for status',
      path: dirPath,
    })

    log('writing files')
    await Promise.all(
      frames.map(async (frameDataUrl, index) => {
        const base64Data = frameDataUrl.replace(/^data:image\/png;base64,/, '')
        const paddedIndex = String(index).padStart(padding, '0')
        const filePath = `${dirPath}/frame-${paddedIndex}.png`
        await fs.writeFile(filePath, base64Data, 'base64')
      }),
    )
    log('Files written')

    log('Converting to mp4')
    await convertImagesToMP4({
      imagesPath: dirPath,
      totalFrames,
      frameRate,
    })
  } catch (error) {
    console.error('Error saving frames:', error)
    res.status(500).send({
      message: 'Error saving frames',
      error: error.toString(),
    })
  }
})

async function convertImagesToMP4({ imagesPath, totalFrames, frameRate }) {
  const mp4Pathname = `${imagesPath}.mp4`

  return new Promise((resolve, reject) => {
    const childProcess = spawn(
      'ffmpeg',
      [
        '-framerate',
        // Set the desired frame rate (adjust as needed)
        frameRate,
        '-i',
        // Input image sequence
        `${imagesPath}/frame-%0${String(totalFrames).length}d.png`,
        '-vf',
        // Set the output video resolution (adjust as needed)
        'scale=1080x1080',
        '-vcodec',
        // Use H.264 video codec
        'libx264',
        '-pix_fmt',
        // Ensures compatibility with most players
        'yuv420p',
        // Output MP4 file
        mp4Pathname,
      ],
      {
        stdio: 'inherit',
        shell: true,
      },
    )

    childProcess.on('close', (code) => {
      if (code === 0) {
        log('Done. File available at', mp4Pathname)
        resolve(mp4Pathname)
      } else {
        reject(
          new Error(`FFmpeg process closed with a non-zero exit code ${code}`),
        )
      }
    })
  })
}

app.listen(port, () => {
  log(`app listening at http://localhost:${port}`)
})

function prettyDate(date) {
  const iso = date.toISOString()
  let [d, t] = iso.split('T')
  d = d.replace(/-/g, '')
  t = t.slice(0, t.indexOf('.')).replace(/:/g, '')
  return `${d}-${t}`
}
