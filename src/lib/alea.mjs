// modernized from https://www.npmjs.com/package/alea
//---
// From http://baagoe.com/en/RandomMusings/javascript/

// importState to sync generator states
Alea.importState = (state) => {
  const random = new Alea()
  random.importState(state)
  return random
}

export default Alea

function Alea(...args) {
  // Johannes Baagøe <baagoe@baagoe.com>, 2010

  // Initial state variables
  let s0 = 0
  let s1 = 0
  let s2 = 0
  let c = 1

  // Use current time if no arguments are provided
  args = args.length === 0 ? [+new Date()] : args

  // Initialize mash function and state
  let mash = Mash()
  s0 = mash(' ')
  s1 = mash(' ')
  s2 = mash(' ')

  for (const arg of args) {
    s0 -= mash(arg)
    if (s0 < 0) {
      s0 += 1
    }
    s1 -= mash(arg)
    if (s1 < 0) {
      s1 += 1
    }
    s2 -= mash(arg)
    if (s2 < 0) {
      s2 += 1
    }
  }
  mash = null

  // Random number generator function
  const random = () => {
    const t = 2091639 * s0 + c * 2.3283064365386963e-10 // 2^-32
    s0 = s1
    s1 = s2
    s2 = t - (c = t | 0)
    return s2
  }

  // Additional methods
  random.next = random
  random.uint32 = () => random() * 0x100000000 // 2^32
  random.fract53 = () =>
    random() + ((random() * 0x200000) | 0) * 1.1102230246251565e-16 // 2^-53
  random.version = 'Alea 0.9'
  random.args = args

  // Export and import state
  random.exportState = () => [s0, s1, s2, c]
  random.importState = ([s0New, s1New, s2New, cNew]) => {
    s0 = +s0New || 0
    s1 = +s1New || 0
    s2 = +s2New || 0
    c = +cNew || 0
  }

  return random
}

function Mash() {
  let n = 0xefc8249d
  const mash = (data) => {
    data = data.toString()
    for (const char of data) {
      n += char.charCodeAt(0)
      let h = 0.02519603282416938 * n
      n = h >>> 0
      h -= n
      h *= n
      n = h >>> 0
      h -= n
      n += h * 0x100000000 // 2^32
    }
    return (n >>> 0) * 2.3283064365386963e-10 // 2^-32
  }
  mash.version = 'Mash 0.9'
  return mash
}
