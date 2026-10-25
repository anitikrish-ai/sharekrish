import { type ElementType, type ComponentPropsWithoutRef } from 'react'

type GlassProps<T extends ElementType> = {
  as?: T
  strong?: boolean
  interactive?: boolean
  className?: string
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className'>

// Liquid-glass surface used everywhere in the app — a thin wrapper over the
// `.glass` CSS utility (globals.css) rather than a JS/WebGL runtime, so it
// costs nothing beyond a few CSS properties. See the liquid-glass-studio
// skill if a page ever needs real shader-based refraction instead (video
// backgrounds, a WebGL hero); this one is for ordinary UI chrome.
export function Glass<T extends ElementType = 'div'>({
  as, strong, interactive, className = '', ...props
}: GlassProps<T>) {
  const Component = as || 'div'
  const classes = [
    'glass',
    strong ? 'glass-strong' : '',
    interactive ? 'glass-interactive' : '',
    className,
  ].filter(Boolean).join(' ')
  return <Component className={classes} {...props} />
}
