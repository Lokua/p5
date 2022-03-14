import express from 'express'
import fs from 'fs/promises'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { spawn } from 'child_process'
import c from 'chalk'
import rimraf from 'rimraf'

const getDirname = (importMetaUrl) =>
  dirname(fileURLToPath(importMetaUrl))

const app = express()
const port = 3000

const log = (...args) => {
  console.info(c.cyan(...args))
}

app.use(express.static('src'))
app.use(express.static('node_modules'))
app.use(
  express.json({
    limit: 1e9,
  }),
)

app.get('/', (req, res) => {
  res.sendFile(
    `${getDirname(import.meta.url)}/src/index.html`,
  )
})

app.post('/recording', async (req, res) => {
  const {
    metadata: { name, frameRate = 30 },
    recordedImages,
  } = req.body
  const padCount = recordedImages.length.toString().length
  const date = new Date()
  const folder = `./captures/${name}-${prettyDate(date)}`

  log('creating folder', folder)
  await fs.mkdir(folder)

  const writes = await Promise.all(
    recordedImages.map(async (dataURL, index) => {
      const data = dataURL.slice(dataURL.indexOf(','))
      const filename = index
        .toString()
        .padStart(padCount, '0')

      try {
        await fs.writeFile(
          `${folder}/${filename}.png`,
          Buffer.from(data, 'base64'),
        )
        return true
      } catch (error) {
        console.error(error)
        return false
      }
    }),
  )

  res.sendStatus(200)

  if (writes.every(Boolean)) {
    log('pngs created. writing mp4')
    await new Promise((resolve, reject) => {
      const filename = `${folder}.mp4`
      const childProcess = spawn(
        'ffmpeg',
        [
          '-hide_banner',
          '-framerate',
          `${frameRate}`,
          '-i',
          `"${folder}/%${padCount}d.png"`,
          '-vf',
          'scale=1080x1080',
          '-r',
          '30',
          '-pix_fmt',
          'yuv420p',
          '-crf',
          '17',
          '-vcodec',
          'libx264',
          `${filename}`,
        ],
        {
          stdio: 'inherit',
          shell: true,
        },
      )

      childProcess.on('close', (code) => {
        if (code === 0) {
          log('cleaning up')
          rimraf.sync(folder)
          log('done')
          resolve()
        } else {
          reject(
            new Error(
              'spawned process closed with a non-zero exit code',
            ),
          )
        }
      })
    }).catch(console.error)
  } else {
    console.error('error writing some images')
  }
})

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
