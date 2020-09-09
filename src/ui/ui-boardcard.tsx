
import React from 'react';
import {
  Card,
  CardType,
} from '../game/game-types'
import { getTemplate } from '../game/selectors';
import { css } from './css';
import { Animatable } from './animatable';

const cardTypeToCss: { [T in CardType]: string} = {
  [CardType.ACTION]: 'action',
  [CardType.MONEY]: 'money',
  [CardType.POINT]: 'point',
  [CardType.REACTION]: 'reaction',
  [CardType.ATTACK]: 'attack',
  [CardType.CURSE]: 'curse',
  [CardType.RUINS]: 'ruins',
  [CardType.SHELTER]: 'shelter'
}

type Props = {
  card: Card
  location: string
  onClick?: (card: Card) => void
}

export const BoardCard: React.FC<Props> = ({ card, location, onClick }) => {
  const cardT = getTemplate(card)
  const types = cardT.types.map((type) => cardTypeToCss[type])

  const animId = { location: [location], type: ['card'], metadata: card.pid }

  return (
    <Animatable
      className={css('card', ...types)}
      animId={animId}
    >
      <div onClick={onClick ? () => onClick(card) : undefined}>
        <h3>{cardT.name}</h3>
      </div>
    </Animatable>
  )
}