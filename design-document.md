# Assignment 2 — Web Adventure Game
## Solution Design Document (Part A)

**Course:** BTH012 — Assignment 2
**Title:** The Lost Amulet of Eldergrove

---

## Overview

A keyboard-driven web adventure game. The world is a 2D grid of `Location`
objects rendered into the DOM. The player finds the **Key** and the
**Amulet of Eldergrove**, avoids hazards, and escapes through the locked **Exit**.

The design separates pure game logic (`src/` classes) from DOM rendering
(`src/view.js`) and browser glue (`src/main.js`) so logic can be unit tested in
isolation with Vitest, and DOM code tested using mocked web APIs.

---

## 1. Test Specifications

`describe` / `it` only; assertions omitted.

- **random utilities** — deterministic seed; values in [0,1); integers in range; pick element; shuffle without mutation.
- **Item** — stores name/description/actions; invokes action with player+game; throws on unknown action; throws when unusable; tracks consumable.
- **Hazard** — returns damage; defaults to 0; receives player.
- **Player** — moves; adds/finds/removes items; clamps damage/healing; alive/dead; inventory names.
- **Location** — adds/removes items; adds hazards; walkability; summarizes contents.
- **World** — generates grid; iterable via generator; bounds checks; sets location; finds by type; neighbours.
- **mapGenerator** — potion heals; monster damage; standard map (exit, treasure, key, hazards, walls); random map deterministic; exit+treasure; walls+hazards.
- **Game** — start state; no move while not playing; move to grass; blocked by wall; unknown direction; monster damage; sword deflect; interact pick up; empty interact; potion use; empty slot; locked exit; unlock needs amulet; win; loss.
- **persistence** — round-trip serialize/deserialize; write/read file on disk.
- **view (mocked document)** — one tile per cell; player tile marked; glyph per type; tile element; status bar; last log messages.

---

## 2. Program Design

### Classes

| Class | File | Responsibility |
|---|---|---|
| `Game` | `Game.js` | State/flow (welcome→playing→won/lost), processes move/interact/use, win/loss checks, message log. |
| `World` | `World.js` | 2D array of `Location`s; `locations()` generator, `rows` getter, `getLocation`, `setLocation`, `findLocationsByType`, `getNeighbors`. |
| `Location` | `Location.js` | Tile with `type`, `description`, `items[]`, `hazards[]`; `isWalkable()`, `summarize()`. |
| `Item` | `Item.js` | `name`, `description`, `actions` map (arrow functions); `performAction()`, `use()`. |
| `Hazard` | `Hazard.js` | `name`, `description`, `apply(player)=>damage`; `trigger(player)`. |
| `Player` | `Player.js` | `x`, `y`, `health`, `maxHealth`, `inventory[]`; move/damage/heal/inventory helpers. |

### Modules

| Module | Functions | Responsibility |
|---|---|---|
| `random.js` | `createRng`, `randomInt`, `pick`, `shuffle` | Seeded PRNG (mulberry32) for reproducible maps. |
| `mapGenerator.js` | item/hazard factories, `generateStandardMap`, `generateRandomMap` | Build world content (treasure, key, sword, potions, monsters, traps, swamps, walls). |
| `view.js` | `tileGlyph`, `createTile`, `renderWorld`, `renderStatus`, `renderLog` | DOM rendering via a `doc` object (mockable); CSS classes only. |
| `persistence.js` | `serializeGame`, `deserializeGame`, `saveGame`, `loadGame` | Save/load JSON with Node `fs/promises` (optional). |
| `main.js` | `createGame`, `setup` | Browser glue: keys, fullscreen, screens. |
| `server.js` | — | Minimal static server for `npm start`. |

### Rules

- Objective: collect the **Amulet** and escape through the **Exit**.
- Exit is locked; requires the **Key** (consumed).
- Hazards: Monster 20 (0 with Sword), Trap 10, Swamp 15. Potion heals 30 (consumable).
- Win: reach open exit with Amulet. Lose: health ≤ 0.

---

## 3. Advanced features

- **Pseudo-random maps** — `generateRandomMap` with a seeded PRNG (unique, reproducible).
- **Persistence** — save/load via Node's file system module.

## Assumptions

- Rectangular grid; `grid[y][x]` row-major.
- Start `(0,0)`, exit `(width-1, height-1)`.
- Items identified by `name`.
- No inline styles — all presentation via stylesheet classes.
