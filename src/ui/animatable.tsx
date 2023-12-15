
import React, { useContext, useEffect, useRef } from 'react';
import { css } from './css';
import { AnimationContext } from './animation-context';
import { AnimationIdentifier, getAnimClasses } from './animations'

type Props = {
  className?: string
  animId: AnimationIdentifier
}

export const Animatable: React.FC<Props> = ({ animId, className = '', children }) => {
  const context = useContext(AnimationContext)
  
  const pos = useRef<DOMRect | ClientRect | null>(null)
  const elem = useRef<HTMLDivElement>(null)

  const { classes, styles } = getAnimClasses(context, animId, pos.current)

  if (classes.length > 0) {
    console.log('received anim classes', animId, classes)
  }
  useEffect(() => {
    if (!classes.includes('moving')) {
      const current = elem.current
      if (current) {
        pos.current = current.getBoundingClientRect()
      }
    }
  })
  return (
    <div className={css("anim-container", className, ...classes)} style={styles} ref={elem}>
      {children}
    </div>
  )
}