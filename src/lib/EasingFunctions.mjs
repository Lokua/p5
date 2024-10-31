export const easeIn = (x) => x * x
export const easeOut = (x) => x * (2 - x)
export const easeInOut = (x) => (x < 0.5 ? 2 * x * x : -1 + (4 - 2 * x) * x)
export const linear = (x) => x
export const easeInQuad = (x) => x * x
export const easeOutQuad = (x) => x * (2 - x)
export const easeInOutQuad = (x) => (x < 0.5 ? 2 * x * x : -1 + (4 - 2 * x) * x)
