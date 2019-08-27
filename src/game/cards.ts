
import { Card, CardType } from './game-types'
import { pipeS } from './game-util'
import { makeChange, pickCards, addActions } from './card-util'

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
const logF = (f: any, name: string) => {
  if (name.indexOf('_') === 0) {
    return f
  }
  return (...args: any[]) => {
    console.log(`IN (${name}):`, ...args)
    const ret = f(...args)
    console.log(`OUT (${name}):`, ret)
    return ret
  }
}
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
    execAction: makeChange(pickCards(3))
  }
]