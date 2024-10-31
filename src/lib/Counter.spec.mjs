import test from 'node:test'
import assert from 'node:assert'
import Counter from './lib/Counter.mjs'

test('Counter', () => {
  const counter = new Counter({
    min: 0,
    max: 2,
    step: 1,
  })

  assert.equal(counter.count, 0)

  counter.tick()
  assert.equal(counter.count, 1)

  counter.tick()
  assert.equal(counter.count, 2)

  counter.tick()
  assert.equal(counter.count, 1)

  counter.tick()
  assert.equal(counter.count, 0)

  counter.tick()
  assert.equal(counter.count, 1)
})

test('Counter (large, unevenly divisible step)', () => {
  const counter = new Counter({
    min: 0,
    max: 10,
    step: 3,
  })

  assert.equal(counter.count, 0)

  counter.tick()
  assert.equal(counter.count, 3)

  counter.tick()
  assert.equal(counter.count, 6)

  counter.tick()
  assert.equal(counter.count, 9)

  counter.tick()
  assert.equal(counter.count, 8)

  counter.tick()
  assert.equal(counter.count, 5)

  counter.tick()
  assert.equal(counter.count, 2)

  counter.tick()
  assert.equal(counter.count, 1)
})
