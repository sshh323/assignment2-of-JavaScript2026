/**
 * A hazard that affects the player when they step onto its location.
 *
 * `apply` is a function `(player) => damage` that describes the effect of the
 * hazard (e.g. a monster attacking or a swamp drowning the player).
 */
export class Hazard {
  constructor (name, description = '', apply = () => 0) {
    this.name = name
    this.description = description
    this.apply = apply
  }

  /** Applies the hazard to a player and returns the amount of damage dealt. */
  trigger (player) {
    return this.apply(player)
  }
}
