import { Location } from './Location.js'

/**
 * Represents the game world as a two-dimensional array of Location objects.
 *
 * `grid` is indexed as `grid[y][x]` (row-major). A generator (`locations`)
 * and a `rows` getter expose the grid in a convenient, iterable form.
 */
export class World {
  constructor (width, height) {
    this.width = width
    this.height = height
    this.grid = []
  }

  /** Fills the world with empty grass locations. */
  generate () {
    this.grid = []
    for (let y = 0; y < this.height; y++) {
      const row = []
      for (let x = 0; x < this.width; x++) {
        row.push(new Location(x, y, 'grass', 'A grassy clearing.'))
      }
      this.grid.push(row)
    }
    return this
  }

  inBounds (x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height
  }

  /** Returns the location at (x, y), or null when out of bounds. */
  getLocation (x, y) {
    return this.inBounds(x, y) ? this.grid[y][x] : null
  }

  setLocation (location) {
    if (this.inBounds(location.x, location.y)) {
      this.grid[location.y][location.x] = location
    }
    return this
  }

  /** The grid as an array of rows (each row is an array of locations). */
  get rows () {
    return this.grid
  }

  /** Generator that yields every location in row-major order. */
  * locations () {
    for (const row of this.grid) {
      for (const location of row) {
        yield location
      }
    }
  }

  /** Returns every location whose type matches (functional style). */
  findLocationsByType (type) {
    return [...this.locations()].filter((location) => location.type === type)
  }

  /** Returns the in-bounds neighbours of (x, y). */
  getNeighbors (x, y) {
    return [
      [x, y - 1],
      [x, y + 1],
      [x - 1, y],
      [x + 1, y]
    ]
      .map(([nx, ny]) => this.getLocation(nx, ny))
      .filter((location) => location !== null)
  }
}
