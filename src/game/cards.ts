
import * as R from 'ramda'
import { Card, CardType, PlayerState, PlayerId, State } from './game-types'
import { makeChange, pickCards, addActions, pipeChanges, findCard } from './card-util'
import { getCurrentPlayer, pipeS } from './game-util';
import { modifyPlayer } from './modifiers';

export const special: Card[] = [
  {
    name: 'Curse',
    types: [CardType.CURSE],
    price: 0,
    points: -1
  }
]

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
  {
    name: 'Witch',
    types: [CardType.ACTION, CardType.ATTACK],
    price: 5,
    execAction: pipeChanges(
      pickCards(2),
      (state, log) => {
        const me = getCurrentPlayer(state)
        const curse = findCard('Curse', special)

        return R.reduce(
          ([state, log], mod) => mod(state, log),
          [state, log],
          state.players
            .filter((p) => p.id !== me.id)
            .map((player) => {
              const modifyTarget = modifyPlayer((p) => p.id === player.id)
              return modifyTarget((player, log) => {
                return [{
                  ...player,
                  discard: player.discard.concat([curse])
                }, log.concat([player.name + ' gains a curse.'])]
              })
            })
        )
      }
    )
  }
]