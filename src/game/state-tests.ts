
// export type State<T> = {
//   // _data: T
//   get: () => T
//   then: (f: (s: T) => T) => State<T>
// }

// export const state = <T>(data: T): State<T> => {
//   // const obj = {
//   //   _data: data
//   // }

//   const get = () => {

//   }
//   const then = (f: (s: T) => State<T>) => {
//     return state(f(data))
//   }

//   return {
//     ...obj,
//     get, then
//   }
// }

type State = {
  foo: string
}

export type Step<S> = {
  type: 'state-change' | 'decision'
  tags: string[]
  exec: (state: S) => Step<S>
  then: (step: Step<S>) => Step<S>
}

export type StateChange<S> = {
  type: 'state-change'
  tags: string[]
  exec: (state: S) => S
}

export type Option = {
  id: string
  description: string
}

export type DecisionDescription<S> = {
  description: string
  options: Option[]
}

export type Decision<S> = {
  type: 'decision'
  tags: string[]
  getDecisionDescription: (state: S) => DecisionDescription<S>
  exec: (state: S) => Step<S>
}

