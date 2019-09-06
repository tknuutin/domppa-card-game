
import { Card, CardType } from './game-types'
import { pipeS } from './game-util'
import { makeChange, pickCards, addActions } from './card-util'
import { logF } from './debug';

export const points: Card[] = [
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

export const moneyCards: Card[] = [
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
export const actions: Card[] = [
  {
    name: 'Village',
    types: [CardType.ACTION],
    price: 3,
    execAction: logF(pipeS(
      makeChange(pickCards(1)),
      makeChange(addActions(2))
    ), '_village')
  },
  {
    name: 'Smithy',
    types: [CardType.ACTION],
    price: 3,
    execAction: logF(makeChange(pickCards(3)), '_smithy')
  }
]