

import { Card, State } from "../game/game-types"
import { getCurrentPlayer, getPlayedCards } from "../game/selectors"
import { AnimationContextType } from "./animation-context"


export type CardPlayAnimation = {
  type: 'card-play',
  card: Card
}
export type Animation =
  | CardPlayAnimation
  | { type: 'none' }

const matchCardPlayAnimation = (
  newState: State,
  oldState: State
): CardPlayAnimation[] => {
  const player = getCurrentPlayer(newState)
  const oldPlayer = getCurrentPlayer(oldState)
  if (player.id !== oldPlayer.id) {
    return []
  }

  const currentlyPlayedCards = getPlayedCards(newState)
  const cardsPlayed = oldPlayer.hand
    .filter(
      (card) => !player.hand.find((newHandCard) => newHandCard.pid === card.pid)
    )
    .filter(
      (card) => !!currentlyPlayedCards.find((playedCard) => playedCard.pid === card.pid)
    )

  return cardsPlayed.map((card) => ({
    type: 'card-play',
    card
  }))
}

export const getAnimationMatches = (
  newState: State,
  oldState: State
): Animation[] => {
  return [
    ...matchCardPlayAnimation(newState, oldState)
  ]
}

export type AnimationIdentifier = {
  location: string[]
  type: string[]
  metadata: any
}

export const getAnimClasses = (
  context: AnimationContextType,
  animId: AnimationIdentifier
): string[] => {
  if (animId.type.includes('card')) {
    const matchingAnims = context.animations.filter(
      ({ animation }) =>
        animation.type === 'card-play' && animation.card.pid === animId.metadata
    )
  }
  return []
}

