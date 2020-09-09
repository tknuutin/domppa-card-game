
import React from 'react'
import { Animation } from './animations'

export type AnimationState = {
  state: string
  animation: Animation
}

export type AnimationContextType = {
  animations: AnimationState[]
}

export const AnimationContext = React.createContext<AnimationContextType>({
  animations: []
})