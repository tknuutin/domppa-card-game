
import { identity } from 'ramda'

export const css = (...classes: (string | undefined)[]) =>
    classes.filter(identity).join(' ')