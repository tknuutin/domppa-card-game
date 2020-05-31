import { PlayerState } from "../game/game-types"

let COLOR_MAP: { [id: string]: string } = {}
let colors = ['yellow', 'green', 'red', 'blue']
export const getPlayerColor = ({ id }: PlayerState) => {
  if (COLOR_MAP[id] === undefined) {
    const newColor = colors.pop()
    if (!newColor) {
      throw new Error('Ooops')
    }
    COLOR_MAP[id] = newColor
  }
  return COLOR_MAP[id]
}