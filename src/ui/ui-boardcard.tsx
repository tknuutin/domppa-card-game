
import React from 'react';
import {
  Card,
  CardType,
} from '../game/game-types'
import { getTemplate } from '../game/cards';
import { css } from './css';

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
  onClick?: (card: Card) => void
}

export const BoardCard: React.FC<Props> = ({ card, onClick }) => {
  const cardT = getTemplate(card)
  const types = cardT.types.map((type) => cardTypeToCss[type])
  return (
    <div className={css('card', ...types)}>
      <h3>{cardT.name}</h3>
    </div>
  )
}