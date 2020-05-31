

import React from 'react';
import {
  PlayerState
} from '../game/game-types'
import { getPlayerColor } from './player-color';

export const PlayerName: React.FC<{ player: PlayerState }> = ({ player }) => {
  return (
    <div className="player-name">
      <p>{player.name}</p>
      <div className="color-block" style={{ backgroundColor: getPlayerColor(player)}}></div>
    </div>
  )
}