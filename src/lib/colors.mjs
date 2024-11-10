import chroma from 'chroma-js'

export const lokuaScales = {
  goat: ['#201b0e', '#554833', '#8f826b', '#c8bfa6', '#dde7e7'],
  tgb: [
    '#030405',
    '#12131a',
    '#0e1728',
    '#41172b',
    '#17284b',
    '#122f27',
    '#3d4b5e',
    '#a00d44',
    '#2c5895',
    '#92a8bf',
  ],
  dhc: ['#21211b', '#46443a', '#7b7260', '#c2cad1', '#eacda2'],
  ruralSunset: [
    '#211d1a',
    '#413a30',
    '#725e78',
    '#938fc2',
    '#cc8587',
    '#ab90b6',
    '#8f9ad4',
    '#c492aa',
    '#ee9374',
    '#aba9d3',
  ],
}

export const d3ColorScales = {
  viridis: [
    '#440154',
    '#482777',
    '#3e4989',
    '#31688e',
    '#26828e',
    '#1f9e89',
    '#35b779',
    '#6ece58',
    '#b5de2b',
    '#fde725',
  ],
  magma: [
    '#000004',
    '#1c1044',
    '#51127c',
    '#83339e',
    '#c22f80',
    '#e65564',
    '#fb8761',
    '#feb078',
    '#fada5e',
    '#fcfdbf',
  ],
  plasma: [
    '#0d0887',
    '#6a00a8',
    '#b12a90',
    '#e16462',
    '#fca636',
    '#f0f921',
    '#fae200',
    '#bde317',
    '#6bcb2e',
    '#1effd8',
  ],
  cool: [
    '#f7fbff',
    '#deebf7',
    '#c6dbef',
    '#9ecae1',
    '#6baed6',
    '#4292c6',
    '#2171b5',
    '#08519c',
    '#08306b',
  ],
  warm: [
    '#fff5eb',
    '#fee6ce',
    '#fdd0a2',
    '#fdae6b',
    '#fd8d3c',
    '#f16913',
    '#d94801',
    '#a63603',
    '#7f2704',
  ],
  blues: [
    '#f7fbff',
    '#deebf7',
    '#c6dbef',
    '#9ecae1',
    '#6baed6',
    '#4292c6',
    '#2171b5',
    '#08519c',
    '#08306b',
  ],
  reds: [
    '#fff5f0',
    '#fee0d2',
    '#fcbba1',
    '#fc9272',
    '#fb6a4a',
    '#ef3b2c',
    '#cb181d',
    '#a50f15',
    '#67000d',
  ],
  greens: [
    '#f7fcf5',
    '#e5f5e0',
    '#c7e9c0',
    '#a1d99b',
    '#74c476',
    '#41ab5d',
    '#238b45',
    '#006d2c',
    '#00441b',
  ],
  purples: [
    '#fcfbfd',
    '#efedf5',
    '#dadaeb',
    '#bcbddc',
    '#9e9ac8',
    '#807dba',
    '#6a51a3',
    '#54278f',
    '#3f007d',
  ],
}

export const chromaBrewerKeys = [
  'OrRd',
  'PuBu',
  'BuPu',
  'Oranges',
  'BuGn',
  'YlOrBr',
  'YlGn',
  'Reds',
  'RdPu',
  'Greens',
  'YlGnBu',
  'Purples',
  'GnBu',
  'Greys',
  'YlOrRd',
  'PuRd',
  'Blues',
  'PuBuGn',
  'Viridis',
  'Spectral',
  'RdYlGn',
  'RdBu',
  'PiYG',
  'PRGn',
  'RdYlBu',
  'BrBG',
  'RdGy',
  'PuOr',
  'Set2',
  'Accent',
  'Set1',
  'Set3',
  'Dark2',
  'Paired',
  'Pastel2',
  'Pastel1',
]
export function renderSwatches(
  p,
  w,
  scales,
  numSwatches = 10,
  swatchSize = 20,
  margin = 5,
) {
  const maxSwatchSize = Math.floor(
    (w - margin * (numSwatches - 1)) / numSwatches,
  )
  const size = Math.min(swatchSize, maxSwatchSize)

  scales.forEach((scale, i) => {
    for (let j = 0; j < numSwatches; j++) {
      const color = scale(j / (numSwatches - 1))
      p.fill(p.color(color.rgba()))
      p.noStroke()
      const x = margin + j * (size + margin)
      const y = margin + i * (size + margin)
      p.rect(x, y, size, size)
    }
  })
}

export function generatePalette(colors, numColors = 5) {
  const chromaColors = colors.map((color) =>
    Array.isArray(color)
      ? chroma(color[0], color[1], color[2], 'rgb')
      : chroma(color),
  )
  const uniqueColors = new Set(chromaColors.map((c) => c.hex()))
  numColors = Math.min(numColors, uniqueColors.size)

  const centroids = []
  const selectedColors = new Set()
  while (centroids.length < numColors) {
    const randomColor =
      chromaColors[Math.floor(Math.random() * chromaColors.length)]
    if (!selectedColors.has(randomColor.hex())) {
      selectedColors.add(randomColor.hex())
      centroids.push(randomColor)
    }
  }

  let oldCentroids = []
  let iterations = 0
  const maxIterations = 50
  let clusters

  while (
    !centroidsEqual(centroids, oldCentroids) &&
    iterations < maxIterations
  ) {
    oldCentroids = centroids.map((c) => chroma.lab(...c.lab()))
    clusters = Array(numColors)
      .fill()
      .map(() => [])

    chromaColors.forEach((color) => {
      let minDistance = Infinity
      let closestCentroidIndex = 0
      centroids.forEach((centroid, index) => {
        const distance = calculateColorDistance(color, centroid)
        if (distance < minDistance) {
          minDistance = distance
          closestCentroidIndex = index
        }
      })
      clusters[closestCentroidIndex].push(color)
    })

    centroids.forEach((_, i) => {
      const cluster = clusters[i]
      if (cluster.length > 0) {
        const colorSum = cluster.reduce(
          (sum, color) => {
            const lab = color.lab()
            return [sum[0] + lab[0], sum[1] + lab[1], sum[2] + lab[2]]
          },
          [0, 0, 0],
        )
        centroids[i] = chroma.lab(
          colorSum[0] / cluster.length,
          colorSum[1] / cluster.length,
          colorSum[2] / cluster.length,
        )
      }
    })
    iterations++
  }

  const prominenceCounts = Array(numColors).fill(0)
  chromaColors.forEach((color) => {
    let minDistance = Infinity
    let closestCentroidIndex = 0
    centroids.forEach((centroid, index) => {
      const distance = calculateColorDistance(color, centroid)
      if (distance < minDistance) {
        minDistance = distance
        closestCentroidIndex = index
      }
    })
    prominenceCounts[closestCentroidIndex]++
  })

  return centroids
    .map((color, i) => ({ color, count: prominenceCounts[i] }))
    .sort((a, b) => b.count - a.count)
    .map((cluster) => cluster.color)
}

function calculateColorDistance(color1, color2) {
  const lab1 = color1.lab()
  const lab2 = color2.lab()
  return Math.sqrt(
    Math.pow(lab1[0] - lab2[0], 2) +
      Math.pow(lab1[1] - lab2[1], 2) +
      Math.pow(lab1[2] - lab2[2], 2),
  )
}

function centroidsEqual(centroids1, centroids2) {
  if (centroids1.length !== centroids2.length) {
    return false
  }
  for (let i = 0; i < centroids1.length; i++) {
    if (calculateColorDistance(centroids1[i], centroids2[i]) >= 0.01) {
      return false
    }
  }
  return true
}

export function sortColorsLightToDark(colors) {
  return colors.sort((a, b) => chroma(b).luminance() - chroma(a).luminance())
}
export function sortColorsDarkToLight(colors) {
  return colors.sort((a, b) => chroma(a).luminance() - chroma(b).luminance())
}
