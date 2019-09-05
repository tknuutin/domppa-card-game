
import * as R from 'ramda'

export type CurriedF2<A, B, Ret> = {
  (a: A): (b: B) => Ret
  (a: A, b: B): Ret
}
export type CurriedF3<A, B, C, Ret> = {
  (a: A): CurriedF2<B, C, Ret>
  (a: A, b: B): (c: C) => Ret
  (a: A, b: B, c: C): Ret
}

export function shuffle<T>(_arr: T[]): T[] {
  let a = R.map((x) => x, _arr)
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export type TwoTupleF<A, B> = (a: A, b: B) => [A, B]
export const pipe2 = <A, B>(
  ...funcs: TwoTupleF<A, B>[]
): TwoTupleF<A, B> =>
  (origA, origB) => R.reduce(
    ([a, b], func) => func(a, b),
    [origA, origB],
    funcs
  )