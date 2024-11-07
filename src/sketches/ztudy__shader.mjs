import AnimationHelper from '../lib/AnimationHelper.mjs'
import { getShaderFiles } from '../util.mjs'

/**
 * @param {import('p5')} p
 */
export default function (p) {
  const metadata = {
    name: 'ztudy__shader',
    frameRate: 30,
    pixelDensity: 6,
  }

  const [w, h] = [500, 500]
  const ah = new AnimationHelper({ p, frameRate: metadata.frameRate, bpm: 120 })
  let shader

  function setup() {
    const canvas = p.createCanvas(w, h, p.WEBGL)

    p.colorMode(p.RGB, 255, 255, 255, 1)
    p.noStroke()
    p.rectMode(p.CORNER)

    shader = p.loadShader(...getShaderFiles(metadata.name))

    return {
      canvas,
    }
  }

  function draw() {
    p.background(255)
    p.shader(shader)
    shader.setUniform('beats', ah.anim8([10, 20, 10], 16))
    shader.setUniform('wonk', ah.anim8([5, 100, 5], 36))
    p.circle(0, 0, ah.anim8([30, 300, 30], 24))
  }

  return {
    setup,
    draw,
    destroy() {},
    metadata,
  }
}
