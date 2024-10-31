export default class Lines {
  constructor(pInstance) {
    this.p = pInstance
  }

  dualLine({
    strokeWeight = 1,
    stroke1 = 'black',
    p1: [x1, y1],
    stroke2 = 'gray',
    p2: [x2, y2],
  }) {
    this.p.stroke(stroke1)
    this.p.strokeWeight(strokeWeight)
    this.p.line(x1, y1, x2, y2)
    this.p.stroke(stroke2)
    this.p.strokeWeight(strokeWeight * 3)
    this.p.line(x1, y1, x2, y2)
    this.p.strokeWeight(strokeWeight)
  }

  gradientLine(x1, y1, x2, y2, color1, color2, steps) {
    for (let i = 0; i < steps; i++) {
      const inter = i / steps
      const x = this.p.lerp(x1, x2, inter)
      const y = this.p.lerp(y1, y2, inter)
      this.p.stroke(
        this.p.lerpColor(this.p.color(color1), this.p.color(color2), inter),
      )
      this.p.line(
        x,
        y,
        this.p.lerp(x1, x2, inter + 1 / steps),
        this.p.lerp(y1, y2, inter + 1 / steps),
      )
    }
  }

  wavyLine(x1, y1, x2, y2, amplitude, frequency, seed = 2627) {
    this.p.noiseSeed(seed)
    const steps = 50
    let prevX, prevY
    for (let i = 0; i <= steps; i++) {
      const inter = i / steps
      const x = this.p.lerp(x1, x2, inter)
      const y = this.p.lerp(y1, y2, inter)
      const offsetX = this.p.noise(inter * frequency) * amplitude
      const offsetY = this.p.noise(inter * frequency + 1000) * amplitude
      if (i > 0) {
        this.p.line(prevX, prevY, x + offsetX, y + offsetY)
      }
      prevX = x + offsetX
      prevY = y + offsetY
    }
  }

  taperedLine(x1, y1, x2, y2, ...rest) {
    const thicknesses = Array.isArray(rest[0]) ? rest[0] : rest
    const steps = 100
    const segmentLength = steps / (thicknesses.length - 1)

    let prevX = x1
    let prevY = y1

    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const x = this.p.lerp(x1, x2, t)
      const y = this.p.lerp(y1, y2, t)

      const segment = Math.floor(i / segmentLength)
      const thicknessStart = thicknesses[segment]
      const thicknessEnd =
        thicknesses[segment + 1] === undefined
          ? thicknessStart
          : thicknesses[segment + 1]
      const segmentProgress = (i % segmentLength) / segmentLength
      const thickness = this.p.lerp(
        thicknessStart,
        thicknessEnd,
        segmentProgress,
      )

      this.p.strokeWeight(thickness)

      if (i > 0) {
        this.p.line(prevX, prevY, x, y)
      }

      prevX = x
      prevY = y
    }
  }

  glowingLine(x1, y1, x2, y2, mainColor, glowColor, layers) {
    for (let i = layers; i > 0; i--) {
      const alpha = this.p.map(i, 0, layers, 0, 255)
      const [a, b, c] = this.p.color(glowColor).levels
      this.p.stroke(a, b, c, alpha)
      this.p.line(x1 - i, y1 - i, x2 - i, y2 - i)
    }
    this.p.stroke(mainColor)
    this.p.line(x1, y1, x2, y2)
  }

  dottedLine(x1, y1, x2, y2, dotSize = 5, gap = 10) {
    const totalDist = this.p.dist(x1, y1, x2, y2)
    const stepCount = Math.floor(totalDist / (dotSize + gap))
    const dx = (x2 - x1) / stepCount
    const dy = (y2 - y1) / stepCount

    for (let i = 0; i <= stepCount; i++) {
      this.p.circle(x1 + i * dx, y1 + i * dy, dotSize)
    }
  }

  dashedLine(x1, y1, x2, y2, dashLength = 10, gap = 5) {
    const totalDist = this.p.dist(x1, y1, x2, y2)
    const stepCount = Math.floor(totalDist / (dashLength + gap))
    const dx = (x2 - x1) / totalDist
    const dy = (y2 - y1) / totalDist

    for (let i = 0; i < stepCount; i++) {
      const startX = x1 + i * (dashLength + gap) * dx
      const startY = y1 + i * (dashLength + gap) * dy
      const endX = startX + dashLength * dx
      const endY = startY + dashLength * dy
      this.p.line(startX, startY, endX, endY)
    }
  }

  curvedLine(x1, y1, x2, y2, controlOffset = 50) {
    const cx = (x1 + x2) / 2 + controlOffset
    const cy = (y1 + y2) / 2 + controlOffset
    this.p.beginShape()
    this.p.vertex(x1, y1)
    this.p.quadraticVertex(cx, cy, x2, y2)
    this.p.endShape()
  }

  // only works horiz
  zigzagLine(x1, y1, x2, y2, segments = 10, amplitude = 10) {
    const dx = (x2 - x1) / segments
    const dy = (y2 - y1) / segments

    this.p.beginShape()
    for (let i = 0; i <= segments; i++) {
      const x = x1 + i * dx
      const y = y1 + i * dy + (i % 2 === 0 ? -amplitude : amplitude)
      this.p.vertex(x, y)
    }
    this.p.endShape()
  }
}
