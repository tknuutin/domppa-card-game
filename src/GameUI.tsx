import React from 'react';
import { GameBoard } from './ui/ui-board';
import { State, Decision } from './game/game-types';
import { UIDecision } from './ui/ui-decision';
import { ScreenLog } from './ui/screenlog';
import { getAnimationMatches } from './ui/animations';
import { AnimationContext } from './ui/animation-context';

type Props = {
  state: State
  oldState: State | undefined
  log: string[]
  oldLog: string[]
  decision: Decision
  callbacks: {
    onChoice: (choice: string) => void
  }
}

export const GameUI: React.FC<Props> = ({ state, oldState, log, oldLog, decision, callbacks }) => {

  const matches = oldState
    ? getAnimationMatches(state, oldState)
    : []

  const animationContextValue = {
    animations: matches.map((anim) => ({
      state: 'start',
      animation: anim
    }))
  }

  console.log('matches', animationContextValue)

  return (
    <AnimationContext.Provider value={animationContextValue}>
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
    </AnimationContext.Provider>
  )
}