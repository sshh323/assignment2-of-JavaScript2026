# The Lost Amulet of Eldergrove 🧙‍♂️

A keyboard-driven web adventure game for **BTH012 Assignment 2**.

Explore a dungeon grid, find the **Key** and the **Amulet of Eldergrove**, avoid
monsters/traps/swamps, and escape through the locked **Exit**.

## Get started

```bash
npm install      # install vitest + eslint
npm start        # serve the game at http://localhost:3000
```

Or simply open `index.html` in a browser.

## Play

- **Move** — `W A S D` or `Arrow keys`
- **Pick up** — `E` or `Enter`
- **Use item** — `1`–`4`
- **Fullscreen** — `F` or the button

## Test & lint

```bash
npm test         # run the vitest suite
npm run lint     # run ESLint (Standard-style, no errors/warnings)
```

## Structure

```
src/
  Game.js          game controller (state, commands, win/loss)
  World.js         2D grid of locations + generators/iterators
  Location.js      a tile with items & hazards
  Item.js          items with action maps (arrow functions)
  Hazard.js        hazards with apply functions
  Player.js        position, health, inventory
  mapGenerator.js  standard + pseudo-random map generation
  random.js        seeded PRNG
  view.js          DOM rendering (mockable doc)
  persistence.js   save/load with Node fs
  main.js          browser glue (keys, fullscreen, screens)
css/style.css      all styling + 5 CSS animations
test/              vitest suite (incl. mocked web API)
```
