import * as R from 'ramda'
import {
  Card,
  State,
  TurnState,
  PlayerState,
  StateChange,
  CardType,
} from './game-types'

export const findCard = (name: string, cards: Card[]): Card => {
  const match = R.find((card) => card.name === name, cards)
  if (!match) {
    throw new Error('Could not find card called ' + name)
  }
  return match
}

export const ofType = (t: CardType) => (card: Card) => card.types.includes(t)

type CurriedF2<A, B, Ret> = {
  (a: A): (b: B) => Ret
  (a: A, b: B): Ret
}
type CurriedF3<A, B, C, Ret> = {
  (a: A): CurriedF2<B, C, Ret>
  (a: A, b: B): (c: C) => Ret
  (a: A, b: B, c: C): Ret
}
export const findMultiple: CurriedF3<Card[], string, number, Card[]> = R.curryN(3,
  (cards: Card[], name: string, amount: number): Card[] => {
    const card = findCard(name, cards)
    return R.times(() => card, amount)
  }
)

export function shuffle<T>(_arr: T[]): T[] {
  let a = R.map((x) => x, _arr)
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export type Mod<T> = (x: T, output: string[]) => [T, string[]]
// export const change = (f: Mod<State>): StateChange => {
//   return {
//     stateChange: f
// })
export const makeChange = (f: Mod<State>) => (s: State): StateChange => {
  return {
    stateChange: f
  }
}

const modifyIndex = <T>(
  mod: (t: T, log: string[]) => [T, string[]],
  index: number,
  arr: T[],
  log: string[]
): [T[], string[]] => {

  const lens = R.lensIndex(index)
  const [modded, output] = mod(R.view(lens, arr), log)
  return [R.set(lens, modded, arr), output]
}
  

export const modifyTurn = (mod: Mod<TurnState>): Mod<State> => (state, log) => {
  const [turn, output] = mod(state.turn, log)
  const newState = {
    ...state,
    turn
  }

  return [
    newState,
    output
  ]
}

export const modifyActions = (mod: Mod<number>) => modifyTurn((t, log) => {
  const [actions, output] = mod(t.actions, log)
  const turn = {
    ...t,
    actions
  }
  return [turn, output]
})

export const addActions = (amount: number) =>
  modifyActions((val, log) => [
    val + amount,
    log.concat([`You gain ${amount} actions.`])
  ])

// const modifyPlayers = (mod: Mod<PlayerState[]>): Mod<State> => (state) => ({
//     ...state,
//     players: mod(state.players)
// })
export const modifyCurrentPlayer = (mod: Mod <PlayerState>): Mod<State> => (state, log) => {
  const currentPlayer = state.turn.player
  const index = R.findIndex(({
    id
  }) => id === currentPlayer, state.players)
  const [players, output] = modifyIndex(mod, index, state.players, log)
  return [
    {
      ...state,
      players: players
    },
    output
]
}
export const take = (amount: number, arr: Card[]) => {
  if (amount > arr.length) {
    throw new Error('Trying to take more than we have!')
  }
  return R.splitAt(amount, arr)
}

const addToHand = (cards: Card[], rest: Card[], state: PlayerState): PlayerState => ({
  ...state,
  deck: rest,
  hand: state.hand.concat(cards)
})
const makePickUpMsg = (cards: Card[]): string[] =>
  cards.length === 1
    ? ['You pick up 1 card: ' + cards[0].name]
    : [
      `You pick up ${cards.length} cards: ` + cards.map(
          (card) => card.name
        ).join(', ')
      ]

export const shuffleDiscardIntoDeck = (state: PlayerState, log: string[]): [PlayerState, string[]] => {
  const { discard } = state
  const newDiscard = shuffle(discard)
  return [
    {
        ...state,
      deck: newDiscard,
      discard: []
    },
    log.concat(['You shuffle your discard pile into a new deck.'])
  ]
}

export const pickCards = (amount: number) => modifyCurrentPlayer((state, log) => {
  if (state.deck.length >= amount) {
    const [taken, rest] = take(amount, state.deck)
    return [
      addToHand(taken, rest, state),
      log.concat(makePickUpMsg(taken))
    ]
  }

  const prePickup = state.deck
  const [newState, newLog] = shuffleDiscardIntoDeck(state, log)
  const { discard, deck } = newState
  const remainingToPickup = amount - prePickup.length
  const amountAfterShuffle = Math.min(deck.length, remainingToPickup)
  console.log(amountAfterShuffle, discard, prePickup)

  const [taken, rest] = take(amountAfterShuffle, deck)
  const allPickedUp = prePickup.concat(taken)

  const pickedUpMsg = makePickUpMsg(allPickedUp)
  const msg = amountAfterShuffle < remainingToPickup
    ? [`You do not have enough cards in your deck to pick up ${amount} cards.`].concat(pickedUpMsg)
    : pickedUpMsg
  return [
    addToHand(taken, rest, newState),
    newLog.concat(msg)
  ]
})