import {
  Card,
  CardType,
  Decision,
  StateChangeMetaData,
  EnemyAttackMetaData,
  Step
} from "../game-types"
import { makeChange, pickCards } from "../card-util"

const isEnemyAttack = (s: StateChangeMetaData): s is EnemyAttackMetaData =>
  s.type === 'enemy-attack'

export const Moat: Card = {
  name: 'Moat',
  types: [CardType.ACTION, CardType.REACTION],
  price: 2,
  execAction: makeChange(pickCards(2)),
  reaction: {
    match: (metadata, me) => metadata.filter(
      (m) => isEnemyAttack(m) && m.target === me
    ),
    getReactionStep: (originalStateChange, metadataArr, myId, state): Decision => {
      const me = state.players.find(({ id }) => id === myId)!
      const metadata = metadataArr[0] as EnemyAttackMetaData
      const attackingCard = metadata.attackingCard || 'UNKNOWN ATTACK'
      // console.log('hello here', me.name)
      return {
        type: 'multiselect',
        description: () => [`${me.name}, reveal Moat to stop attack (${attackingCard})?`],
        player: me.id,
        choices: [
          {
            description: 'Reveal Moat',
            execute: () => ({
              stateChange: (state, log) => [
              state,
              log.concat([`${me.name} revealed Moat and ${attackingCard} had no effect.`])
            ]})
          },
          {
            description: "Don't reveal Moat",
            execute: (): Step => ({
              stateChange: (s, log) => [s, log.concat([
                `${me.name} did not reveal Moat.`
              ])],
              then: () => ({
                ...originalStateChange,
                metaData: [{ type: 'handled' }]
              })
            })
          }
        ]
      }
    }
  }
}