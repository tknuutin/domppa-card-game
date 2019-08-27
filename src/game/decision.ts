
import { State, Stepper, Decision, PlayerId } from './game-types'
import * as R from 'ramda'

type Choice = {
  match: (command: string, state: State) => boolean
  do: Stepper
}
type Matcher = (command: string, s: State) => Stepper | undefined

export const oneOfOrUndefined = (...choices: Choice[]): Matcher =>
  (command: string, state: State) => {
    const match = R.find((choice) => choice.match(command, state), choices)
    return match ? match.do : undefined
  }

export const mergeDecisions = (decisions: Decision[], player: PlayerId): Decision => {
  return {
    player,
    execute: (state: State) => {
      const decisionDefs = decisions.map((d) => d.execute(state))
      const descriptions = decisionDefs.map(d => d.description)
      return {
        description: R.chain(R.identity, descriptions),
        parseDecision: (command, s) => {
          const parsed = decisionDefs.map((d) => {
            return d.parseDecision(command, s)
          }).find(R.identity)
          return parsed
        }
      }
    }
  }
}