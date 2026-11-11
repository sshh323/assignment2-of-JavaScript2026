/**
 * Browser entry point. Wires the Game logic to the DOM, listens for keyboard
 * input and toggles fullscreen. This glue code is deliberately thin so the
 * game logic and rendering stay unit-testable.
 */
import { Game, GAME_STATE } from './Game.js'
import { Player } from './Player.js'
import { generateRandomMap, generateStandardMap } from './mapGenerator.js'
import { createRng } from './random.js'
import { renderLog, renderStatus, renderWorld } from './view.js'

const KEY_TO_DIRECTION = {
  ArrowUp: 'up',
  w: 'up',
  W: 'up',
  ArrowDown: 'down',
  s: 'down',
  S: 'down',
  ArrowLeft: 'left',
  a: 'left',
  A: 'left',
  ArrowRight: 'right',
  d: 'right',
  D: 'right'
}

const OBJECTIVE = 'Find the Amulet of Eldergrove and escape through the exit. Beware the monsters, traps and swamps!'

function createGame (random = false) {
  const world = random
    ? generateRandomMap(8, 8, createRng(Date.now() >>> 0))
    : generateStandardMap(8, 8)
  const player = new Player(0, 0, 100)
  return new Game(world, player, { objective: OBJECTIVE })
}

function setup (doc, win) {
  const welcomeScreen = doc.getElementById('welcome-screen')
  const gameScreen = doc.getElementById('game-screen')
  const endScreen = doc.getElementById('end-screen')
  const startBtn = doc.getElementById('start-btn')
  const fullscreenBtn = doc.getElementById('fullscreen-btn')
  const newRandomBtn = doc.getElementById('new-random-btn')
  const restartBtn = doc.getElementById('restart-btn')
  const playAgainBtn = doc.getElementById('play-again-btn')
  const worldContainer = doc.getElementById('world-container')
  const statusContainer = doc.getElementById('status-container')
  const logContainer = doc.getElementById('log-container')
  const endTitle = doc.getElementById('end-title')
  const endMessage = doc.getElementById('end-message')

  let game = createGame(false)

  function show (screen) {
    for (const s of [welcomeScreen, gameScreen, endScreen]) s.classList.remove('active')
    screen.classList.add('active')
  }

  function render () {
    renderWorld(doc, game.world, game.player, worldContainer)
    renderStatus(doc, game.player, statusContainer)
    renderLog(doc, game, logContainer)

    if (game.state === GAME_STATE.WON) {
      endTitle.textContent = '🏆 Victory!'
      endMessage.textContent = 'You escaped the dungeon with the Amulet of Eldergrove!'
      show(endScreen)
    } else if (game.state === GAME_STATE.LOST) {
      endTitle.textContent = '💀 Defeat'
      endMessage.textContent = 'Your adventure has come to an end. Try again, brave hero!'
      show(endScreen)
    }
  }

  function flashDamage () {
    worldContainer.classList.remove('shake')
    worldContainer.classList.add('shake')
    win.setTimeout(() => worldContainer.classList.remove('shake'), 500)
  }

  function handleMove (direction) {
    const result = game.move(direction)
    if (result.damage > 0) flashDamage()
    render()
  }

  function toggleFullscreen () {
    const el = doc.documentElement
    if (doc.fullscreenElement) {
      if (doc.exitFullscreen) doc.exitFullscreen()
    } else if (el && el.requestFullscreen) {
      el.requestFullscreen()
    }
  }

  startBtn.addEventListener('click', () => {
    game.start()
    show(gameScreen)
    render()
  })

  newRandomBtn.addEventListener('click', () => {
    game = createGame(true)
    game.start()
    show(gameScreen)
    render()
  })

  restartBtn.addEventListener('click', () => {
    game = createGame(false)
    show(welcomeScreen)
  })

  playAgainBtn.addEventListener('click', () => {
    game = createGame(false)
    game.start()
    show(gameScreen)
    render()
  })

  fullscreenBtn.addEventListener('click', toggleFullscreen)

  win.addEventListener('keydown', (event) => {
    const direction = KEY_TO_DIRECTION[event.key]
    if (direction) {
      event.preventDefault()
      handleMove(direction)
      return
    }

    switch (event.key) {
      case 'e':
      case 'E':
      case 'Enter':
        game.interact()
        render()
        break
      case 'f':
      case 'F':
        toggleFullscreen()
        break
      case '1':
        game.useItem(0)
        render()
        break
      case '2':
        game.useItem(1)
        render()
        break
      case '3':
        game.useItem(2)
        render()
        break
      case '4':
        game.useItem(3)
        render()
        break
      default:
        break
    }
  })

  show(welcomeScreen)
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  setup(document, window)
}
