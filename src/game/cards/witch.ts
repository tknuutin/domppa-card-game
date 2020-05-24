import { Card, CardType, PlayerState, StateChange } from "../game-types"
import { combineSteppers, getCurrentPlayer, combineSteps } from "../game-util"
import { makeChange, pickCards, findCard } from "../card-util"
import { modifyPlayer } from "../modifiers"
import { special } from "./special"

export const Witch: Card = {
  name: 'Witch',
  types: [CardType.ACTION, CardType.ATTACK],
  price: 5,
  execAction: combineSteppers(
    makeChange(pickCards(2)),
    (state, log) => {
      const me = getCurrentPlayer(state)
      const curse = findCard('Curse', special)

      const effectPerPlayer = (player: PlayerState): StateChange => {
        const modifyTarget = modifyPlayer((p) => p.id === player.id)
        const giveCurseToTarget = modifyTarget((player, log) => [
          {
            ...player,
            discard: player.discard.concat([curse])
          },
          log.concat([player.name + ' gains a curse.'])
        ])

        return {
          metaData: [{
            type: 'enemy-attack',
            attacker: me.id,
            attackingCard: 'Witch',
            target: player.id
          }],
          stateChange: giveCurseToTarget
        }
      }

      const allEffects = state.players
        .filter((p) => p.id !== me.id)
        .map(effectPerPlayer)

      return combineSteps(...allEffects)
    }
  )
}