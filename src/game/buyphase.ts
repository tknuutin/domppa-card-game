
import * as R from 'ramda'
import { State, Step, BuyPhaseState, Card, CardType, MultiselectDecision } from "./game-types";
import { getCurrentPlayer, isBuyPhase, reduceBuys, reduceMoney } from "./game-util";
import { decision, mergeDecisions, endTurnDecision } from './decision';
import { endTurn } from './turnend';
import { pipe2 } from './util';
import { getTemplate, addCardToDiscard, ofType, playMoneyCard, uniqueCards } from './cards';

export const getCardPrice = (turn: BuyPhaseState, card: Card, state: State): number => {
  const { discounts } = turn
  const applicableDiscounts = discounts.filter((discount) => {
    return discount.match(card, state)
  })

  const cardT = getTemplate(card)
  const originalCardPrice = typeof cardT.price === 'number'
     ? cardT.price
     : cardT.price(state)

  return R.reduce(
    (price, { discount }) => {
      return discount(price, card, state)
    },
    originalCardPrice,
    applicableDiscounts
  )
}

const canAfford = (turn: BuyPhaseState, card: Card, state: State) => {
  const { money } = turn
  const cardPrice = getCardPrice(turn, card, state)
  return cardPrice <= money
}

export const shouldAutoStartPurchasing = (state: State) => {
  const hand = getCurrentPlayer(state).hand
  return hand.filter((card) => {
    const cardT = getTemplate(card)
    return cardT.execBuyAction || cardT.moneyValue !== undefined
  }).length < 1
}

const startPurchasing = (state: State, log: string[]): [State, string[]] => {
  return isBuyPhase(state.turn)
    ? [
      {
        ...state,
        turn: {
          ...state.turn,
          startedPurchasing: true
        }
      },
      log
    ]
    : [state, log]
}

export const autoStartPurchasing = (): Step => ({
  stateChange: startPurchasing
})

const buyCard = (card: Card, price: number): Step => {
  const transform = pipe2(
    startPurchasing,
    addCardToDiscard(card),
    reduceBuys,
    reduceMoney(price)
  )

  return {
    stateChange: (state: State, log: string[]) => transform(
      state,
      log.concat([`You bought the card ${getTemplate(card).name} for ${price} money.`])
    )
  }
}

const cardsToPurchaseDecision = (cards: Card[], state: State): MultiselectDecision => {
  const player = getCurrentPlayer(state)
  return decision(
    player.id,
    cards.map((card) => {
      const cardT = getTemplate(card)
      const { name } = cardT
      const turn = state.turn as BuyPhaseState
      const price = getCardPrice(turn, card, state)
      const buyTransform = buyCard(card, price)
      return {
        description: `Buy ${name} (price ${price})`,
        execute: () => buyTransform
      }
    })
  )
}

const isComplexMoneyCard = (card: Card): boolean => {
  const cardT = getTemplate(card)
  return (
    typeof cardT.moneyValue === 'function' ||
    !!cardT.execBuyAction
  )
}

const canAutoplayMoneyCards = (state: State): boolean => {
  const currentPlayer = getCurrentPlayer(state)
  const turn = state.turn as BuyPhaseState
  const { hand } = currentPlayer
  const { played } = turn
  // A bit dubious if this is safe? When do we know we don't have
  // any cards in play that would affect playing money cards?
  return getMoneyCards(hand).length > 0 && !R.any(isComplexMoneyCard, hand.concat(played))
}

const getMoneyCards = R.filter(ofType(CardType.MONEY))

const autoplayMoneyCards = (state: State, log: string[]): [State, string[]] => {
  
  const currentPlayer = getCurrentPlayer(state)
  
  const { hand } = currentPlayer
  const cardsToPlay = getMoneyCards(hand)
  const transforms = cardsToPlay.map(playMoneyCard)
  const cardNames = cardsToPlay.map(card => getTemplate(card).name.toUpperCase()).join(', ')
  const [newState, newLog] = R.reduce(
    ([state, log], transform) => {
      return transform(state, log)
    },
    [state, log],
    transforms
  )
  return [
    newState,
    newLog.concat([`Autoplayed the following cards: ${cardNames}`])
  ]
}

export const buyPhase = (state: State): Step => {
  const { turn, store } = state
  if (!isBuyPhase(turn)) {
    throw new Error('Invalid state for buy phase')
  }

  const currentPlayer = getCurrentPlayer(state)
  const { hand } = currentPlayer
  const { startedPurchasing, buys } = turn

  if (buys < 1) {
    return endTurn('You have no more buys left.')
  }

  if (!startedPurchasing && shouldAutoStartPurchasing(state)) {
    return autoStartPurchasing()
  }

  const canAffordCardFromStore = (card: Card) => {
    return canAfford(turn, card, state)
  }

  if (canAutoplayMoneyCards(state)) {
    return {
      stateChange: autoplayMoneyCards
    }
  }

  const availableCardsToBuy = [
    ...store.actions,
    store.estate,
    store.duchy,
    store.province,
    store.copper,
    store.silver,
    store.gold,
    store.curse,
  ]
    .map((pile: Card[]) => pile[0])
    .filter(canAffordCardFromStore)

  if (availableCardsToBuy.length < 1) {
    return endTurn('You cannot afford to buy anything.')
  }

  const purchaseDecision = cardsToPurchaseDecision(availableCardsToBuy, state)
  const uniqueMoneyCardsInHand = uniqueCards(getMoneyCards(hand))
  const playMoneyCardsDecision = decision(
    currentPlayer.id,
    uniqueMoneyCardsInHand.map((card: Card) => {
      return {
        description: 'Play ' + getTemplate(card).name,
        execute: () => ({
          stateChange: playMoneyCard(card)
        })
      }
    })
  )
  
  return mergeDecisions([
    purchaseDecision,
    playMoneyCardsDecision,
    endTurnDecision(currentPlayer.id)
  ])
}