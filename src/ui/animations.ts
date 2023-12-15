

import { Card, State } from "../game/game-types"
import { getCurrentPlayer, getPlayedCards } from "../game/selectors"
import { AnimationContextController } from "./animation-context"


export type CardPlayAnimation = {
  type: 'card-play',
  card: Card
  duration: number
}
export type Animation =
  | CardPlayAnimation
  | { type: 'none', duration: 0 }

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
    card,
    duration: 1000
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

const isCardPlayAnim = (animation: any): animation is CardPlayAnimation =>
  animation.type === 'card-play'

type AnimClasses = {
  classes: string[]
  styles: Object
}

export const getAnimClasses = (
  context: AnimationContextController,
  animId: AnimationIdentifier,
  pos: DOMRect | ClientRect | null
): AnimClasses => {
  if (animId.type.includes('card')) {
    const matchingAnim = context.animations.find(
      (animation): animation is CardPlayAnimation =>
        isCardPlayAnim(animation) && animation.card.pid === animId.metadata
    )
    if (!matchingAnim) {
      return { classes: [], styles: {} }
    }
    if (animId.location.includes('hand')) {
      return { classes: [matchingAnim.type, 'card-hand', 'moving'], styles: {} }
    }
    return { classes: [matchingAnim.type, 'card-played'], styles: {} }
  }
  return { classes: [], styles: {} }
}

