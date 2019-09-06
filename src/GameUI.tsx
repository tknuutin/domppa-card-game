import React from 'react';
import * as R from 'ramda'
import { State, Decision, Card, CardType, PlayerState } from './game/game-types'
import { isMultiselectDecision, getCurrentPlayer, isBuyPhase } from './game/game-util';

type UIDecisionProps = {
  state: State
  decision: Decision
  onChoice: (choice: string) => void
}

const PlayerName: React.FC<{ player: PlayerState }> = ({ player }) => {
  return (
    <div className="player-name">
      <p>{player.name}</p>
      <div className="color-block" style={{ backgroundColor: getPlayerColor(player)}}></div>
    </div>
  )
}

const UIDecision: React.FC<UIDecisionProps> = ({ decision, onChoice, state }) => {
  if (!isMultiselectDecision(decision)) {
    return (
      <div>
        <p>I dont know what to do with this: {JSON.stringify(decision)}</p>
      </div>
    )
  }
  const player = getCurrentPlayer(state)
  return (
    <div className="decision">
      <PlayerName player={player}/><span>, make a decision:</span>
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

let COLOR_MAP: { [id: string]: string } = {}
let colors = ['yellow', 'green', 'red', 'blue']
const getPlayerColor = ({ id }: PlayerState) => {
  if (COLOR_MAP[id] === undefined) {
    const newColor = colors.pop()
    if (!newColor) {
      throw new Error('Ooops')
    }
    COLOR_MAP[id] = newColor
  }
  return COLOR_MAP[id]
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

  const turn = state.turn
  const played = turn.played.length > 0 && (
    <div className="played">
      <p>Played:</p>
      {isBuyPhase(turn) && (
        cardsRow(turn.actionPhase.played) 
      )}
      {cardsRow(turn.played)}
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
              {cardsRow(player.hand)}
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