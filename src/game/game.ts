
import * as R from 'ramda'
import { StateChange, State, Step, CardType, MultiselectChoice, Decision } from './game-types'
import { getCurrentPlayer, isMultiselectDecision, isDecision, isStateChange, combineSteps } from './game-util';
import { decision } from './decision';
import { buyPhase } from './buyphase';
import { logF } from './debug';
import { getMatchingReactions, getReactionExecutionSteps } from './reaction';
import { ofType, uniqueCards, getTemplate, playActionCard } from './cards';

const moveToBuyPhase = (reason?: string): StateChange => {
  return {
    stateChange: (state, log) => {
      const player = getCurrentPlayer(state)
      const { turn } = state
      return [
        {
          ...state,
          turn: {
            phase: 'buy',
            player: player.id,
            actionPhase: {
              played: turn.played
            },
            played: [],
            buys: turn.buys,
            startedPurchasing: false,
            money: turn.money,
            purchases: [],
            discounts: turn.discounts || []
          }
        },
        log.concat((reason ? [reason] : []).concat(['Starting buy phase.']))
      ]
    }
  }
}

const getActions = R.filter(ofType(CardType.ACTION))

const actionPhase = (state: State): Step => {
  const { turn } = state

  if (turn.phase !== 'action') {
    throw new Error('Invalid state for action phase')
  }

  const currentPlayer = getCurrentPlayer(state)
  const { hand } = currentPlayer

  const actionsInHand = getActions(hand)
  const noActionCards = actionsInHand.length < 1
  const noActionsLeft = turn.actions < 1
  if (noActionCards || noActionsLeft) {
    return {
      ...moveToBuyPhase(
        noActionCards
          ? "You don't have any action cards in hand."
          : "You don't have any actions left."
      ),
      then: getTurnNextStep
    }
  }

  const uniqueActionsInHand = uniqueCards(actionsInHand)

  const choices: MultiselectChoice[] = uniqueActionsInHand.map((card) => {
    return {
      description: 'Play action: ' + getTemplate(card).name,
      execute: playActionCard(card)
    }
  })

  return decision(
    turn.player,
    choices.concat([
      {
        description: 'Move to buy phase',
        execute: () => moveToBuyPhase()
      }
    ])
  )
}

export const getTurnNextStep = (state: State): Step => {
  const { turn } = state
  
  if (turn.phase === 'action') {
    return actionPhase(state)
  }

  return buyPhase(state)
}

export type DecisionPoint = {
  decision: Decision
  log: string[]
  state: State
}

const MAX_LOOP = 50
export const iterateUntilDecision = logF((
  state: State,
  step: Step,
  log: string[],
  loopGuard: number = 0
): DecisionPoint => {

  if (loopGuard > MAX_LOOP) {
    throw new Error('Max state changes before decision')
  }

  if (isStateChange(step)) {
    const { metaData } = step
    if (metaData) {
      
      const reactionsPerPlayer = getMatchingReactions(state, metaData)
      if (reactionsPerPlayer.length > 0) {
        const reactionSteps = getReactionExecutionSteps(
          reactionsPerPlayer,
          step,
          state,
          log
        )
        const allSteps = combineSteps(
          ...reactionSteps
        )
        return iterateUntilDecision(state, allSteps, log, loopGuard + 1)
      }
      
    }
  }

  if (isDecision(step)) {
    return {
      decision: step,
      state,
      log
    }
  }

  const [newState, newLog] = step.stateChange(state, log)
  if (step.then) {
    const thenStep = step.then(newState, newLog)
    return iterateUntilDecision(newState, thenStep, newLog, loopGuard + 1)
  }
  const nextStep = getTurnNextStep(newState)
  return iterateUntilDecision(newState, nextStep, newLog, loopGuard + 1)
}, '_iterate')

export const executeChoice = logF((choice: string, dp: DecisionPoint): DecisionPoint => {
  const selection = parseInt(choice, 10) - 1
  const decision = dp.decision
  if (!isMultiselectDecision(decision) || isNaN(selection) || selection < 0) {
    throw new Error('Agggg')
  }

  const selectedChoice = decision.choices[selection]
  const stepAfterDecision = selectedChoice.execute(dp.state, [])

  return iterateUntilDecision(dp.state, stepAfterDecision, [])
}, '_exechoice')

