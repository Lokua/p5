import ControlPanel from './ControlPanel.mjs'
import Range from './Range.mjs'
import Toggle from './Toggle.mjs'
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

export default ControlPanel
export { Range, Toggle, Select, createBlendMode }
