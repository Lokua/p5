import chroma from 'chroma-js'
import ControlPanel from './ControlPanel.mjs'
import Button from './Button.mjs'
import Checkbox from './Checkbox.mjs'
import Checklist from './Checklist.mjs'
import Range from './Range.mjs'
import Select from './Select.mjs'

const createBlendMode = (overrides = {}) =>
  new Select({
    name: 'blendMode',
    value: 'BLEND',
    hasLabelValue: false,
    options: [
      'BLEND',
      'ADD',
      'DARKEST',
      'LIGHTEST',
      'DIFFERENCE',
      'EXCLUSION',
      'MULTIPLY',
      'SCREEN',
      'REPLACE',
      'REMOVE',
      'OVERLAY',
      'HARD_LIGHT',
      'SOFT_LIGHT',
      'DODGE',
      'BURN',
      'SUBTRACT',
    ],
    ...overrides,
  })

const createChromaPalettes = (overrides = {}) => {
  const options = Object.keys(chroma.brewer)
  const [value] = options
  return new Select({
    name: 'chromaPalettes',
    value,
    hasLabelValue: false,
    options: Object.keys(chroma.brewer),
    ...overrides,
  })
}

export default ControlPanel
export {
  Button,
  Checkbox,
  Checklist,
  Range,
  Select,
  createBlendMode,
  createChromaPalettes,
}
