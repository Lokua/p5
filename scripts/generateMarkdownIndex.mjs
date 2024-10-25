import fs from 'fs'
import { getDirname, isSupportedImageFile } from './util.mjs'

const __dirname = getDirname(import.meta.url)
const imagesDir = `${__dirname}/../images/1000x`

main()

function main() {
  fs.writeFileSync(
    `${__dirname}/../index.md`,
    generateMarkdownContent(),
    'utf-8',
  )
}

function generateMarkdownContent() {
  return fs
    .readdirSync(imagesDir)
    .filter(isSupportedImageFile)
    .map((filename) =>
      [
        `## ${filename}`,
        `<img src="images/1000x/${filename}" alt="${filename}" width="500">`,
      ].join('\n'),
    )
    .join('\n\n')
}
