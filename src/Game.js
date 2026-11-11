/**
 * The overarching controller for the game. It owns the world, the player and
 * the current state (welcome/playing/won/lost), and processes player commands
 * such as moving, interacting and using items.
 */

export const GAME_STATE = {
  WELCOME: 'welcome',
  PLAYING: 'playing',
  WON: 'won',
  LOST: 'lost'
}

const DIRECTIONS = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 }
}

export class Game {
  constructor (world, player, { objective = 'Find the Amulet of Eldergrove and escape.', start = { x: 0, y: 0 } } = {}) {
    this.world = world
    this.player = player
    this.objective = objective
    this.state = GAME_STATE.WELCOME
    this.exitUnlocked = false
    this.log = []

    this.player.x = start.x
    this.player.y = start.y
    this.player.health = this.player.maxHealth
    this.player.inventory = []
  }

  /** Starts (or restarts) the game and returns `this`. */
  start () {
    this.state = GAME_STATE.PLAYING
    this.addLog(this.objective)
    return this
  }

  addLog (message) {
    this.log.push(message)
    return message
  }

  /** A snapshot of the message log. */
  get messages () {
    return [...this.log]
  }

  isPlaying () {
    return this.state === GAME_STATE.PLAYING
  }

  /**
   * Moves the player one step in the given direction. Returns a result object
   * describing what happened so both the UI and the unit tests can react to it.
   */
  move (direction) {
    const empty = { moved: false, blocked: false, won: false, lost: false, damage: 0, messages: [] }
    if (!this.isPlaying()) return empty

    const vector = DIRECTIONS[direction]
    if (!vector) throw new Error(`Unknown direction "${direction}".`)

    const nx = this.player.x + vector.dx
    const ny = this.player.y + vector.dy
    const target = this.world.getLocation(nx, ny)

    if (!target || !target.isWalkable()) {
      this.addLog('The way is blocked.')
      return { ...empty, blocked: true, messages: ['The way is blocked.'] }
    }

    this.player.move(vector.dx, vector.dy)
    const messages = []
    let damage = 0

    // Apply every hazard on the target location.
    for (const hazard of target.hazards) {
      const dealt = hazard.trigger(this.player)
      damage += dealt
      this.player.takeDamage(dealt)
      messages.push(
        dealt > 0
          ? `You were hurt by ${hazard.name} for ${dealt} damage!`
          : `You fended off the ${hazard.name} with your sword!`
      )
    }

    messages.push(target.summarize())

    let won = false
    if (target.type === 'exit') {
      const exitResult = this.resolveExit()
      messages.push(...exitResult.messages)
      won = exitResult.won
    }

    const lost = !this.player.isAlive()
    if (won) this.end(GAME_STATE.WON)
    else if (lost) this.end(GAME_STATE.LOST)

    for (const message of messages) this.addLog(message)

    return { moved: true, blocked: false, won, lost, damage, messages, location: target }
  }

  /** Handles arriving at / using the locked exit. */
  resolveExit () {
    if (!this.exitUnlocked) {
      if (this.player.hasItem('Key')) {
        this.player.removeItem(this.player.getItem('Key'))
        this.exitUnlocked = true
        // Fall through to check whether the amulet is carried too.
      } else {
        return { unlocked: false, won: false, messages: ['The exit is locked. Find the key!'] }
      }
    }

    if (this.player.hasItem('Amulet of Eldergrove')) {
      return { unlocked: this.exitUnlocked, won: true, messages: ['You escape with the Amulet of Eldergrove!'] }
    }
    return { unlocked: this.exitUnlocked, won: false, messages: ['The exit is open, but you need the Amulet of Eldergrove!'] }
  }

  /** Picks up every item at the player's current location. */
  interact () {
    if (!this.isPlaying()) return { pickedUp: [], messages: [] }
    const location = this.world.getLocation(this.player.x, this.player.y)
    const pickedUp = []
    const messages = []

    if (location.items.length > 0) {
      for (const item of [...location.items]) {
        this.player.addItem(item)
        location.removeItem(item)
        pickedUp.push(item)
        messages.push(`You picked up: ${item.name}`)
      }
    } else {
      messages.push('There is nothing to pick up here.')
    }

    for (const message of messages) this.addLog(message)
    return { pickedUp, messages }
  }

  /** Uses the inventory item at the given index. */
  useItem (index) {
    if (!this.isPlaying()) return { used: false, message: 'The game is not running.' }
    const item = this.player.inventory[index]
    if (!item) return { used: false, message: 'That item does not exist in your inventory.' }

    let result
    try {
      result = item.use(this.player, this)
    } catch (error) {
      this.addLog(error.message)
      return { used: false, message: error.message }
    }

    const message = typeof result === 'string' ? result : `You used ${item.name}.`
    if (item.consumable) this.player.removeItem(item)
    this.addLog(message)
    return { used: true, message }
  }

  end (state) {
    this.state = state
    return this
  }
}
