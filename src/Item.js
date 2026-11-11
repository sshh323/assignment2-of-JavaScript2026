/**
 * An item the player can pick up, carry and use.
 *
 * `actions` is a map of action names to arrow functions. Each function is
 * invoked with `(player, game)` and may return a value (often a message string).
 */
export class Item {
  constructor (name, description = '', actions = {}, { consumable = false } = {}) {
    this.name = name
    this.description = description
    this.actions = actions
    this.consumable = consumable
  }

  /** True when the item exposes an action with the given name. */
  hasAction (name) {
    return typeof this.actions[name] === 'function'
  }

  /** Invokes the named action and returns its result. */
  performAction (name, player, game) {
    if (!this.hasAction(name)) {
      throw new Error(`"${this.name}" has no action named "${name}".`)
    }
    return this.actions[name](player, game)
  }

  /** Invokes the item's primary "use" action. */
  use (player, game) {
    if (!this.hasAction('use')) {
      throw new Error(`"${this.name}" cannot be used.`)
    }
    return this.performAction('use', player, game)
  }
}
