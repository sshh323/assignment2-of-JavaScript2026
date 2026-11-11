/**
 * A single tile in the game world.
 *
 * A Location has a type (used for the graphics tile), a description, and may
 * contain an array of items and an array of hazards.
 */
export class Location {
  constructor (x, y, type = 'grass', description = '') {
    this.x = x
    this.y = y
    this.type = type
    this.description = description
    this.items = []
    this.hazards = []
  }

  addItem (item) {
    this.items.push(item)
    return this
  }

  removeItem (item) {
    const index = this.items.indexOf(item)
    if (index !== -1) this.items.splice(index, 1)
    return item
  }

  addHazard (hazard) {
    this.hazards.push(hazard)
    return this
  }

  /** True when the player is allowed to move onto this location. */
  isWalkable () {
    return this.type !== 'wall'
  }

  /** A short textual summary of what is at this location. */
  summarize () {
    const parts = []
    if (this.description) parts.push(this.description)
    if (this.items.length > 0) {
      parts.push(`Items: ${this.items.map((item) => item.name).join(', ')}`)
    }
    if (this.hazards.length > 0) {
      parts.push(`Danger: ${this.hazards.map((hazard) => hazard.name).join(', ')}`)
    }
    return parts.join(' | ')
  }
}
