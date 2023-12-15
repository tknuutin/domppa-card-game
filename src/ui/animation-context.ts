
import React from 'react'
import { Animation } from './animations'

// export type AnimationState = {
//   state: string
//   animation: Animation
// }

export type Pos = {
  x: number
  y: number
}

export class AnimationContextController {
  public animations: Animation[]
  public positions: {
    [i: string]: Pos | undefined
  }
  constructor() {
    this.animations = []
    this.positions = {}
  }

  reportPosition(animId: string, pos: Pos | undefined) {
    if (pos) {
      this.positions[animId] = pos
    } else {
      delete this.positions[animId]
    }
  }
}

// export type AnimationContextType = {
//   animations: Animation[]
//   positions: {
//     [i: string]: Pos | undefined
//   }
//   reportPosition: (animId: string, pos: Pos) => void
// }

// class

export const AnimationContext = React.createContext(new AnimationContextController())