export default function grid4(p) {
  const [w, h] = [1500, 1500]

  function setup() {
    const canvas = p.createCanvas(w, h)
    p.noLoop()

    return {
      canvas,
    }
  }

  function draw() {
    p.background(0)
    p.noiseSeed(p.random(100))

    const n = Math.floor(w / 38)

    for (let x = 0; x < w; x += n) {
      for (let y = 0; y < h; y += n) {
        p.random() < 0.3
          ? p.stroke(p.random(255))
          : p.stroke(0)

        p.random() < 0.1
          ? p.fill(p.random(255))
          : p.fill(255)

        const rb = () => Boolean(p.noise(x) > 0.5)
        p.strokeWeight(rb() ? 1 : rb() ? 3 : 4)

        const hn = n / 2 - 4
        const r = () => p.noise(hn * x * y) * hn

        p.rect(x - r(), y - r(), r() * 24, r() * 16)
      }
    }
  }

  return {
    setup,
    draw,
    metadata: {
      name: 'grid4',
    },
  }
}
