
import { isBuyPhase } from './game-util'
import { State } from './game-types'
export {
  getCurrentPlayer,
  isBuyPhase,
  isMultiselectDecision
} from './game-util'
export { getTemplate } from './cards'

export const getPlayedCards = (state: State) => {
  const { turn } = state
  return turn.played.concat(
    isBuyPhase(turn)
      ? turn.actionPhase.played
      : []
    )
}

