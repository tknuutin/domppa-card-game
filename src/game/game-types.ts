import { Mod } from "./modifiers";

export type PlayerId = number
export enum CardType {
  ACTION,
  MONEY,
  POINT,
  ATTACK,
  REACTION,
  CURSE,
  RUINS,
  SHELTER
}

export type ReactTo = 'enemy-attack'

type BaseStep = {
  then?: Stepper
}

type SCMetadataBase<T> = {
  type: T
}
export type EnemyAttackMetaData = SCMetadataBase<'enemy-attack'> & {
  attacker: PlayerId
  target: PlayerId
  attackingCard?: string
}

// union type
export type StateChangeMetaData =
  | EnemyAttackMetaData
  | SCMetadataBase<'handled'>

export type StateChangeF = (s: State, output: string[]) => [State, string[]]
export type StateChange = BaseStep & {
  metaData?: StateChangeMetaData[]
  stateChange: StateChangeF
}
type BaseDecision<T> = BaseStep & {
  player: PlayerId
  type: T
  description?: (state: State) => string[]
}

export type MultiselectChoice = {
  description: string
  execute: (state: State, log: string[]) => Step
}
export type MultiselectDecision = BaseDecision<'multiselect'> & {
  
  choices: MultiselectChoice[]
}
export type InputDecision = BaseDecision<'input'> & {
  description: (state: State) => string[]
  parseDecision: (decision: string, state: State) => Step | undefined
}
export type Decision = InputDecision | MultiselectDecision

type CustomMoneyAmountCounter = (state: State) => number

export type Step = StateChange | Decision
export type Stepper = (s: State, log: string[]) => Step

export type CardReactionProperties = {
  match: (
    metadata: StateChangeMetaData[],
    location: PlayerId,
    state: State
  ) => StateChangeMetaData[] | undefined

  getReactionStep: (
    sc: StateChange,
    matchingMetadata: StateChangeMetaData[],
    location: PlayerId,
    state: State,
    log: string[]
  ) => Step
}

export type CardTemplate = {
  name: string
  description?: string
  types: CardType[]
  price: number | CustomMoneyAmountCounter
  moneyValue?: number | CustomMoneyAmountCounter
  points?: number
  
  reaction?: CardReactionProperties

  execAction?: (state: State, log: string[]) => Step
  execBuyAction?: (state: State, log: string[]) => Step
}

export type Card = {
  // card template
  template: string

  // physical id. this type refers to a "physical" card,
  // so we can track the movements of an actual physical
  pid: string
}

export type PlayerState = {
  id: PlayerId
  name: string
  deck: Card[]
  discard: Card[]
  hand: Card[]
  turns: number
}

export type TurnPhase = 'action' | 'buy'

export type PhaseStateBase<T extends TurnPhase> = {
  player: PlayerId
  phase: T
  // hand belongs to playerstate
}

export type ActionPhaseState = PhaseStateBase<'action'> & {
  played: Card[]
  actions: number
  buys: number
  money: number
  discounts?: Discount[]
}

export type Purchase = {
  card: Card
  moneySpent: number
}

export type Discount = {
  match: (card: Card, state: State) => boolean
  discount: (currentPrice: number, card: Card, state: State) => number
}

export type BuyPhaseState = PhaseStateBase<'buy'> & {
  played: Card[]  // This is for cards played in the buy phase
  buys: number
  startedPurchasing: boolean
  money: number
  purchases: Purchase[]
  discounts: Discount[]
  actionPhase: {
    played: Card[]
    // More info here later?
  }
}

export type TurnState = BuyPhaseState | ActionPhaseState

export type StoreState = {
  actions: Card[][]
  estate: Card[]
  duchy: Card[]
  province: Card[]
  copper: Card[]
  silver: Card[]
  gold: Card[]
  curse: Card[]
}
export type State = {
  debug: boolean
  turns: number
  turn: TurnState
  players: PlayerState[]
  store: StoreState
}