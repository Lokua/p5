/**
 * @typedef {keyof typeof Quirks} Quirk
 */
const Quirks = {
  BLACK_HOLED: 'BLACK_HOLED',
  X_RAY: 'X_RAY',
  MARKED_FOR_DEATH: 'MARKED_FOR_DEATH',
  POLLINATED: 'POLLINATED',
}

export default Quirks

/**
 * @typedef {keyof typeof QuirkModes} QuirkMode
 */
export const QuirkModes = {
  ADD_UPDATE_REMOVE: 'ADD_UPDATE_REMOVE',
  ADD_UPDATE_NO_REMOVE: 'ADD_UPDATE_NO_REMOVE',
  ADD_NO_UPDATE_NO_REMOVE: 'ADD_NO_UPDATE_NO_REMOVE',
}
