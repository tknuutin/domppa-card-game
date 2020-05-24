import * as R from 'ramda'
import {
  Card,
  State,
  PlayerState,
  CardType,
  BuyPhaseState,
  ActionPhaseState,
  StateChange,
  Step,
} from './game-types'
import { modifyTurn, modifyCurrentPlayer, Mod, modifyActions } from './modifiers';
import { CurriedF3, shuffle, pipe2 } from './util';
import { pipeS } from './game-util';

export const findCard = (name: string, cards: Card[]): Card => {
  const match = R.find((card) => card.name === name, cards)
  if (!match) {
    throw new Error('Could not find card called ' + name)
  }
  return match
}

export const ofType = (t: CardType) => (card: Card) => card.types.includes(t)
export const isAction = ofType(CardType.ACTION)
export const isReaction = ofType(CardType.REACTION)
export const isMoney = ofType(CardType.MONEY)


export const findMultiple: CurriedF3<Card[], string, number, Card[]> = R.curryN(3,
  (cards: Card[], name: string, amount: number): Card[] => {
    const card = findCard(name, cards)
    return R.times(() => card, amount)
  }
)

const reduceActions = modifyTurn((turn, log) => {
  const actionPhaseTurn = turn as ActionPhaseState
  return [
    {
      ...actionPhaseTurn,
      actions: actionPhaseTurn.actions - 1
    },
    log
  ]
})

export const playActionCard = (card: Card) => {
  const stateChangePipe = pipe2(
    moveCardFromHandToPlayed(card),
    reduceActions,
    (state, log) => [state, log.concat([
      `You play an action card: ${card.name}.`
    ])]
  )

  return (): Step => {
    return {
      stateChange: stateChangePipe,
      then: card.execAction!
    }
  }
}

const executePlayMoneyCard = (card: Card) => (state: State, log: string[]): [State, string[]] => {
  const turn = state.turn as BuyPhaseState
  const moneyValue = typeof card.moneyValue === 'function'
    ? card.moneyValue(state)
    : card.moneyValue!
  return [{
    ...state,
    turn: {
      ...turn,
      money: state.turn.money + moneyValue
    }
  }, log]
}

const moveCardFromHandToPlayed = (card: Card) => pipe2(
  modifyCurrentPlayer((playerState, log) => {
    const index = R.findIndex(
      (handCard) => handCard.name === card.name, playerState.hand
    )
    
    const handWithout = R.remove(index, 1, playerState.hand)
    return [{
      ...playerState,
      hand: handWithout
    }, log]
  }),
  modifyTurn((turn, log) => {
    return [{
      ...turn,
      played: turn.played.concat([card])
    }, log]
  })
)

export const playMoneyCard = (card: Card) => pipe2(
  moveCardFromHandToPlayed(card),
  executePlayMoneyCard(card)
)

export const makeChange = (f: Mod<State>) => (): StateChange => {
  return {
    stateChange: f
  }
}

export const pipeChanges = (...fs: Mod<State>[]) => pipeS(
  ...fs.map(makeChange)
)

export const take = (amount: number, arr: Card[]) => {
  if (amount > arr.length) {
    throw new Error('Trying to take more than we have!')
  }
  return R.splitAt(amount, arr)
}

export const reduceBuys = (state: State, log: string[] = []): [State, string[]] => [{
  ...state,
  turn: {
    ...state.turn,
    buys: state.turn.buys - 1
  }
}, log]

export const reduceMoney = (money: number) => (state: State, log: string[] = []): [State, string[]] => [{
  ...state,
  turn: {
    ...state.turn,
    money: state.turn.money - money
  }
}, log]

export const addCardToDiscard = (card: Card) => modifyCurrentPlayer((player, log) => [{
  ...player,
  discard: player.discard.concat([card])
}, log])

export const addToHand = (cards: Card[], rest: Card[], state: PlayerState): PlayerState => ({
  ...state,
  deck: rest,
  hand: state.hand.concat(cards)
})
export const makePickUpMsg = (cards: Card[]): string[] =>
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

export const addActions = (amount: number) =>
  modifyActions((val, log) => [
    val + amount,
    log.concat([`You gain ${amount} actions.`])
  ])

export const uniqueCards = R.uniqBy((card: Card) => card.name)

const empty = <T>(): T[] => []
export const pickCards = (amount: number, silent: boolean = false) =>
  modifyCurrentPlayer((state, log) => {
    const makeMsg = silent ? empty : makePickUpMsg
    if (state.deck.length >= amount) {
      const [taken, rest] = take(amount, state.deck)
      return [
        addToHand(taken, rest, state),
        log.concat(makeMsg(taken))
      ]
    }

    const prePickup = state.deck

    const [newState, newLog] = shuffleDiscardIntoDeck(state, log)    
    const { deck } = newState
    const remainingToPickup = amount - prePickup.length
    
    const amountAfterShuffle = Math.min(deck.length, remainingToPickup)
    const [taken, rest] = take(amountAfterShuffle, deck)
    const allPickedUp = prePickup.concat(taken)

    const pickedUpMsg = makeMsg(allPickedUp)
    const msg = amountAfterShuffle < remainingToPickup
      ? [`You do not have enough cards in your deck to pick up ${amount} cards.`].concat(pickedUpMsg)
      : pickedUpMsg
    return [
      addToHand(allPickedUp, rest, newState),
      newLog.concat(msg)
    ]
  })