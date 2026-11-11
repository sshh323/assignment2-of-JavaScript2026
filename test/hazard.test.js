import { describe, expect, it } from 'vitest'
import { Hazard } from '../src/Hazard.js'

describe('Hazard', () => {
  it('returns the damage from its apply function', () => {
    const hazard = new Hazard('Trap', 'Spikes.', () => 10)
    expect(hazard.trigger({})).toBe(10)
  })

  it('defaults to zero damage', () => {
    const hazard = new Hazard('Nothing', '')
    expect(hazard.trigger({})).toBe(0)
  })

  it('receives the player as an argument', () => {
    const hazard = new Hazard('Monster', '', (player) => (player.armed ? 0 : 20))
    expect(hazard.trigger({ armed: true })).toBe(0)
    expect(hazard.trigger({ armed: false })).toBe(20)
  })
})
