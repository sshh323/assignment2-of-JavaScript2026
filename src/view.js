/**
 * DOM rendering helpers.
 *
 * Every function receives a `doc` (a `document`-like object) so the rendering
 * can be unit tested with a mocked document — no real DOM is required.
 * All visual styling is applied through CSS classes, never inline styles.
 */

const TILE_EMOJI = {
  grass: '',
  wall: '🧱',
  treasure: '💎',
  exit: '🚪'
}

const ITEM_EMOJI = {
  'Health Potion': '🧪',
  Key: '🗝️',
  Sword: '⚔️',
  'Amulet of Eldergrove': '📿'
}

const HAZARD_EMOJI = {
  Monster: '👹',
  Trap: '⚠️',
  Swamp: '🌊'
}

/** The glyph shown on a tile, prioritising the player, walls, goals, hazards and items. */
export function tileGlyph (location, player) {
  if (player.x === location.x && player.y === location.y) return '🧙'
  if (location.type === 'wall') return TILE_EMOJI.wall
  if (location.type === 'exit') return TILE_EMOJI.exit
  if (location.type === 'treasure') return TILE_EMOJI.treasure
  if (location.hazards.length > 0) return HAZARD_EMOJI[location.hazards[0].name] ?? '❗'
  if (location.items.length > 0) return ITEM_EMOJI[location.items[0].name] ?? '❓'
  return '·'
}

/** Creates the DOM element for a single tile. */
export function createTile (doc, location, player) {
  const el = doc.createElement('div')
  const classes = ['tile', `tile-${location.type}`]
  if (player.x === location.x && player.y === location.y) classes.push('tile-player')
  el.className = classes.join(' ')
  el.dataset.x = String(location.x)
  el.dataset.y = String(location.y)
  el.textContent = tileGlyph(location, player)
  return el
}

/** Renders the whole world grid into `container` (row by row). */
export function renderWorld (doc, world, player, container) {
  container.replaceChildren()
  for (const row of world.rows) {
    const rowEl = doc.createElement('div')
    rowEl.className = 'tile-row'
    for (const location of row) {
      rowEl.appendChild(createTile(doc, location, player))
    }
    container.appendChild(rowEl)
  }
  return container
}

/** Renders the status bar (health, position, inventory). */
export function renderStatus (doc, player, container) {
  container.replaceChildren()

  const hp = doc.createElement('div')
  hp.className = 'stat'
  hp.textContent = `❤️ Health: ${player.health}/${player.maxHealth}`

  const pos = doc.createElement('div')
  pos.className = 'stat'
  pos.textContent = `📍 Position: (${player.x}, ${player.y})`

  const inv = doc.createElement('div')
  inv.className = 'stat'
  const names = player.inventory.length > 0 ? player.inventory.map((item) => item.name).join(', ') : 'empty'
  inv.textContent = `🎒 Inventory: ${names}`

  container.append(hp, pos, inv)
  return container
}

/** Renders the last few log messages. */
export function renderLog (doc, game, container) {
  container.replaceChildren()
  for (const message of game.messages.slice(-5)) {
    const entry = doc.createElement('div')
    entry.className = 'log-entry'
    entry.textContent = message
    container.appendChild(entry)
  }
  return container
}
