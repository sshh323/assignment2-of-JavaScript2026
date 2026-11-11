/**
 * Save / load game state using Node.js's file system module (optional feature).
 *
 * A game is serialised to a plain JSON object so it can be written to disk and
 * later reconstructed with fresh class instances (Item, Hazard, Location, ...).
 */
import { writeFile, readFile } from 'node:fs/promises'
import { World } from './World.js'
import { Location } from './Location.js'
import { Player } from './Player.js'
import { Game } from './Game.js'
import {
  createAmulet,
  createKey,
  createMonster,
  createPotion,
  createSword,
  createSwamp,
  createTrap
} from './mapGenerator.js'

const ITEM_FACTORY = {
  'Health Potion': createPotion,
  Key: createKey,
  Sword: createSword,
  'Amulet of Eldergrove': createAmulet
}

const HAZARD_FACTORY = {
  Monster: createMonster,
  Trap: createTrap,
  Swamp: createSwamp
}

/** Serialises a world to a plain object. */
export function serializeWorld (world) {
  return {
    width: world.width,
    height: world.height,
    tiles: [...world.locations()].map((location) => ({
      x: location.x,
      y: location.y,
      type: location.type,
      description: location.description,
      items: location.items.map((item) => item.name),
      hazards: location.hazards.map((hazard) => hazard.name)
    }))
  }
}

/** Serialises a full game to a plain object. */
export function serializeGame (game) {
  return {
    world: serializeWorld(game.world),
    player: {
      x: game.player.x,
      y: game.player.y,
      health: game.player.health,
      inventory: game.player.inventory.map((item) => item.name)
    },
    state: game.state,
    exitUnlocked: game.exitUnlocked,
    objective: game.objective,
    log: game.messages
  }
}

/** Rebuilds a Game (with proper class instances) from a serialised object. */
export function deserializeGame (data) {
  const world = new World(data.world.width, data.world.height).generate()
  for (const tile of data.world.tiles) {
    const location = new Location(tile.x, tile.y, tile.type, tile.description)
    for (const name of tile.items) location.addItem(ITEM_FACTORY[name]())
    for (const name of tile.hazards) location.addHazard(HAZARD_FACTORY[name]())
    world.setLocation(location)
  }

  const player = new Player(0, 0, 100)
  const game = new Game(world, player, { objective: data.objective })

  // The Game constructor resets the player, so restore persisted state after.
  player.x = data.player.x
  player.y = data.player.y
  player.health = data.player.health
  for (const name of data.player.inventory) player.addItem(ITEM_FACTORY[name]())

  game.state = data.state
  game.exitUnlocked = data.exitUnlocked
  game.log = [...data.log]
  return game
}

/** Writes a game to `filePath` as JSON. */
export async function saveGame (filePath, game) {
  const json = JSON.stringify(serializeGame(game), null, 2)
  await writeFile(filePath, json, 'utf8')
  return filePath
}

/** Reads a game from `filePath` and reconstructs it. */
export async function loadGame (filePath) {
  const json = await readFile(filePath, 'utf8')
  return deserializeGame(JSON.parse(json))
}
