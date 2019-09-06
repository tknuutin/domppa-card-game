export type PlayerId = number
export enum CardType {
  ACTION,
  MONEY,
  POINT,
  ATTACK,
  CURSE,
  RUINS,
  SHELTER
}

export type StateChange = {
  stateChange: (s: State, output: string[]) => [State, string[]]
  then?: Stepper
}
type BaseDecision<T> = {
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
export type Card = {
  name: string
  description?: string
  types: CardType[]
  price: number | CustomMoneyAmountCounter
  moneyValue?: number | CustomMoneyAmountCounter
  points?: number
  execAction?: (state: State, log: string[]) => Step
  execBuyAction?: (state: State, log: string[]) => Step
}

export type PlayerState = {
  id: PlayerId
  name: string
  deck: Card[]
  discard: Card[]
  hand: Card[]
}

export type TurnPhase = 'action' | 'buy'

export type PhaseStateBase<T extends TurnPhase> = {
  player: PlayerId
  phase: T
  // hand belongs to playerstate
}

// Might later extend this with additional info about made decisions
// on the cards?
export type PlayedCard = Card

export type ActionPhaseState = PhaseStateBase<'action'> & {
  played: PlayedCard[]
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
  played: PlayedCard[]  // This is for cards played in the buy phase
  buys: number
  startedPurchasing: boolean
  money: number
  purchases: Purchase[]
  discounts: Discount[]
  actionPhase: {
    played: PlayedCard[]
    // More info here later?
  }
}

export type TurnState = BuyPhaseState | ActionPhaseState

export type StoreState = {
  points: Card[][]
  actions: Card[][]
  money: Card[][]
  other?: Card[][]
}
export type State = {
  debug: boolean
  turns: number
  turn: TurnState
  players: PlayerState[]
  store: StoreState
}