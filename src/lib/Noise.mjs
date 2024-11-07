import { createNoise2D, createNoise3D, createNoise4D } from 'simplex-noise'
import alea from './alea.mjs'

const prng = alea()
export const random = prng
export const createPrng = alea

export class Simplex {
  constructor(type = '2d', seed) {
    this.#createNoiseImplemenation(type, seed)
  }

  #createNoiseImplemenation(type, seed) {
    this.type = type.toLowerCase()
    this.seed = seed
    this.prng = createPrng(seed ?? Math.random())
    this.prng = this.prng.bind(this)
    this.noiseImplemenation =
      type === '2d'
        ? createNoise2D(this.prng)
        : type === '3d'
          ? createNoise3D(this.prng)
          : createNoise4D(this.prng)
  }

  noise(...args) {
    // [0, 1] instead of [-1, 1]
    return (this.noiseImplemenation(...args) + 1) / 2
  }

  setSeed(seed) {
    this.seed = seed
    this.#createNoiseImplemenation(this.type, this.seed)
  }
  noiseSeed(seed) {
    this.setSeed(seed)
  }
}
