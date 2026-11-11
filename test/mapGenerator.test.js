import { describe, expect, it } from 'vitest'
import { Player } from '../src/Player.js'
import { createRng } from '../src/random.js'
import {
  TILE,
  createMonster,
  createPotion,
  generateRandomMap,
  generateStandardMap
} from '../src/mapGenerator.js'

describe('mapGenerator', () => {
  describe('item and hazard factories', () => {
    it('creates a health potion that heals the player', () => {
      const player = new Player(0, 0, 100)
      player.health = 40
      createPotion().use(player)
      expect(player.health).toBe(70)
    })

    it('creates a monster that deals 20 damage without a sword', () => {
      const player = new Player(0, 0, 100)
      expect(createMonster().trigger(player)).toBe(20)
    })
  })

  describe('generateStandardMap', () => {
    const world = generateStandardMap(8, 8)

    it('creates an 8x8 world', () => {
      expect(world.width).toBe(8)
      expect(world.height).toBe(8)
    })

    it('places the exit in the bottom-right corner', () => {
      expect(world.getLocation(7, 7).type).toBe(TILE.EXIT)
    })

    it('places the treasure holding the amulet', () => {
      const treasure = world.getLocation(6, 6)
      expect(treasure.type).toBe(TILE.TREASURE)
      expect(treasure.items.some((item) => item.name === 'Amulet of Eldergrove')).toBe(true)
    })

    it('scatters items, hazards and walls as expected', () => {
      expect(world.getLocation(2, 4).items.some((item) => item.name === 'Key')).toBe(true)
      expect(world.getLocation(1, 3).hazards.some((h) => h.name === 'Monster')).toBe(true)
      expect(world.getLocation(1, 1).type).toBe(TILE.WALL)
    })
  })

  describe('generateRandomMap', () => {
    it('is deterministic for the same seed', () => {
      const a = generateRandomMap(8, 8, createRng(42))
      const b = generateRandomMap(8, 8, createRng(42))
      const flatten = (world) =>
        [...world.locations()].map((l) => `${l.type}:${l.items.length}:${l.hazards.length}`).join('|')
      expect(flatten(a)).toBe(flatten(b))
    })

    it('always places the exit and exactly one treasure', () => {
      const world = generateRandomMap(8, 8, createRng(7))
      expect(world.getLocation(7, 7).type).toBe(TILE.EXIT)
      const treasures = world.findLocationsByType(TILE.TREASURE)
      expect(treasures).toHaveLength(1)
      expect(treasures[0].items.some((item) => item.name === 'Amulet of Eldergrove')).toBe(true)
    })

    it('produces walls and at least one hazard', () => {
      const world = generateRandomMap(8, 8, createRng(7))
      expect(world.findLocationsByType(TILE.WALL).length).toBeGreaterThan(0)
      const hazards = [...world.locations()].filter((l) => l.hazards.length > 0)
      expect(hazards.length).toBeGreaterThan(0)
    })
  })
})
