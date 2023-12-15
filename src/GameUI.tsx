import React, { useReducer, useEffect } from 'react';
import { GameBoard } from './ui/ui-board';
import { State, Decision } from './game/game-types';
import { UIDecision } from './ui/ui-decision';
import { ScreenLog } from './ui/screenlog';
import { getAnimationMatches, Animation } from './ui/animations';
import { AnimationContext, AnimationContextController } from './ui/animation-context';

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

type Transition = {
  state: State
  oldState: State
  log: string[]
  oldLog: string[]
}

type NewStateAction = {
  type: 'new-transition',
  transition: Transition
}

type TransitionDoneAction = {
  type: 'transition-done'
}

type BufferAction = NewStateAction | TransitionDoneAction

type BufferState = {
  currentTransition: Transition
  currentAnimations: Animation[]
  queue: Transition[]
}

function splitAt<T>(index: number, arr: T[]): [T[], T, T[]] {
  const before = arr.slice(0, index)
  const item = arr[index]
  const after = arr.slice(index + 1, arr.length)
  return [before, item, after]
}

const bufferedGameUIReducer: React.Reducer<BufferState, BufferAction> = (
  bstate,
  action
) => {
  switch (action.type) {
    case 'new-transition': {
      const { queue, currentAnimations } = bstate
      const { transition } = action
      
      if (queue.length > 0 || currentAnimations.length > 0) {
        return {
          ...bstate,
          queue: queue.concat([transition])
        }
      }

      const { state, oldState } = transition
      const matches = getAnimationMatches(state, oldState)
      const hasMatches = matches.length > 0

      const stateWithNewCurrent = {
        ...bstate,
        currentTransition: transition
      }
      
      if (hasMatches) {
        return {
          ...stateWithNewCurrent,
          currentAnimations: matches
        }
      }
      return stateWithNewCurrent
    }

    case 'transition-done': {
      const { queue } = bstate
      if (queue.length < 1) {
        return {
          ...bstate,
          animating: false
        }
      }

      const nextWithMatches = queue.findIndex((queuedTransition) => {
        const { state, oldState } = queuedTransition
        const matches = getAnimationMatches(state, oldState)
        return matches.length > 0
      })

      if (nextWithMatches < 0) {
        return {
          currentTransition: queue[queue.length - 1],
          currentAnimations: [],
          queue: []
        }
      }

      const [skippable, newCurrent, newQueue] = splitAt(nextWithMatches, queue)
      console.log('Skipping', skippable.length, 'transitions')
      const matches = getAnimationMatches(newCurrent.state, newCurrent.oldState)
      return {
        currentTransition: newCurrent,
        currentAnimations: matches,
        queue: newQueue
      }
    }

    default: {
      return bstate
    }
  }
}

const findLongestDuration = (anims: Animation[]): Animation => {
  return anims.reduce((currentMax, anim) => {
    return anim.duration > currentMax.duration
      ? anim
      : currentMax
  }, anims[0])
}

const useUIAnimation = (props: Props): Props & { animations: Animation[] } => {
  const transitionFromProps = {
    state: props.state,
    oldState: !props.oldState ? props.state : props.oldState,
    log: props.log,
    oldLog: props.oldLog
  }
  const [bstate, dispatch] = useReducer(bufferedGameUIReducer, {
    currentTransition: transitionFromProps,
    currentAnimations: [],
    queue: []
  })

  const { currentAnimations, currentTransition } = bstate
  const { state, oldState, log, oldLog } = currentTransition

  useEffect(() => {
    if (props.state !== bstate.currentTransition.state) {
      console.log('new transition', transitionFromProps.state.turn)
      dispatch({ type: 'new-transition', transition: transitionFromProps })
    } else {
      console.log('rerendered with the same state')
    }
  }, [props, bstate.currentTransition.state, transitionFromProps])

  useEffect(() => {
    if (currentAnimations.length < 1) {
      return () => {}
    }

    const anim = findLongestDuration(currentAnimations)
    const id = setTimeout(() => {
      console.log('done with transition')
      dispatch({ type: 'transition-done' })
    }, anim.duration)

    return () => {
      clearTimeout(id)
    }
  }, [currentAnimations])

  return {...props, state, oldState, log, oldLog, animations: currentAnimations }
}

export const GameUI: React.FC<Props> = (props) => {

  const { state, decision, oldLog, log, callbacks, animations } = useUIAnimation(props)
  console.log('gameui render', {
    ...state.turn,
    played: state.turn.played.map(({ template }) => template).join(', ')
  })

  const animationContextValue = new AnimationContextController()

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