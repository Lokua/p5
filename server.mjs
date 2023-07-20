import express from 'express'
import fs from 'fs/promises'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { spawn } from 'child_process'
import c from 'chalk'
import multer from 'multer'

const upload = multer()

const getDirname = (importMetaUrl) =>
  dirname(fileURLToPath(importMetaUrl))

const app = express()
const port = 3000

const log = (...args) => {
  console.info(
    ...args.map((arg) =>
      typeof arg === 'string' ? c.cyan(arg) : arg,
    ),
  )
}

app.use(express.static('src'))
app.use(express.static('node_modules'))
app.use('/assets', express.static('assets'))
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

app.get('/sketches', async (req, res) => {
  res.send(await fs.readdir('./src/sketches'))
})

app.post(
  '/download-recording',
  upload.single('file'),
  async (req, res) => {
    const { name } = req.body

    log(`received ${c.green(name)}. converting to mp4`)

    const prefix = `./captures/${name}-${prettyDate(
      new Date(),
    )}`
    const webmPathname = `${prefix}.webm`
    const mp4Pathname = `${prefix}.mp4`

    await fs.writeFile(webmPathname, req.file.buffer)

    res.send({
      pathname: mp4Pathname,
    })

    await new Promise((resolve, reject) => {
      const childProcess = spawn(
        'ffmpeg',
        ['-i', webmPathname, mp4Pathname],
        {
          stdio: 'inherit',
          shell: true,
        },
      )

      childProcess.on('close', (code) => {
        if (code === 0) {
          log('done. file available at', mp4Pathname)
          resolve()
        } else {
          reject(
            new Error(
              `spawned process closed with a non-zero exit code ${code}`,
            ),
          )
        }
      })
    })
  },
)

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
