import { describe, expect, it } from 'vitest'
import { Player } from '../src/Player.js'
import { Item } from '../src/Item.js'

describe('Player', () => {
  it('moves by an offset', () => {
    const player = new Player(0, 0)
    player.move(1, -1)
    expect(player.x).toBe(1)
    expect(player.y).toBe(-1)
  })

  it('adds, finds and removes items', () => {
    const player = new Player(0, 0)
    const key = new Item('Key', '')
    player.addItem(key)
    expect(player.hasItem('Key')).toBe(true)
    expect(player.getItem('Key')).toBe(key)
    player.removeItem(key)
    expect(player.hasItem('Key')).toBe(false)
  })

  it('clamps damage to zero and healing to max health', () => {
    const player = new Player(0, 0, 100)
    player.takeDamage(150)
    expect(player.health).toBe(0)
    player.heal(30)
    expect(player.health).toBe(30)
    player.heal(1000)
    expect(player.health).toBe(100)
  })

  it('reports alive/dead correctly', () => {
    const player = new Player(0, 0, 10)
    expect(player.isAlive()).toBe(true)
    player.takeDamage(10)
    expect(player.isAlive()).toBe(false)
  })

  it('lists inventory names', () => {
    const player = new Player(0, 0)
    player.addItem(new Item('Key', ''))
    player.addItem(new Item('Sword', ''))
    expect(player.inventoryNames).toEqual(['Key', 'Sword'])
  })
})
