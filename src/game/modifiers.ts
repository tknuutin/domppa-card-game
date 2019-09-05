
import * as R from 'ramda'
import { TurnState, State, PlayerState } from "./game-types";
import { isBuyPhase } from "./game-util";

export type Mod<T> = (x: T, output: string[]) => [T, string[]]

const modifyIndex = <T>(
  mod: (t: T, log: string[]) => [T, string[]],
  index: number,
  arr: T[],
  log: string[]
): [T[], string[]] => {

  const lens = R.lensIndex(index)
  const [modded, output] = mod(R.view(lens, arr), log)
  return [R.set(lens, modded, arr), output]
}
  

export const modifyTurn = (mod: Mod<TurnState>): Mod<State> => (state, log) => {
  const [turn, output] = mod(state.turn, log)
  const newState = {
    ...state,
    turn
  }

  return [
    newState,
    output
  ]
}

export const modifyActions = (mod: Mod<number>) => modifyTurn((t, log) => {
  if (isBuyPhase(t)) {
    return [t, log]
  }
  const [actions, output] = mod(t.actions, log)
  const turn = {
    ...t,
    actions
  }
  return [turn, output]
})

export const modifyCurrentPlayer = (mod: Mod<PlayerState>): Mod<State> => (state, log) => {
  const currentPlayer = state.turn.player
  const index = R.findIndex(({
    id
  }) => id === currentPlayer, state.players)
  const [players, output] = modifyIndex(mod, index, state.players, log)
  return [
    {
      ...state,
      players: players
    },
    output
  ]
}