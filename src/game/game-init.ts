import { times } from 'ramda'
import { allCards, createCard, getTemplate, take } from "./cards";
import { Card, State, PlayerState, PlayerId, TurnState, Step } from "./game-types";
import { shuffle } from "./util";
import { getCurrentPlayer } from "./game-util";
import { getTurnNextStep } from "./game";

const assert = (text: string, f: () => boolean) => {
  if (!f()) {
    throw new Error(text)
  }
}
const assertCard = (name: string) => assert(
  `Could not find card ${name}`,
  () => !!allCards[name]
)

const getCards = (name: string, amount: number): Card[] => times(
  () => createCard(name),
  amount
)

function initialiseDeck(): Card[] {

  let initDeck = shuffle(
    getCards('Estate', 3).concat(
      getCards('Copper', 7)
    )
  )

  // debug code here
  initDeck[0] = createCard('Witch')
  initDeck[1] = createCard('Moat')
  // initDeck[1] = findCard('Smithy', actions)
  // initDeck[7] = findCard('Smithy', actions)

  return initDeck
}

export const getInitialStep = (state: State): [Step, string[]] => {
  const currentPlayer = getCurrentPlayer(state)
  const log = [
    'Starting game.', `It is ${currentPlayer.name}'s turn.`,
    `Hand: ${currentPlayer.hand.map(c => getTemplate(c).name).join(', ')}`
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

  assertCard('Estate')
  assertCard('Duchy')
  assertCard('Province')
  assertCard('Copper')
  assertCard('Silver')
  assertCard('Gold')
  assertCard('Curse')

  const players = playerNames.map((playerName, i): PlayerState => {
    const fullDeck = initialiseDeck()
    const [hand, deck] = take(5, fullDeck)
    return {
      name: playerName,
      id: i,
      deck,
      discard: [],
      hand,
      turns: 0
    }
  })
  return {
    debug: DEBUG_ON,
    turns: 0,
    turn: initialiseTurn(0),
    players,
    store: {
      estate: getCards('Estate', 12),
      duchy: getCards('Duchy', 12),
      province: getCards('Province', 12),
      actions: [
        getCards('Village', 10),
        getCards('Smithy', 10),
      ],
      copper: getCards('Copper', 60),
      silver: getCards('Silver', 40),
      gold: getCards('Gold', 30),
      curse: getCards('Curse', 40)
    }
  }
}