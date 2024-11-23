export default class P5Extensions {
  constructor(p) {
    this.p = p
    this.V = window.p5.Vector

    // Create vTranslate, vRect, etc. that take a vector instead of
    // x and y for convenience
    const methods = ['translate', 'rect', 'circle', 'ellipse', 'triangle']
    for (const method of methods) {
      Object.defineProperty(
        this,
        `v${method.charAt(0).toUpperCase() + method.slice(1)}`,
        {
          value: (vector, ...args) => {
            // Have to branch because p5.js is picky about undefined arguments
            if (this.p._renderer.isP3D && vector.z !== undefined) {
              this.p[method](vector.x, vector.y, vector.z, ...args)
            } else {
              this.p[method](vector.x, vector.y, ...args)
            }
          },
        },
      )
    }
  }

  pushPop = (fn) => {
    this.p.push()
    fn()
    this.p.pop()
  }

  shape = (fn) => {
    this.p.beginShape()
    fn()
    this.p.endShape()
  }

  xToLongitude(resolution, x) {
    return this.p.map(x, 0, resolution, 0, this.p.PI)
  }

  yToLatitude(resolution, y) {
    return this.p.map(y, 0, resolution, 0, this.p.TWO_PI)
  }

  geographicToCartesian(longitude, latitude, radius) {
    const x = radius * Math.sin(longitude) * Math.cos(latitude)
    const y = radius * Math.sin(longitude) * Math.sin(latitude)
    const z = radius * Math.cos(longitude)
    return [x, y, z]
  }

  clipLineToCanvas(start, end, w, h) {
    const [xmin, xmax, ymin, ymax] = [0, w, 0, h]

    let p0 = this.p.createVector(start.x, start.y)
    let p1 = this.p.createVector(end.x, end.y)

    // Cohen-Sutherland Line Clipping Algorithm (Basic)
    let code0 = this.#computeCode(p0, xmin, ymin, xmax, ymax)
    let code1 = this.#computeCode(p1, xmin, ymin, xmax, ymax)

    let accept = false

    while (true) {
      if (!(code0 | code1)) {
        // Both endpoints are inside the clipping area
        accept = true
        break
      } else if (code0 & code1) {
        // Both endpoints are outside the clipping area (in the same region)
        break
      } else {
        // One endpoint is outside the clipping area, compute intersection
        const codeOut = code0 ? code0 : code1
        let x, y

        // Find intersection point
        if (codeOut & 8) {
          // Top
          x = p0.x + ((p1.x - p0.x) * (ymax - p0.y)) / (p1.y - p0.y)
          y = ymax
        } else if (codeOut & 4) {
          // Bottom
          x = p0.x + ((p1.x - p0.x) * (ymin - p0.y)) / (p1.y - p0.y)
          y = ymin
        } else if (codeOut & 2) {
          // Right
          y = p0.y + ((p1.y - p0.y) * (xmax - p0.x)) / (p1.x - p0.x)
          x = xmax
        } else if (codeOut & 1) {
          // Left
          y = p0.y + ((p1.y - p0.y) * (xmin - p0.x)) / (p1.x - p0.x)
          x = xmin
        }

        // Set the outside point to the intersection
        if (codeOut === code0) {
          p0 = this.p.createVector(x, y)
          code0 = this.#computeCode(p0, xmin, ymin, xmax, ymax)
        } else {
          p1 = this.p.createVector(x, y)
          code1 = this.#computeCode(p1, xmin, ymin, xmax, ymax)
        }
      }
    }

    if (accept) {
      return [p0, p1]
    }

    return null // No part of the line is within the canvas
  }

  #computeCode({ x, y }, xmin, ymin, xmax, ymax) {
    let code = 0

    // Left
    if (x < xmin) {
      code |= 1
    }
    // Right
    else if (x > xmax) {
      code |= 2
    }
    // Bottom
    if (y < ymin) {
      code |= 4
    }
    // Top
    else if (y > ymax) {
      code |= 8
    }

    return code
  }

  findIntersection(line1Start, line1End, line2Start, line2End) {
    // Line 1 (first bisector) - (x1, y1) to (x2, y2)
    const x1 = line1Start.x,
      y1 = line1Start.y
    const x2 = line1End.x,
      y2 = line1End.y

    // Line 2 (second bisector) - (x3, y3) to (x4, y4)
    const x3 = line2Start.x,
      y3 = line2Start.y
    const x4 = line2End.x,
      y4 = line2End.y

    // Calculate the coefficients for the lines in the form Ax + By = C
    const a1 = y2 - y1
    const b1 = x1 - x2
    const c1 = a1 * x1 + b1 * y1

    const a2 = y4 - y3
    const b2 = x3 - x4
    const c2 = a2 * x3 + b2 * y3

    // Calculate the determinant (a1 * b2 - a2 * b1)
    const determinant = a1 * b2 - a2 * b1

    // If the determinant is zero, the lines are parallel, so no intersection.
    if (determinant === 0) {
      return null // No intersection, lines are parallel
    }

    // Otherwise, find the intersection (x, y)
    const x = (c1 * b2 - c2 * b1) / determinant
    const y = (a1 * c2 - a2 * c1) / determinant

    // Return the intersection point
    return this.p.createVector(x, y)
  }
}
