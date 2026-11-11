/**
 * Seeded pseudo-random number utilities.
 *
 * The game uses a deterministic PRNG (mulberry32) so that "random" maps can be
 * reproduced exactly for a given seed, which also makes them unit-testable.
 */

/** Creates a seeded PRNG. Returns a function producing floats in [0, 1). */
export function createRng (seed = 0x9e3779b9) {
  let state = seed >>> 0
  return function next () {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Returns a random integer in the inclusive range [min, max]. */
export function randomInt (rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min
}

/** Picks a random element from a non-empty array. */
export function pick (rng, items) {
  return items[randomInt(rng, 0, items.length - 1)]
}

/** Returns a new array with the elements of `items` shuffled using `rng`. */
export function shuffle (rng, items) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randomInt(rng, 0, i)
    const tmp = copy[i]
    copy[i] = copy[j]
    copy[j] = tmp
  }
  return copy
}
