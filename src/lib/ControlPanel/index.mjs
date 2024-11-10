import chroma from 'chroma-js'
import ControlPanel from './ControlPanel.mjs'
import Button from './Button.mjs'
import Checkbox from './Checkbox.mjs'
import Checklist from './Checklist.mjs'
import File from './File.mjs'
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

const createFilter = (filterOverrides = {}, filterParamOverrides = {}) => {
  // ??? Is it possible to hook into events to disable filterParam?

  const filter = new Select({
    name: 'filter',
    value: 'none',
    hasLabelValue: false,
    options: [
      'none',
      'INVERT',
      'GRAY',
      'THRESHOLD',
      'OPAQUE',
      'POSTERIZE',
      'BLUR',
      'ERODE',
      'DILATE',
    ],
    ...filterOverrides,
  })

  const filterParam = new Range({
    name: 'filterParam',
    ...filterParamOverrides,
  })

  // not quite workin; control class support needed
  filter.experimental__onChange((value) => {
    filterParam.disabled = ['none', 'THRESHOLD', 'POSTERIZE', 'BLUR'].includes(
      value,
    )
  })

  return {
    filter,
    filterParam,
  }
}

function createControlPanel({ controls, ...rest }) {
  const controlClasses = {
    Button,
    Checkbox,
    Checklist,
    File,
    Range,
    Select,
  }
  return new ControlPanel({
    ...rest,
    controls: controls.reduce(
      (acc, { type, ...def }) => ({
        ...acc,
        [def.name]: new controlClasses[type](def),
      }),
      {},
    ),
  })
}

export default ControlPanel
export {
  Button,
  Checkbox,
  Checklist,
  File,
  Range,
  Select,
  createBlendMode,
  createControlPanel,
  createChromaPalettes,
  createFilter,
}
