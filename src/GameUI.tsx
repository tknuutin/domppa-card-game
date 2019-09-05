import React from 'react';
import * as R from 'ramda'
import { State, Decision, Card, CardType } from './game/game-types'
import { isMultiselectDecision, getCurrentPlayer, isBuyPhase } from './game/game-util';

type UIDecisionProps = {
  state: State
  decision: Decision
  onChoice: (choice: string) => void
}
const UIDecision: React.FC<UIDecisionProps> = ({ decision, onChoice, state }) => {
  if (!isMultiselectDecision(decision)) {
    return (
      <div>
        <p>I dont know what to do with this: {JSON.stringify(decision)}</p>
      </div>
    )
  }
  const playerName = getCurrentPlayer(state).name
  return (
    <div className="decision">
      <p>{playerName}, make a decision:</p>
      {decision.choices.map((c, i) => {
        const select = () => onChoice((i + 1)  + '')
        return (
          <p key={i}>
            {c.description}
            <button onClick={select}>Select</button>
          </p>
        )
      })}
    </div>
  )
}

type Props = {
  state: State
  log: string[]
  oldLog: string[]
  decision: Decision
  callbacks: {
    onChoice: (choice: string) => void
  }
}

const ScreenLog: React.FC<{ log: string[], cls?: string }> = ({ log, cls }) => (
  <div className={css('log', cls)}>
    {log.map((line, i) => (
        <p key={i}>{line}</p>
    ))}
  </div>
)

const css = (...classes: (string | undefined)[]) => classes.filter(R.identity).join(' ')
const cardTypeToCss = {
  [CardType.ACTION]: 'action',
  [CardType.MONEY]: 'money',
  [CardType.POINT]: 'point',
  [CardType.CURSE]: 'curse',
  [CardType.RUINS]: 'ruins',
  [CardType.SHELTER]: 'shelter'
}

const BoardCard: React.FC<{ card: Card, onClick?: (card: Card) => void }> = ({ card, onClick }) => (
  <div className={css('card', ...(card.types.map((type) => cardTypeToCss[type])))}>
    <h3>{card.name}</h3>
  </div>
)

const cardsRow = (row: Card[]) => row.map((card, i) => (
  <BoardCard key={card.name + i} card={card}/>
))

const pileRow = (pile: Card[][]) => cardsRow(pile.map((pile) => pile[0]))

const getCurrentTurnInfoText = (state: State): string => {
  const player = getCurrentPlayer(state)
  const discard = player.discard.length + ' cards'
  const deck = player.deck.length > 1
    ? '>1 cards'
    : player.deck.length === 1
      ? '1 card'
      : 'empty'
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

const GameBoard: React.FC<{ state: State }> = ({ state, children }) => {
  const player = getCurrentPlayer(state)
  const upperRow = state.store.money.concat(state.store.points)

  const store = (
    <div className="store">
      <p>Store:</p>
      <div className="store-row store-money">
        {pileRow(upperRow)}
      </div>
      <div className="store-row store-actions">
        {pileRow(state.store.actions)}
      </div>
    </div>
  )

  const played = (
    <div className="played">
      <p>Played:</p>
      {cardsRow(state.turn.played)}
    </div>
  )

  const hand = player.hand

  return (
    <div className="game-board">
      {store}
      <p>{player.name}'s turn.</p>
      {played}
      <div className="hand">
        {hand.length > 0 ? (
          <>
            <p>Hand:</p>
            {cardsRow(player.hand)}
          </>
        ) : (
          <p>Hand is empty.</p>
        )}
      </div>
      <p>{getCurrentTurnInfoText(state)}</p>
      {children}
    </div>
  )
}

export const GameUI: React.FC<Props> = ({ state, log, oldLog, decision, callbacks }) => {
  

  return (
    <div className="game-container">
      <GameBoard state={state}>
        <UIDecision
          state={state}
          decision={decision}
          onChoice={callbacks.onChoice}
        />
      </GameBoard>
      <div className="logs">
        <ScreenLog log={oldLog} cls="old-log"/>
        <ScreenLog log={log}/>
      </div>
    </div>
  )
}