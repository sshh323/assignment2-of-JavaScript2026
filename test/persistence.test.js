import { describe, expect, it } from 'vitest'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Game } from '../src/Game.js'
import { Player } from '../src/Player.js'
import { createAmulet, createKey, generateStandardMap } from '../src/mapGenerator.js'
import { deserializeGame, loadGame, saveGame, serializeGame } from '../src/persistence.js'

describe('persistence', () => {
  it('serializes and deserializes a game round-trip', () => {
    const game = new Game(generateStandardMap(8, 8), new Player(0, 0, 100), { objective: 'obj' })
    game.start()
    game.player.addItem(createKey())
    game.player.addItem(createAmulet())
    game.player.x = 4
    game.player.y = 4
    game.player.health = 55

    const restored = deserializeGame(serializeGame(game))

    expect(restored.objective).toBe('obj')
    expect(restored.state).toBe(game.state)
    expect(restored.player.x).toBe(4)
    expect(restored.player.y).toBe(4)
    expect(restored.player.health).toBe(55)
    expect(restored.player.hasItem('Key')).toBe(true)
    expect(restored.player.hasItem('Amulet of Eldergrove')).toBe(true)
    expect(restored.world.getLocation(7, 7).type).toBe('exit')
    expect(restored.world.getLocation(6, 6).items[0].name).toBe('Amulet of Eldergrove')
  })

  it('writes and reads a game file on disk', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'adventure-'))
    const filePath = join(dir, 'savegame.json')
    try {
      const game = new Game(generateStandardMap(8, 8), new Player(0, 0, 100))
      game.start()
      game.player.addItem(createKey())
      game.move('right')

      await saveGame(filePath, game)
      const restored = await loadGame(filePath)

      expect(restored.player.x).toBe(1)
      expect(restored.player.hasItem('Key')).toBe(true)
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })
})
