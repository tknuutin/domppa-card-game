
import * as R from 'ramda'
import { Stepper, State, Decision, StateChange, PlayerState, TurnState, BuyPhaseState, MultiselectDecision, Step } from "./game-types";
import { Mod, modifyActions } from './modifiers';
import { shuffle } from './util';

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

export const makeChange = (f: Mod<State>) => (): StateChange => {
  return {
    stateChange: f
  }
}

export const pipeChanges = (...fs: Mod<State>[]) => pipeS(
  ...fs.map(makeChange)
)

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

export const reduceBuys = (state: State, log: string[] = []): [State, string[]] => [{
  ...state,
  turn: {
    ...state.turn,
    buys: state.turn.buys - 1
  }
}, log]

export const reduceMoney = (money: number) => (state: State, log: string[] = []): [State, string[]] => [{
  ...state,
  turn: {
    ...state.turn,
    money: state.turn.money - money
  }
}, log]

export const shuffleDiscardIntoDeck = (state: PlayerState, log: string[]): [PlayerState, string[]] => {
  const { discard } = state
  const newDiscard = shuffle(discard)
  return [
    {
        ...state,
      deck: newDiscard,
      discard: []
    },
    log.concat(['You shuffle your discard pile into a new deck.'])
  ]
}

export const addActions = (amount: number) =>
  modifyActions((val, log) => [
    val + amount,
    log.concat([`You gain ${amount} actions.`])
  ])

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
