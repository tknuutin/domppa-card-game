
import * as R from 'ramda'
import { Stepper, State, Decision, StateChange, PlayerState } from "./game-types";

export const isDecision = (x: any): x is Decision => {
  return x.showDescription !== undefined
}
export const isStateChange = (x: any): x is StateChange => {
  return x.stateChange !== undefined
}

type TwoTupleF<A, B> = (a: A, b: B) => [A, B]
const pipe2 = <A, B>(
  ...funcs: TwoTupleF<A, B>[]
): TwoTupleF<A, B> =>
  (origA, origB) => R.reduce(
    ([a, b], func) => func(a, b),
    [origA, origB],
    funcs
  )

export const combineSteppers = (s1: Stepper, s2: Stepper): Stepper => {
  return (state, log) => {
    return {
      ...s1(state, log),
      then: s2
    }
  }
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