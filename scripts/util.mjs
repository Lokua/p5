import { dirname, extname } from 'path'
import { fileURLToPath } from 'url'

export const getDirname = (importMetaUrl) =>
  dirname(fileURLToPath(importMetaUrl))

export function isSupportedImageFile(filename) {
  const ext = extname(filename)
  return ext === '.png' || ext === '.jpg'
}
