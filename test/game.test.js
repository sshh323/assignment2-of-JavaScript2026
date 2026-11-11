import { describe, expect, it } from 'vitest'
import { Game, GAME_STATE } from '../src/Game.js'
import { Player } from '../src/Player.js'
import {
  createAmulet,
  createKey,
  createPotion,
  createSword,
  generateStandardMap
} from '../src/mapGenerator.js'

function makeGame () {
  const world = generateStandardMap(8, 8)
  const player = new Player(0, 0, 100)
  return new Game(world, player, { objective: 'Test objective' })
}

describe('Game', () => {
  describe('start / state', () => {
    it('starts in the welcome state and moves to playing on start', () => {
      const game = makeGame()
      expect(game.state).toBe(GAME_STATE.WELCOME)
      game.start()
      expect(game.state).toBe(GAME_STATE.PLAYING)
    })

    it('does not move while not playing', () => {
      const game = makeGame()
      const result = game.move('right')
      expect(result.moved).toBe(false)
      expect(game.player.x).toBe(0)
    })
  })

  describe('move', () => {
    it('moves onto an empty grass tile', () => {
      const game = makeGame()
      game.start()
      const result = game.move('right')
      expect(result.moved).toBe(true)
      expect(result.damage).toBe(0)
      expect(game.player.x).toBe(1)
      expect(game.player.y).toBe(0)
    })

    it('is blocked by a wall', () => {
      const game = makeGame()
      game.start()
      game.player.x = 1
      game.player.y = 0
      const result = game.move('down') // (1, 1) is a wall
      expect(result.moved).toBe(false)
      expect(result.blocked).toBe(true)
      expect(game.player.x).toBe(1)
      expect(game.player.y).toBe(0)
    })

    it('throws for an unknown direction', () => {
      const game = makeGame()
      game.start()
      expect(() => game.move('north')).toThrow(/Unknown direction/)
    })

    it('takes damage from a monster', () => {
      const game = makeGame()
      game.start()
      game.player.x = 0
      game.player.y = 3
      const result = game.move('right') // (1, 3) has a monster
      expect(result.damage).toBe(20)
      expect(game.player.health).toBe(80)
    })

    it('fends off a monster when carrying the sword', () => {
      const game = makeGame()
      game.start()
      game.player.addItem(createSword())
      game.player.x = 0
      game.player.y = 3
      const result = game.move('right')
      expect(result.damage).toBe(0)
      expect(game.player.health).toBe(100)
    })
  })

  describe('interact', () => {
    it('picks up every item at the location', () => {
      const game = makeGame()
      game.start()
      game.player.x = 2
      game.player.y = 4 // key location
      const result = game.interact()
      expect(result.pickedUp.map((item) => item.name)).toContain('Key')
      expect(game.player.hasItem('Key')).toBe(true)
      expect(game.world.getLocation(2, 4).items).toHaveLength(0)
    })

    it('reports when there is nothing to pick up', () => {
      const game = makeGame()
      game.start()
      const result = game.interact()
      expect(result.pickedUp).toEqual([])
      expect(result.messages).toContain('There is nothing to pick up here.')
    })
  })

  describe('useItem', () => {
    it('drinks a potion to heal and consumes it', () => {
      const game = makeGame()
      game.start()
      game.player.health = 50
      game.player.addItem(createPotion())
      const result = game.useItem(0)
      expect(result.used).toBe(true)
      expect(game.player.health).toBe(80)
      expect(game.player.inventory).toHaveLength(0)
    })

    it('returns a failure for an empty inventory slot', () => {
      const game = makeGame()
      game.start()
      const result = game.useItem(0)
      expect(result.used).toBe(false)
    })
  })

  describe('win / loss conditions', () => {
    it('locks the exit when the player has no key', () => {
      const game = makeGame()
      game.start()
      game.player.x = 6
      game.player.y = 7
      const result = game.move('right') // (7, 7) exit
      expect(result.won).toBe(false)
      expect(game.exitUnlocked).toBe(false)
      expect(game.state).toBe(GAME_STATE.PLAYING)
      expect(result.messages).toContain('The exit is locked. Find the key!')
    })

    it('unlocks the exit but still needs the amulet', () => {
      const game = makeGame()
      game.start()
      game.player.addItem(createKey())
      game.player.x = 6
      game.player.y = 7
      const result = game.move('right')
      expect(game.exitUnlocked).toBe(true)
      expect(result.won).toBe(false)
    })

    it('wins when reaching the open exit with the amulet', () => {
      const game = makeGame()
      game.start()
      game.player.addItem(createKey())
      game.player.addItem(createAmulet())
      game.player.x = 6
      game.player.y = 7
      const result = game.move('right')
      expect(result.won).toBe(true)
      expect(game.state).toBe(GAME_STATE.WON)
    })

    it('loses when health reaches zero', () => {
      const game = makeGame()
      game.start()
      game.player.health = 10
      game.player.x = 0
      game.player.y = 3
      const result = game.move('right') // monster deals 20
      expect(result.lost).toBe(true)
      expect(game.state).toBe(GAME_STATE.LOST)
    })
  })
})
