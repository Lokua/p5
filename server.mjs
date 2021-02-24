import express from 'express'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const getDirname = (importMetaUrl) => dirname(fileURLToPath(importMetaUrl))

const app = express()
const port = 3000

app.use(express.static('src'))
app.use(express.static('node_modules'))

app.get('/', (req, res) => {
  res.sendFile(`${getDirname(import.meta.url)}/src/index.html`)
})

app.listen(port, () => {
  console.info(`app listening at http://localhost:${port}`)
})
