import { modifyCurrentPlayer } from "./modifiers";
import { State, Step } from "./game-types";
import { isBuyPhase, getCurrentPlayer } from "./game-util";
import { initialiseTurn } from "./game-init";
import { pipe2 } from "./util";
import { pickCards, makePickUpMsg, getTemplate } from "./cards";

const cleanUpPlayerAtEndOfTurn = (state: State, log: string[]) => pipe2(
  modifyCurrentPlayer((player, log) => {
    const { turn } = state
    const played = isBuyPhase(turn)
      ? turn.played.concat(turn.actionPhase.played)
      : turn.played

    const used = played.concat(player.hand)

    return [{
      ...player,
      turns: player.turns + 1,
      hand: [],
      discard: player.discard.concat(used)
    }, log]
  }),
  pickCards(5, true)
)(state, log)

const changeCurrentPlayer = (reason: string) =>
  (state: State, log: string[]): [State, string[]] => {
    const player = getCurrentPlayer(state)
    const playerIndex = state.players.findIndex(
      (p) => p.id === player.id
    )
    const nextPlayerIndex = playerIndex === (state.players.length - 1)
      ? 0
      : playerIndex + 1
    const nextPlayer = state.players[nextPlayerIndex]
    const newState = {
      ...state,
      turn: {
        ...state.turn,
        player: nextPlayer.id
      }
    }

    return [
      newState,
      log.concat([
        (
          `Ending turn for ${player.name} (${reason}) ` +
          makePickUpMsg(player.hand).join(' ')
        ),
        '----- TURN END -----',
        'It is ' + nextPlayer.name + '´s turn. Hand: '
          + nextPlayer.hand.map((c => getTemplate(c).name)).join(', ')
      ])
    ]
  }

const initNextTurn = (state: State, log: string[]): [State, string[]] => {
  return [{
    ...state,
    turn: initialiseTurn(state.turn.player)
  }, log]
}

export const endTurn = (reason: string): Step => {
  return {
    stateChange: pipe2(
      cleanUpPlayerAtEndOfTurn,
      changeCurrentPlayer(reason),
      initNextTurn
    )
  }
}