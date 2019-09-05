
import { State, Decision, PlayerId, MultiselectChoice, MultiselectDecision } from './game-types'
import * as R from 'ramda'
import { endTurn } from './turnend';

export const decision = (
  player: PlayerId,
  choices: MultiselectChoice[],
  description?: (state: State) => string[]
): MultiselectDecision => ({
  type: 'multiselect',
  player,
  choices,
  description
})

export const endTurnDecision = (player: PlayerId): Decision => decision(
  player,
  [
    {
      description: 'End turn',
      execute: () => endTurn('Player ended turn')
    }
  ]
)

export const mergeDecisions = (
  decisions: MultiselectDecision[],
  description?: (state: State) => string[]
): MultiselectDecision => {
  if (decision.length < 1) {
    throw new Error('No decisions given to mergedecisions')
  }
  const last = R.last(decisions)!
  const descr = description || last.description
  const choices = decisions.reduce(
    (choices: MultiselectChoice[], d) => choices.concat(d.choices),
    []
  )

  return decision(
    last.player,
    choices,
    descr
  )
}