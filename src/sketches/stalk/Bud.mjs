export default class Bud {
  constructor({
    p,
    position = Math.random(),
    color,
    setPhase,
    sphereRadius = 20,
    petals = [],
    petalPlacement = 'fibonacci',
  }) {
    this.p = p
    this.position = position
    this.color = color
    this.setPhase = setPhase
    this.sphereRadius = sphereRadius
    this.petals = petals
    this.petalPlacement = petalPlacement
    this.rotation = 0

    this.petalStates = petals.map(() => ({
      theta: 0,
      phi: 0,
      visible: true,
    }))
  }

  update(state) {
    Object.assign(this, state)
    this.position = this.setPhase(this.position) % 1
    this.rotation += 0.05

    if (this.petalPlacement === 'fibonacci') {
      this.updateFibonacciPlacements()
    }
  }

  updateFibonacciPlacements() {
    this.petals.forEach((petal, i) => {
      const theta = Math.acos(1 - (2 * (i + 0.5)) / this.petals.length)
      const phi = Math.PI * (3 - Math.sqrt(5)) * i

      this.setPetalState(i, {
        theta,
        phi,
      })
    })
  }

  draw() {
    const p = this.p

    p.$.pushPop(() => {
      p.rotateY(this.rotation)
      p.rotateZ(this.rotation / 2)

      p.noStroke()
      p.fill(this.color)
      p.sphere(this.sphereRadius)

      this.petals.forEach((petal, i) => {
        const state = this.getPetalState(i)
        if (!state.visible) return

        const { theta, phi } = state
        const x = this.sphereRadius * Math.sin(theta) * Math.cos(phi)
        const y = this.sphereRadius * Math.sin(theta) * Math.sin(phi)
        const z = this.sphereRadius * Math.cos(theta)

        p.$.pushPop(() => {
          p.translate(x, y, z)

          const normal = p.createVector(x, y, z).normalize()
          const up = p.createVector(0, 0, 1)
          const rotationAxis = up.cross(normal).normalize()
          const angle = Math.acos(up.dot(normal))

          if (rotationAxis.mag() > 0) {
            p.rotate(angle, [rotationAxis.x, rotationAxis.y, rotationAxis.z])
          }

          petal.draw()
        })
      })
    })
  }

  setPetalState(index, newState) {
    Object.assign(this.petalStates[index], newState)
  }

  getPetalState(index) {
    return this.petalStates[index]
  }
}
