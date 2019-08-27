
import * as R from 'ramda'
import { StateChange, State, Step, Stepper, PlayerId, TurnState, Card, PlayerState, CardType } from './game-types'
import { points, moneyCards, actions } from './cards';
import { shuffle, take, findMultiple, ofType } from './card-util';
import { getCurrentPlayer } from './game-util';
import { oneOfOrUndefined } from './decision';

export function initialiseTurn(player: PlayerId): TurnState {
  return {
    played: [],
    player,
    actions: 1,
    buys: 1,
    money: 0,
    phase: 'action'
  }
}

const findPoints = findMultiple(points)
const findMoney = findMultiple(moneyCards)
const findEstate = findPoints('Estate')
const findCopper = findMoney('Copper')

function initialiseDeck(): Card[] {
  return shuffle(
    findEstate(3).concat(
      findCopper(7)
    )
  )
}

export function initialiseGame(...playerNames: string[]): State {
  const players = playerNames.map((playerName, i): PlayerState => {
    const fullDeck = initialiseDeck()
    const [hand, deck] = take(5, fullDeck)
    return {
      name: playerName,
      id: i,
      deck,
      discard: [],
      hand
    }
  })
  return {
    turns: 0,
    turn: initialiseTurn(0),
    players,
    store: {
      points: [
        findEstate(12),
        findPoints('Duchy', 12),
        findPoints('Province', 12),
      ],
      actions: [
        findMultiple(actions, 'Village', 10),
        findMultiple(actions, 'Smithy', 10),
      ],
      money: [
        findCopper(60),
        findMoney('Silver', 40),
        findMoney('Gold', 30),
      ],
    }
  }
}

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
      then: getTurnDecision
    }
  }

  return {
    player: turn.player,
    execute: (state: State) => {
      return {
        description: ['Play an action or move to buy phase.'],
        parseDecision: oneOfOrUndefined(
          {
            match: (command) => command === 'buy',
            do: () => moveToBuyPhase()
          }
        )
      }
    }
  }
}

export const getTurnDecision = (state: State): Step => {
  const { turn } = state
  
  if (turn.phase === 'action') {
    return actionPhase(state)
  }

  return {
    stateChange: (state, log) => [state, log.concat(['Buy phase not implemented'])]
  }
}

export const getInitialStep = (state: State): [Step, string[]] => {
  const currentPlayer = getCurrentPlayer(state)
  const log = ['Starting game.', `It is ${currentPlayer.name}'s turn.`]
  const step = getTurnDecision(state)
  return [step, log]
}

