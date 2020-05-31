

import { uniqBy, splitAt, findIndex, remove } from 'ramda'
import {
  CardTemplate,
  CardType,
  Card,
  ActionPhaseState,
  Step,
  State,
  BuyPhaseState,
  PlayerState
} from './game-types'
import { Witch } from './cards/witch';
import { Moat } from './cards/moat';
import { special } from './cards/special';
import { modifyTurn, modifyCurrentPlayer } from './modifiers';
import { pipe2 } from './util';
import {
  pipeChanges,
  addActions,
  shuffleDiscardIntoDeck,
  makeChange
} from './game-util';

let idCounter = 0;

export const createCard = (name: string): Card => {
  if (!allCards[name]) {
    throw new Error(`Could not find card: ${name}`)
  }
  idCounter = idCounter + 1
  return {
    template: name,
    pid: idCounter + ''
  }
}

export const getTemplate = (arg: string | Card): CardTemplate => {
  const name = typeof arg === 'string' ? arg : arg.template
  const template = allCards[name]
  if (!template) {
    throw new Error('What')
  }
  return template
}

export const ofType = (t: CardType) => (card: Card) =>
  getTemplate(card).types.includes(t)
export const isAction = ofType(CardType.ACTION)
export const isReaction = ofType(CardType.REACTION)
export const isMoney = ofType(CardType.MONEY)


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
      `You play an action card: ${getTemplate(card).name}.`
    ])]
  )

  return (): Step => {
    return {
      stateChange: stateChangePipe,
      then: getTemplate(card).execAction!
    }
  }
}

const executePlayMoneyCard = (card: Card) => (state: State, log: string[]): [State, string[]] => {
  const turn = state.turn as BuyPhaseState
  const cardT = getTemplate(card)
  const moneyValue = typeof cardT.moneyValue === 'function'
    ? cardT.moneyValue(state)
    : cardT.moneyValue!
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
    const cardT = getTemplate(card)
    const index = findIndex(
      (handCard) => getTemplate(handCard).name === cardT.name, playerState.hand
    )
    
    const handWithout = remove(index, 1, playerState.hand)
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

export const take = (amount: number, arr: Card[]) => {
  if (amount > arr.length) {
    throw new Error('Trying to take more than we have!')
  }
  return splitAt(amount, arr)
}

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
    ? ['You pick up 1 card: ' + getTemplate(cards[0]).name]
    : [
      `You pick up ${cards.length} cards: ` + cards.map(
          (card) => getTemplate(card).name
        ).join(', ')
      ]

export const uniqueCards = uniqBy((card: Card) => getTemplate(card).name)

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

export const points: CardTemplate[] = [
  {
    name: 'Estate',
    types: [CardType.POINT],
    price: 2,
    points: 2
  },
  {
    name: 'Duchy',
    types: [CardType.POINT],
    price: 5,
    points: 3
  },
  {
    name: 'Province',
    types: [CardType.POINT],
    price: 8,
    points: 6
  }
]

export const moneyCards: CardTemplate[] = [
  {
    name: 'Copper',
    types: [CardType.MONEY],
    price: 0,
    moneyValue: 1
  },
  {
    name: 'Silver',
    types: [CardType.MONEY],
    price: 3,
    moneyValue: 2
  },
  {
    name: 'Gold',
    types: [CardType.MONEY],
    price: 6,
    moneyValue: 3
  }
]

type CardFactoryUtils = {
  pickCards: typeof pickCards
}

export type CardFactory = {
  (utils: CardFactoryUtils): CardTemplate
}

const cardFactoryUtils: CardFactoryUtils = {
  pickCards
}
export const actions: CardTemplate[] = [
  {
    name: 'Village',
    types: [CardType.ACTION],
    price: 3,
    execAction: pipeChanges(
      pickCards(1),
      addActions(2)
    )
  },
  {
    name: 'Smithy',
    types: [CardType.ACTION],
    price: 3,
    execAction: makeChange(pickCards(3))
  },
  Witch(cardFactoryUtils),
  Moat(cardFactoryUtils)
]

export const allCards: { [i: string]: CardTemplate } = [
  ...points,
  ...actions,
  ...moneyCards,
  ...special
].reduce((acc, card) => {
  return {
    ...acc,
    [card.name]: card
  }
}, {})

