# Video Walkthrough Script — The Lost Amulet of Eldergrove

> Use this as a guide while recording your Canvas Studio video. It follows the
> assignment's required order and includes suggested timings so the final video
> lands between 10 and 20 minutes. Speak naturally; do not read it word-for-word.

**Suggested total:** ~16 minutes

| Section | Approx. time |
|---|---|
| 1. Introduction | 1 min |
| 2. Game Logic | 2 min |
| 3. Code Structure | 3–4 min |
| 4. Test & Code Walkthrough | 6–8 min |
| 5. Challenges | 2 min |
| 6. Learning & Reflection | 2 min |

---

## 1. Introduction (≈ 1 minute)

- State your name and course id (e.g. "My name is [Name], course BTH012").
- "This is my web adventure game — **The Lost Amulet of Eldergrove**."
- One sentence on the objective:
  > "The player explores a dungeon grid to find the **Amulet of Eldergrove** and a
  > **Key**, then escapes through the locked **Exit** — while avoiding monsters, traps
  > and swamps."
- Open `index.html` and click **Start** to show the welcome screen and the map.

## 2. Game Logic (≈ 2 minutes)

- Show the welcome screen and read the objective text briefly.
- Explain the core loop:
  - Move with **WASD / arrow keys**.
  - Pick up items with **E / Enter**.
  - Use inventory items with **1–4**.
  - Toggle fullscreen with **F** or the button.
- Demonstrate a short play session: move around, pick up the Key, step on a
  monster to show the health bar dropping and the screen shake, drink a potion.
- Explain win/loss:
  - **Win**: reach the open Exit while carrying the Amulet.
  - **Lose**: health reaches 0.
- Mention the map is rendered into the DOM and redrawn after every command.

## 3. Code Structure (≈ 3–4 minutes)

Walk through the project tree in VS Code, file by file.

- **`index.html`** — three `<section>` screens (welcome / game / end), a `#world-container`
  for the map, and `<script type="module" src="src/main.js">`. Note the relative paths
  (`css/style.css`, `src/main.js`) so it works on GitHub Pages under any base path.
- **`css/style.css`** — all styling lives here (no inline styles). Point out the 5
  `@keyframes` animations: `fade-in`, `float`, `pulse` (player tile), `treasure-glow`
  (treasure/exit/button), and `shake` (damage feedback).
- **`src/main.js`** — the thin browser entry point. Explain:
  - `createGame(random)` builds a `World` + `Player` + `Game`.
  - `setup(doc, win)` wires the buttons, the `keydown` listener and fullscreen.
  - The `KEY_TO_DIRECTION` map converts key names to direction strings.
  - `render()` calls the three render functions after every command.
- **`src/Game.js`** — the controller. Explain the state machine
  (`welcome → playing → won/lost`) and how a command flows:
  - "When the player presses a movement key, `move(direction)` looks up the target
    location, blocks on walls, applies hazards, resolves the exit, and checks win/loss."
  - Show a concrete example: `move('right')` → reads `DIRECTIONS.right` → `{dx:1, dy:0}`.

**Example — how a command is processed (show this in code):**
```js
move (direction) {
  const vector = DIRECTIONS[direction]          // e.g. right -> { dx: 1, dy: 0 }
  const target = this.world.getLocation(this.player.x + vector.dx, this.player.y + vector.dy)
  if (!target || !target.isWalkable()) return { moved: false, blocked: true, ... }
  this.player.move(vector.dx, vector.dy)
  // apply hazards, resolve exit, check win/loss, then log messages
}
```

- **`src/World.js`** — the 2D grid (`grid[y][x]` of `Location` objects). Point out the
  `* locations()` **generator** and the `rows` getter, plus `getLocation`, `setLocation`,
  `findLocationsByType` (functional `.filter`) and `getNeighbors`.
- **`src/Location.js`** — a tile: `type`, `description`, `items[]`, `hazards[]`; `isWalkable()`
  and `summarize()`.
- **`src/Item.js`** — `name`, `description`, and an `actions` map of **arrow functions**;
  `performAction(name, player, game)` and `use()`.
- **`src/Hazard.js`** — `name`, `description`, and `apply(player) => damage`; `trigger(player)`.
- **`src/Player.js`** — position, health, inventory; damage/healing with clamping.
- **`src/mapGenerator.js`** — item/hazard factories and the two map builders
  (`generateStandardMap` for the fixed map, `generateRandomMap` for the seeded random map).
- **`src/random.js`** — seeded PRNG (`createRng` via mulberry32) + `shuffle`/`pick`/`randomInt`.
- **`src/view.js`** — DOM rendering that receives a `doc` object (so it is mockable in tests).
- **`src/persistence.js`** — optional save/load with Node `fs/promises`.

Explain **why** this structure: pure logic is decoupled from DOM/browser so it can be
unit-tested in isolation, and the rendering layer takes a `doc` object so it can be tested
with a mocked document.

## 4. Test & Code Walkthrough (≈ 6–8 minutes)

Start from the tests and link each one back to the code. Open `test/` and run
`npm test` once so the green output is visible on screen.

### 4.1 Game class (`test/game.test.js` → `src/Game.js`)

Open `test/game.test.js`. For each group, read the test, then show the matching code.

- **`describe('start / state')`** — "starts in the welcome state and moves to playing on start"
  and "does not move while not playing".
  → Show `Game.start()` and the early return in `move()` when `!this.isPlaying()`.
  Design choice: the game only reacts to commands while in the `playing` state.

- **`describe('move')`** — "moves onto an empty grass tile", "is blocked by a wall",
  "throws for an unknown direction".
  → Show `DIRECTIONS`, the `getLocation` lookup and the `isWalkable()` guard.
  → "takes damage from a monster" and "fends off a monster when carrying the sword".
  → Show the hazard loop in `move()` and the Monster `apply` arrow function
    `(player) => player.hasItem('Sword') ? 0 : 20`.

- **`describe('interact')`** — "picks up every item at the location" and
  "reports when there is nothing to pick up".
  → Show `interact()` iterating over `[...location.items]`, adding each to the player
    and removing it from the tile.

- **`describe('useItem')`** — "drinks a potion to heal and consumes it".
  → Show `useItem()` calling `item.use(player, game)`, and the Potion `use` arrow
    function `player.heal(30)` plus the `consumable` flag.

- **`describe('win / loss conditions')`** — "locks the exit when the player has no key",
  "unlocks the exit but still needs the amulet", "wins when reaching the open exit with
  the amulet", "loses when health reaches zero".
  → Show `resolveExit()` (key consumed → unlocked → checks amulet) and the
    `end(GAME_STATE.WON/LOST)` calls in `move()`.

### 4.2 World class (`test/world.test.js` → `src/World.js`)

- "generates a grid of the requested size", "is iterable via the locations generator".
  → Show `World.generate()` and the `* locations()` **generator** (this is the
    generator/iterator requirement).
- "returns locations in bounds and null out of bounds", "sets a location at the correct cell".
  → Show `inBounds()`, `getLocation()` and `setLocation()` with `grid[y][x]`.
- "finds locations by type" → show the functional `.filter` in `findLocationsByType`.
- "returns only in-bounds neighbours" → show `getNeighbors()` using `.map` + `.filter`.

### 4.3 Player, Item, Hazard, Location (small classes)

- **`test/player.test.js` → `src/Player.js`** — movement, add/find/remove items, damage/healing
  clamping (health never below 0, never above max), `isAlive`, `inventoryNames`.
  → Show the `Math.max(0, ...)` / `Math.min(max, ...)` clamps.
- **`test/item.test.js` → `src/Item.js`** — "invokes an action with player and game",
  "throws for an unknown action name", "throws when using an item with no use action".
  → Show the `actions` map and `performAction`/`use`.
- **`test/hazard.test.js` → `src/Hazard.js`** — "returns the damage from its apply function",
  "receives the player as an argument". → Show `trigger(player)`.
- **`test/location.test.js` → `src/Location.js`** — add/remove items & hazards, `isWalkable`,
  `summarize`.

### 4.4 Map generation (`test/mapGenerator.test.js` → `src/mapGenerator.js`)

- "creates a health potion that heals the player" and "creates a monster that deals 20 damage".
- "places the exit / treasure / key / hazards / walls as expected" — the deterministic standard map.
- "is deterministic for the same seed" — two `generateRandomMap(8, 8, createRng(42))` calls
  produce identical grids. → Show `createRng` (mulberry32) in `src/random.js`.
  This is the **pseudo-random map** extra-credit feature.

### 4.5 Persistence (`test/persistence.test.js` → `src/persistence.js`)

- "serializes and deserializes a game round-trip" and "writes and reads a game file on disk".
  → Show `serializeGame` / `deserializeGame` and `saveGame` / `loadGame` using `node:fs/promises`.
  Note the subtlety: the `Game` constructor resets the player, so `deserializeGame`
  restores position/health/inventory **after** constructing the game.

### 4.6 View with a mocked document (`test/view.test.js` → `src/view.js`)

- Explain that `renderWorld`/`renderStatus`/`renderLog` receive a `doc` object, so the test
  supplies a tiny fake document (`createElement` returns a plain object). This is the
  **"unit tests mock global objects"** requirement.
- "renders one tile per world cell", "marks the player tile and shows the player glyph",
  "assigns the right glyph per location type", "renders the status bar", "renders the last
  few log messages".
  → Show `createMockElement()` in the test and the real `createTile`/`tileGlyph` in `view.js`.

## 5. Challenges and How I Overcame Them (≈ 2 minutes)

- **Decoupling DOM from logic for testability** — initially the rendering was tangled with the
  game logic; I moved it into `view.js` functions that take a `doc` object so the tests can
  mock the document instead of needing a real browser (jsdom).
- **Serialization round-trip bug** — the `Game` constructor resets the player, which broke
  `deserializeGame`; I fixed it by restoring player state *after* constructing the `Game`.
- **Making the map both random and testable** — a fully random map is hard to assert on, so I
  used a seeded PRNG (`createRng`), which gives reproducible "random" maps.
- Mention any place where the final code differs from the original Part A design document
  (e.g. adding `resolveExit()` as a separate method, splitting `view.js` from `main.js`).

## 6. Learning & Reflection (≈ 2 minutes)

- What I learned: separating pure logic from I/O makes code dramatically easier to test;
  generators (`* locations()`) are a clean way to expose iteration; arrow functions stored in
  an `actions` map give items a clean, extensible behaviour.
- Surprises: how useful a seeded PRNG is for testing "random" behaviour; how much CSS
  animations can do for game feedback without any JavaScript.
- What I would do differently next time: plan the class boundaries even earlier (the
  test-first mindset), and add a small combat system or more puzzles to make gameplay deeper.



