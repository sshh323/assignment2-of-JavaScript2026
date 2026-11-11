import { describe, expect, it } from 'vitest'
import { Location } from '../src/Location.js'
import { Item } from '../src/Item.js'
import { Hazard } from '../src/Hazard.js'

describe('Location', () => {
  it('adds and removes items', () => {
    const location = new Location(0, 0)
    const item = new Item('Key', '')
    location.addItem(item)
    expect(location.items).toContain(item)
    location.removeItem(item)
    expect(location.items).not.toContain(item)
  })

  it('adds hazards', () => {
    const location = new Location(0, 0)
    const hazard = new Hazard('Monster', '')
    location.addHazard(hazard)
    expect(location.hazards).toContain(hazard)
  })

  it('treats only walls as not walkable', () => {
    expect(new Location(0, 0, 'wall').isWalkable()).toBe(false)
    expect(new Location(0, 0, 'grass').isWalkable()).toBe(true)
    expect(new Location(0, 0, 'exit').isWalkable()).toBe(true)
  })

  it('summarizes its contents', () => {
    const location = new Location(1, 1, 'grass', 'A clearing.')
    location.addItem(new Item('Key', ''))
    location.addHazard(new Hazard('Trap', ''))
    const summary = location.summarize()
    expect(summary).toContain('A clearing.')
    expect(summary).toContain('Key')
    expect(summary).toContain('Trap')
  })
})
