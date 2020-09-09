

import React from 'react';
import {
  isMultiselectDecision,
} from '../game/selectors';
import { State, Decision } from '../game/game-types';
import { PlayerName } from './ui-playername';

type UIDecisionProps = {
  state: State
  decision: Decision
  onChoice: (choice: string) => void
}

export const UIDecision: React.FC<UIDecisionProps> = ({ decision, onChoice, state }) => {
  if (!isMultiselectDecision(decision)) {
    return (
      <div>
        <p>I dont know what to do with this: {JSON.stringify(decision)}</p>
      </div>
    )
  }

  const player = state.players.find(({ id }) => id === decision.player)!
  const description = decision.description
  
  return (
    <div className="decision">
      {description
        ? (
          <>
            <PlayerName player={player}/>
            <p>{description(state)}</p>
          </>
        ) : (
          <>
            <PlayerName player={player}/><span>, make a decision:</span>
          </>
        )
      }
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