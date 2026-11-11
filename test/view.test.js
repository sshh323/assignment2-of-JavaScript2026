import { describe, expect, it } from 'vitest'
import {
  createTile,
  renderLog,
  renderStatus,
  renderWorld,
  tileGlyph
} from '../src/view.js'
import { World } from '../src/World.js'
import { Location } from '../src/Location.js'
import { Player } from '../src/Player.js'
import { Game } from '../src/Game.js'
import { createAmulet } from '../src/mapGenerator.js'

// Minimal mock of a DOM element and document, standing in for the browser's
// web API so the rendering code can be unit tested without a real DOM.
function createMockElement () {
  return {
    children: [],
    className: '',
    textContent: '',
    dataset: {},
    appendChild (child) {
      this.children.push(child)
      return child
    },
    replaceChildren (...children) {
      this.children = children
    },
    append (...children) {
      this.children.push(...children)
    }
  }
}

function createMockDocument () {
  return { createElement: () => createMockElement() }
}

describe('view (DOM rendering with a mocked document)', () => {
  it('renders one tile per world cell', () => {
    const doc = createMockDocument()
    const world = new World(3, 2).generate()
    const player = new Player(1, 1)
    const container = createMockElement()

    renderWorld(doc, world, player, container)

    expect(container.children).toHaveLength(2) // 2 rows
    expect(container.children[0].children).toHaveLength(3) // 3 tiles per row
  })

  it('marks the player tile and shows the player glyph', () => {
    const doc = createMockDocument()
    const world = new World(3, 2).generate()
    const player = new Player(1, 1)
    const container = createMockElement()

    renderWorld(doc, world, player, container)

    const playerTile = container.children[1].children[1]
    expect(playerTile.className).toContain('tile-player')
    expect(playerTile.textContent).toBe('🧙')
  })

  it('assigns the right glyph per location type', () => {
    const player = new Player(9, 9)
    expect(tileGlyph(new Location(0, 0, 'wall'), player)).toBe('🧱')
    expect(tileGlyph(new Location(0, 0, 'exit'), player)).toBe('🚪')
    expect(tileGlyph(new Location(0, 0, 'treasure'), player)).toBe('💎')
    expect(tileGlyph(new Location(0, 0, 'grass'), player)).toBe('·')
  })

  it('creates a tile element with a class and data attributes', () => {
    const doc = createMockDocument()
    const location = new Location(1, 2, 'grass')
    const player = new Player(0, 0)
    const el = createTile(doc, location, player)
    expect(el.className).toBe('tile tile-grass')
    expect(el.dataset.x).toBe('1')
    expect(el.dataset.y).toBe('2')
  })

  it('renders the status bar with health, position and inventory', () => {
    const doc = createMockDocument()
    const player = new Player(2, 3, 100)
    player.addItem(createAmulet())
    const container = createMockElement()

    renderStatus(doc, player, container)

    expect(container.children).toHaveLength(3)
    expect(container.children[0].textContent).toContain('100/100')
    expect(container.children[1].textContent).toContain('(2, 3)')
    expect(container.children[2].textContent).toContain('Amulet of Eldergrove')
  })

  it('renders the last few log messages', () => {
    const doc = createMockDocument()
    const game = new Game(new World(2, 2).generate(), new Player(0, 0))
    for (const n of ['one', 'two', 'three', 'four', 'five', 'six']) game.addLog(n)
    const container = createMockElement()

    renderLog(doc, game, container)

    expect(container.children).toHaveLength(5)
    expect(container.children[4].textContent).toBe('six')
  })
})
