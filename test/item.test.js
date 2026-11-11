import { describe, expect, it } from 'vitest'
import { Item } from '../src/Item.js'

describe('Item', () => {
  it('stores name, description and actions', () => {
    const item = new Item('Potion', 'Heals.', { use: () => 'used' })
    expect(item.name).toBe('Potion')
    expect(item.description).toBe('Heals.')
    expect(item.hasAction('use')).toBe(true)
  })

  it('invokes an action with player and game', () => {
    const item = new Item('Potion', '', { use: (player) => player.heal(10) })
    const player = { health: 50, heal (n) { this.health += n } }
    item.performAction('use', player, {})
    expect(player.health).toBe(60)
  })

  it('throws for an unknown action name', () => {
    const item = new Item('Key', '')
    expect(() => item.performAction('use', {}, {})).toThrow(/no action/)
  })

  it('throws when using an item with no use action', () => {
    const item = new Item('Key', '')
    expect(() => item.use({}, {})).toThrow(/cannot be used/)
  })

  it('tracks consumable state', () => {
    const item = new Item('Potion', '', {}, { consumable: true })
    expect(item.consumable).toBe(true)
  })
})
