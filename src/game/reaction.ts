import { State, PlayerId, Card, StateChangeMetaData, Step, StateChange } from "./game-types";
import { isReaction } from "./card-util";

type Matches = {
  player: PlayerId
  reactions: ReactionMatch[]
}

type ReactionMatch = { card: Card, metadata: StateChangeMetaData[] }

export const getMatchingReactions = (
  state: State,
  metadata: StateChangeMetaData[]
): Matches[] =>
  state.players
    .map((p) => ({
      player: p.id,
      reactions: p.hand
        .filter(isReaction)
        .map((card): ReactionMatch | undefined => {
          const { reaction } = card
          if (!reaction) {
            return undefined
          }
          const match = reaction.match(metadata, p.id, state)
          return match && match.length > 0 ? { card, metadata: match } : undefined
        })
        .filter((x): x is ReactionMatch => !!x)
    }))
    .filter(({ reactions }) => reactions.length > 0)

export const getReactionExecutionSteps = (
  reactionsPerPlayer: Matches[],
  originalStateChange: StateChange,
  state: State,
  log: string[]
): Step[] =>
  reactionsPerPlayer.reduce((acc: Step[], { reactions, player }) => {
    const steps = reactions.map(({ card, metadata }): Step => {
      const { reaction } = card
      if (!reaction) {
        return { stateChange: (s, log) => [s, log]}
      }
      return reaction.getReactionStep(
        originalStateChange,
        metadata,
        player,
        state,
        log
      )
    })
    return acc.concat(steps)
  }, [])

