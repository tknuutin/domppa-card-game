import { findMultiple, take, findCard } from "./card-util";
import { points, moneyCards, actions } from "./cards";
import { Card, State, PlayerState, PlayerId, TurnState, Step } from "./game-types";
import { shuffle } from "./util";
import { getCurrentPlayer } from "./game-util";
import { getTurnNextStep } from "./game";

const findPoints = findMultiple(points)
const findMoney = findMultiple(moneyCards)
const findEstate = findPoints('Estate')
const findCopper = findMoney('Copper')

function initialiseDeck(): Card[] {
  let initDeck = shuffle(
    findEstate(3).concat(
      findCopper(7)
    )
  )

  // debug code here
  // initDeck[0] = findCard('Smithy', actions)

  return initDeck
}

export const getInitialStep = (state: State): [Step, string[]] => {
  const currentPlayer = getCurrentPlayer(state)
  const log = [
    'Starting game.', `It is ${currentPlayer.name}'s turn.`,
    `Hand: ${currentPlayer.hand.map(c => c.name).join(', ')}`
  ]
  const step = getTurnNextStep(state)
  return [step, log]
}

export function initialiseTurn(player: PlayerId): TurnState {
  return {
    played: [],
    player,
    actions: 1,
    buys: 1,
    money: 0,
    phase: 'action'
  }
}

const DEBUG_ON = true

export function initialiseGame(...playerNames: string[]): State {
  const players = playerNames.map((playerName, i): PlayerState => {
    const fullDeck = initialiseDeck()
    const [hand, deck] = take(5, fullDeck)
    return {
      name: playerName,
      id: i,
      deck,
      discard: [],
      hand
    }
  })
  return {
    debug: DEBUG_ON,
    turns: 0,
    turn: initialiseTurn(0),
    players,
    store: {
      points: [
        findEstate(12),
        findPoints('Duchy', 12),
        findPoints('Province', 12),
      ],
      actions: [
        findMultiple(actions, 'Village', 10),
        findMultiple(actions, 'Smithy', 10),
      ],
      money: [
        findCopper(60),
        findMoney('Silver', 40),
        findMoney('Gold', 30),
      ],
    }
  }
}