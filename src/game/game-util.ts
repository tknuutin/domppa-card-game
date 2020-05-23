
import * as R from 'ramda'
import { Stepper, State, Decision, StateChange, PlayerState, TurnState, BuyPhaseState, MultiselectDecision, Step } from "./game-types";

export const isDecision = (x: any): x is Decision => {
  return x.type === 'multiselect' || x.type === 'input'
}
export const isStateChange = (x: any): x is StateChange => {
  return x.stateChange !== undefined
}
export const isMultiselectDecision = (x: any): x is MultiselectDecision => {
  return x.type === 'multiselect'
}

export const isBuyPhase = (x: TurnState): x is BuyPhaseState => {
  return x.phase === 'buy'
}

export const combineSteppers = (s1: Stepper, s2: Stepper): Stepper => {
  return (state, log) => {
    return {
      ...s1(state, log),
      then: s2
    }
  }
}

export const combineSteps = (...steps: Step[]): Step => {
  const [last, ...rest] = R.reverse(steps)
  return R.reduce(
    (chain, effect) => {
      return {
        ...chain,
        then: () => effect
      }
    },
    last,
    rest
  )
}

export type PipeS = (...f: Stepper[]) => Stepper
export const pipeS: PipeS = (...funcs) => R.reduce(
  R.flip(combineSteppers),
  (s: State, log: string[]) => ({ stateChange: (): [State, string[]] => [s, log] }),
  R.reverse(funcs)
)

export const getCurrentPlayer = (state: State): PlayerState => {
  const current = state.players.find((p) => p.id === state.turn.player)
  if (!current) {
    throw new Error('What!')
  }
  return current
}
