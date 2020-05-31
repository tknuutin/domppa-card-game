
import React from 'react'
import { css } from './css'

type Props = {
  log: string[],
  cls?: string
}

export const ScreenLog: React.FC<Props> = ({ log, cls }) => (
  <div className={css('log', cls)}>
    {log.map((line, i) => (
        <p key={i}>{line}</p>
    ))}
  </div>
)