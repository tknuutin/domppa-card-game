import React from 'react';
import { GameBoard } from './ui/ui-board';
import { State, Decision } from './game/game-types';
import { UIDecision } from './ui/ui-decision';
import { ScreenLog } from './ui/screenlog';

type Props = {
  state: State
  log: string[]
  oldLog: string[]
  decision: Decision
  callbacks: {
    onChoice: (choice: string) => void
  }
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