import { describe, expect, it } from 'vitest'
import { World } from '../src/World.js'
import { Location } from '../src/Location.js'

describe('World', () => {
  it('generates a grid of the requested size', () => {
    const world = new World(4, 3).generate()
    expect(world.width).toBe(4)
    expect(world.height).toBe(3)
    expect(world.rows).toHaveLength(3)
    expect(world.rows[0]).toHaveLength(4)
  })

  it('is iterable via the locations generator', () => {
    const world = new World(3, 2).generate()
    const locations = [...world.locations()]
    expect(locations).toHaveLength(6)
    expect(locations[0]).toBeInstanceOf(Location)
  })

  it('returns locations in bounds and null out of bounds', () => {
    const world = new World(3, 3).generate()
    expect(world.getLocation(1, 1)).not.toBeNull()
    expect(world.getLocation(3, 3)).toBeNull()
    expect(world.getLocation(-1, 0)).toBeNull()
  })

  it('sets a location at the correct cell', () => {
    const world = new World(3, 3).generate()
    const wall = new Location(1, 1, 'wall', 'A wall.')
    world.setLocation(wall)
    expect(world.getLocation(1, 1)).toBe(wall)
  })

  it('finds locations by type', () => {
    const world = new World(3, 3).generate()
    world.setLocation(new Location(0, 0, 'wall', ''))
    world.setLocation(new Location(2, 2, 'wall', ''))
    expect(world.findLocationsByType('wall')).toHaveLength(2)
  })

  it('returns only in-bounds neighbours', () => {
    const world = new World(3, 3).generate()
    expect(world.getNeighbors(0, 0)).toHaveLength(2)
    expect(world.getNeighbors(1, 1)).toHaveLength(4)
  })
})
