
import * as R from 'ramda'
import { State, Step, BuyPhaseState, Card, Decision } from "./game-types";
import { getCurrentPlayer } from "./game-util";

export const endTurn = (reason: string): Step => {
  throw new Error(`End turn implement later! (${reason})`)
}

export const getCardPrice = (turn: BuyPhaseState, card: Card, state: State): number => {
  const { discounts } = turn
  const applicableDiscounts = discounts.filter((discount) => {
    return discount.match(card, state)
  })

  const originalCardPrice = typeof card.price === 'number'
     ? card.price
     : card.price(state)

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
    return card.execBuyAction || card.moneyValue !== undefined
  }).length < 1
}

export const autoStartPurchasing = (): Step => ({
  stateChange: (state, log) => {
    return [
      {
        ...state,
        turn: {
          ...state.turn,
          startedPurchasing: true
        }
      },
      log
    ]
  }
})

const cardsToPurchaseDecisions = (cards: Card[]): Decision => {
  re
}

export const buyPhase = (state: State): Step => {
  const { turn, store } = state
  if (turn.phase !== 'buy') {
    throw new Error('Invalid state for buy phase')
  }

  const currentPlayer = getCurrentPlayer(state)
  const { hand } = currentPlayer
  const { played, startedPurchasing, money, buys } = turn

  if (buys < 1) {
    return endTurn('You have no more buys left.')
  }

  if (!startedPurchasing && shouldAutoStartPurchasing(state)) {
    return autoStartPurchasing()
  }

  const canAffordCardFromStore = (pile: Card[]) => {
    return canAfford(turn, pile[0], state)
  }

  const availableCardsToBuy = [
    ...store.actions,
    ...store.points,
    ...store.money,
    ...(store.other || [])
  ]
    .filter(canAffordCardFromStore)
    .map((pile: Card[]) => pile[0])

  if (availableCardsToBuy.length < 1) {
    return endTurn('You cannot afford to buy anything.')
  }

  if (startedPurchasing && money > 0) {

  }

}