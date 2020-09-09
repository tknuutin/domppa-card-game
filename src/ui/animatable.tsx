
import React, { useContext } from 'react';
import { css } from './css';
import { AnimationContext } from './animation-context';
import { AnimationIdentifier, getAnimClasses } from './animations'

type Props = {
  className?: string
  animId: AnimationIdentifier
}

export const Animatable: React.FC<Props> = ({ animId, className = '', children }) => {
  const context = useContext(AnimationContext)
  const animClasses = getAnimClasses(context, animId)
  return (
    <div className={css("anim-container", className, ...animClasses)}>
      {children}
    </div>
  )
}