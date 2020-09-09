
import React from 'react';
import {
  State,
  Card,
  PlayerState
} from '../game/game-types'
import {
  getCurrentPlayer,
  isBuyPhase,
  getTemplate
} from '../game/selectors';
import { getPlayerColor } from './player-color';
import { PlayerName } from './ui-playername';
import { BoardCard } from './ui-boardcard';

const cardsRow = (row: Card[], location: string) => row.map((card, i) => {
  const cardT = getTemplate(card)
  return (
    <BoardCard key={cardT.name + i} card={card} location={location}/>
  )
})

const pileRow = (
  pile: Card[][],
  location: string
) => cardsRow(
  pile.map((pile) => pile[0]),
  location
)

const getDeckCardsAmount = (player: PlayerState, state: State): string => {
  if (state.debug) {
    return player.deck.length + ' cards'
  }

  if (player.deck.length > 1) {
    return '>1 cards'
  }

  return player.deck.length === 1
    ? '1 card'
    : 'empty'
}

const getCurrentTurnInfoText = (state: State): string => {
  const player = getCurrentPlayer(state)
  const discard = player.discard.length + ' cards'
  const deck = getDeckCardsAmount(player, state)
  const turn = state.turn
  const { buys, money } = turn
  const actions = isBuyPhase(turn) ? '0' : turn.actions
  return [
    ['Deck', deck],
    ['Discard', discard],
    ['Actions', actions],
    ['Buys', buys],
    ['Money', money]
  ].map(([name, value]) => name + ': ' + value + '.').join(' ')
}

export const GameBoard: React.FC<{ state: State }> = ({ state, children }) => {

  const player = getCurrentPlayer(state)
  const { copper, silver, gold, estate, duchy, province } = state.store
  const upperRow = [
    copper, silver, gold, estate, duchy, province
  ]

  const store = (
    <div className="store">
      <p>Store:</p>
      <div className="store-row store-money">
        {pileRow(upperRow, 'store')}
      </div>
      <div className="store-row store-actions">
        {pileRow(state.store.actions, 'store')}
      </div>
    </div>
  )

  const turn = state.turn
  const played = turn.played.length > 0 && (
    <div className="played">
      <p>Played:</p>
      {isBuyPhase(turn) && (
        cardsRow(turn.actionPhase.played, 'played') 
      )}
      {cardsRow(turn.played, 'played')}
    </div>
  )

  const hand = player.hand
  const areaColor = getPlayerColor(player)

  const phase = isBuyPhase(state.turn) ? ' Buy phase.' : ''

  return (
    <div className="game-board">
      {store}
      <div className="player-area" style={{ borderColor: areaColor }}>
        <PlayerName player={player}/><span>'s turn.{phase}</span>
        {played}
        <div className="hand">
          {hand.length > 0 ? (
            <>
              <p>Hand:</p>
              {cardsRow(player.hand, 'hand')}
            </>
          ) : (
            <p>Hand is empty.</p>
          )}
        </div>
        <p>{getCurrentTurnInfoText(state)}</p>
        {children}
      </div>
    </div>
  )
}