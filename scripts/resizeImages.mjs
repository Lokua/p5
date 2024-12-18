import fs from 'fs'
import sharp from 'sharp'
import { getDirname, isSupportedImageFile } from './util.mjs'

const __dirname = getDirname(import.meta.url)
const imagesDir = `${__dirname}/../images`
const images1000xDir = `${imagesDir}/1000x`

const imagesFilenames = fs.readdirSync(imagesDir)
const images1000xFilenames = fs.readdirSync(images1000xDir)

imagesFilenames.forEach(async (filename) => {
  if (
    isSupportedImageFile(filename) &&
    !images1000xFilenames.includes(filename)
  ) {
    console.info('resizing', filename)
    await sharp(`${imagesDir}/${filename}`)
      .resize(1000)
      .toFile(`${images1000xDir}/${filename}`)
  }
})
