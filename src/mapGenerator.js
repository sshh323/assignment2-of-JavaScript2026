import { World } from './World.js'
import { Location } from './Location.js'
import { Item } from './Item.js'
import { Hazard } from './Hazard.js'
import { shuffle } from './random.js'

export const TILE = {
  GRASS: 'grass',
  WALL: 'wall',
  TREASURE: 'treasure',
  EXIT: 'exit'
}

/* ------------------------------------------------------------------ */
/* Item factories                                                      */
/* ------------------------------------------------------------------ */

export function createPotion () {
  return new Item(
    'Health Potion',
    'A bubbling red potion that restores 30 health.',
    { use: (player) => { player.heal(30); return 'You drink the potion and feel invigorated.' } },
    { consumable: true }
  )
}

export function createKey () {
  return new Item('Key', 'An ornate iron key.', {})
}

export function createSword () {
  return new Item(
    'Sword',
    'A trusty steel sword. Monsters flee before it.',
    { use: () => 'The sword gleams in the torchlight.' }
  )
}

export function createAmulet () {
  return new Item('Amulet of Eldergrove', 'The legendary amulet you were sent to retrieve.', {})
}

/* ------------------------------------------------------------------ */
/* Hazard factories                                                    */
/* ------------------------------------------------------------------ */

export function createMonster () {
  return new Hazard(
    'Monster',
    'A snarling cave monster.',
    (player) => (player.hasItem('Sword') ? 0 : 20)
  )
}

export function createTrap () {
  return new Hazard('Trap', 'A hidden spike trap.', () => 10)
}

export function createSwamp () {
  return new Hazard('Swamp', 'A murky swamp that drags you down.', () => 15)
}

/* ------------------------------------------------------------------ */
/* Map generation                                                      */
/* ------------------------------------------------------------------ */

/**
 * Builds a fixed, deterministic map. This is used for the default game and in
 * unit tests, because every placement is predictable.
 */
export function generateStandardMap (width = 8, height = 8) {
  const world = new World(width, height).generate()

  const layout = {
    exit: { x: width - 1, y: height - 1 },
    walls: [[1, 1], [3, 2], [5, 3], [2, 5], [6, 4], [4, 6]],
    treasure: { x: 6, y: 6 },
    key: { x: 2, y: 4 },
    sword: { x: 4, y: 5 },
    potions: [[3, 1], [5, 2]],
    monsters: [[1, 3], [5, 4]],
    traps: [[2, 2]],
    swamps: [[6, 1]]
  }

  for (const [x, y] of layout.walls) {
    world.setLocation(new Location(x, y, TILE.WALL, 'A solid stone wall.'))
  }

  world.setLocation(new Location(layout.exit.x, layout.exit.y, TILE.EXIT, 'The dungeon exit.'))

  const treasure = world.getLocation(layout.treasure.x, layout.treasure.y)
  treasure.type = TILE.TREASURE
  treasure.description = 'A pedestal holding the Amulet of Eldergrove.'
  treasure.addItem(createAmulet())

  world.getLocation(layout.key.x, layout.key.y).addItem(createKey())
  world.getLocation(layout.sword.x, layout.sword.y).addItem(createSword())
  for (const [x, y] of layout.potions) world.getLocation(x, y).addItem(createPotion())
  for (const [x, y] of layout.monsters) world.getLocation(x, y).addHazard(createMonster())
  for (const [x, y] of layout.traps) world.getLocation(x, y).addHazard(createTrap())
  for (const [x, y] of layout.swamps) world.getLocation(x, y).addHazard(createSwamp())

  return world
}

/**
 * Builds a pseudo-random map using a seeded PRNG so each seed produces a
 * unique but reproducible experience.
 */
export function generateRandomMap (width, height, rng) {
  const world = new World(width, height).generate()
  const start = { x: 0, y: 0 }
  const exit = { x: width - 1, y: height - 1 }

  world.setLocation(new Location(exit.x, exit.y, TILE.EXIT, 'The dungeon exit.'))

  // Every walkable interior cell, excluding start and exit.
  const candidates = [...world.locations()].filter(
    (location) =>
      location.type === TILE.GRASS &&
      !(location.x === start.x && location.y === start.y) &&
      !(location.x === exit.x && location.y === exit.y)
  )
  const shuffled = shuffle(rng, candidates)

  // About 20% of interior cells become walls.
  const wallCount = Math.floor(candidates.length * 0.2)
  for (const cell of shuffled.slice(0, wallCount)) cell.type = TILE.WALL

  const open = shuffled.slice(wallCount)

  // The first remaining cell holds the treasure (Amulet).
  if (open.length > 0) {
    open[0].type = TILE.TREASURE
    open[0].description = 'A pedestal holding the Amulet of Eldergrove.'
    open[0].addItem(createAmulet())
  }

  // Scatter the remaining content onto distinct cells.
  const placements = [
    (cell) => cell.addItem(createKey()),
    (cell) => cell.addItem(createSword()),
    (cell) => cell.addItem(createPotion()),
    (cell) => cell.addItem(createPotion()),
    (cell) => cell.addHazard(createMonster()),
    (cell) => cell.addHazard(createMonster()),
    (cell) => cell.addHazard(createTrap()),
    (cell) => cell.addHazard(createSwamp())
  ]

  placements.forEach((place, index) => {
    const cell = open[index + 1]
    if (cell) place(cell)
  })

  return world
}
