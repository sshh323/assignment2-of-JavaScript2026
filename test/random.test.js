import { describe, expect, it } from 'vitest'
import { createRng, pick, randomInt, shuffle } from '../src/random.js'

describe('random utilities', () => {
  it('is deterministic for the same seed', () => {
    const a = createRng(42)
    const b = createRng(42)
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })

  it('produces values in the range [0, 1)', () => {
    const rng = createRng(1)
    for (let i = 0; i < 100; i++) {
      const value = rng()
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })

  it('produces integers within the inclusive range', () => {
    const rng = createRng(2)
    for (let i = 0; i < 100; i++) {
      const value = randomInt(rng, 3, 7)
      expect(value).toBeGreaterThanOrEqual(3)
      expect(value).toBeLessThanOrEqual(7)
    }
  })

  it('picks an element from the array', () => {
    const rng = createRng(3)
    expect(['a', 'b', 'c']).toContain(pick(rng, ['a', 'b', 'c']))
  })

  it('shuffles without mutating the original array', () => {
    const items = [1, 2, 3, 4, 5]
    const shuffled = shuffle(createRng(4), items)
    expect(items).toEqual([1, 2, 3, 4, 5])
    expect([...shuffled].sort()).toEqual([1, 2, 3, 4, 5])
  })
})
