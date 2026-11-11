/**
 * Holds player-specific state: position, health and inventory.
 */
export class Player {
  constructor (x, y, health = 100) {
    this.x = x
    this.y = y
    this.maxHealth = health
    this.health = health
    this.inventory = []
  }

  /** Moves the player by the given offset. */
  move (dx, dy) {
    this.x += dx
    this.y += dy
    return this
  }

  addItem (item) {
    this.inventory.push(item)
    return this
  }

  removeItem (item) {
    const index = this.inventory.indexOf(item)
    if (index !== -1) this.inventory.splice(index, 1)
    return this
  }

  /** True when an item with the given name is carried. */
  hasItem (name) {
    return this.inventory.some((item) => item.name === name)
  }

  /** Returns the first item with the given name, or null. */
  getItem (name) {
    return this.inventory.find((item) => item.name === name) ?? null
  }

  /** Reduces health by `amount` (never below zero) and returns the new value. */
  takeDamage (amount) {
    this.health = Math.max(0, this.health - amount)
    return this.health
  }

  /** Restores health by `amount` (never above max) and returns the new value. */
  heal (amount) {
    this.health = Math.min(this.maxHealth, this.health + amount)
    return this.health
  }

  isAlive () {
    return this.health > 0
  }

  /** The names of every item currently carried. */
  get inventoryNames () {
    return this.inventory.map((item) => item.name)
  }
}
