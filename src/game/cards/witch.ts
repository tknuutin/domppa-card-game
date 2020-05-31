import { CardTemplate, CardType, PlayerState, StateChange, StateChangeF } from "../game-types"
import { combineSteppers, getCurrentPlayer, combineSteps, makeChange } from "../game-util"
import { modifyPlayer } from "../modifiers"
import { CardFactory } from "../cards"

export const Witch: CardFactory = ({ pickCards }) => ({
  name: 'Witch',
  types: [CardType.ACTION, CardType.ATTACK],
  price: 5,
  execAction: combineSteppers(
    makeChange(pickCards(2)),
    (state, log) => {
      const me = getCurrentPlayer(state)

      const effectPerPlayer = (player: PlayerState): StateChange => {
        const modifyTarget = modifyPlayer((p) => p.id === player.id)
        
        const giveCurse: StateChangeF = (state, log) => {
          const pile = state.store.curse
          if (pile.length < 1) {
            return [state, log.concat([
              `The curse pile is empty so Witch has no effect on ${player.name}.`
            ])]
          }

          const [curse, ...rest] = pile
          const giveCurseToTarget = modifyTarget((player, log) => [
            {
              ...player,
              discard: player.discard.concat([curse])
            },
            log.concat([player.name + ' gains a curse.'])
          ])

          return giveCurseToTarget(
            {
              ...state,
              store: {
                ...state.store,
                curse: rest
              }
            },
            log
          )
        }

        return {
          metaData: [{
            type: 'enemy-attack',
            attacker: me.id,
            attackingCard: 'Witch',
            target: player.id
          }],
          stateChange: giveCurse
        }
      }

      const allEffects = state.players
        .filter((p) => p.id !== me.id)
        .map(effectPerPlayer)

      return combineSteps(...allEffects)
    }
  )
})