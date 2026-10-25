import React from 'react'

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
  className?: string
  strokeWidth?: number
}

const defaultProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function IconClipboard({ size = 20, strokeWidth = 2, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} strokeWidth={strokeWidth} className={className} {...defaultProps} {...props}>
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    </svg>
  )
}

export function IconCopy({ size = 18, strokeWidth = 2, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} strokeWidth={strokeWidth} className={className} {...defaultProps} {...props}>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  )
}

export function IconCheck({ size = 18, strokeWidth = 2, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} strokeWidth={strokeWidth} className={className} {...defaultProps} {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

export function IconShare({ size = 18, strokeWidth = 2, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} strokeWidth={strokeWidth} className={className} {...defaultProps} {...props}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
      <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
    </svg>
  )
}

export function IconLogOut({ size = 18, strokeWidth = 2, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} strokeWidth={strokeWidth} className={className} {...defaultProps} {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  )
}

export function IconSearch({ size = 18, strokeWidth = 2, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} strokeWidth={strokeWidth} className={className} {...defaultProps} {...props}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

export function IconPlus({ size = 18, strokeWidth = 2, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} strokeWidth={strokeWidth} className={className} {...defaultProps} {...props}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}

export function IconX({ size = 18, strokeWidth = 2, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} strokeWidth={strokeWidth} className={className} {...defaultProps} {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

export function IconStar({ size = 18, strokeWidth = 2, filled = false, className = '', ...props }: IconProps & { filled?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      className={className}
      fill={filled ? 'currentColor' : 'none'}
      {...defaultProps}
      {...props}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

export function IconPin({ size = 18, strokeWidth = 2, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} strokeWidth={strokeWidth} className={className} {...defaultProps} {...props}>
      <line x1="12" x2="12" y1="17" y2="22" />
      <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
    </svg>
  )
}

export function IconEdit({ size = 18, strokeWidth = 2, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} strokeWidth={strokeWidth} className={className} {...defaultProps} {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}

export function IconArchive({ size = 18, strokeWidth = 2, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} strokeWidth={strokeWidth} className={className} {...defaultProps} {...props}>
      <rect width="20" height="5" x="2" y="3" rx="1" />
      <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
      <path d="M10 12h4" />
    </svg>
  )
}

export function IconTrash({ size = 18, strokeWidth = 2, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} strokeWidth={strokeWidth} className={className} {...defaultProps} {...props}>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  )
}

export function IconExternalLink({ size = 16, strokeWidth = 2, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} strokeWidth={strokeWidth} className={className} {...defaultProps} {...props}>
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  )
}

export function IconClock({ size = 18, strokeWidth = 2, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} strokeWidth={strokeWidth} className={className} {...defaultProps} {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

export function IconFolder({ size = 18, strokeWidth = 2, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} strokeWidth={strokeWidth} className={className} {...defaultProps} {...props}>
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 8 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    </svg>
  )
}

export function IconFileText({ size = 18, strokeWidth = 2, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} strokeWidth={strokeWidth} className={className} {...defaultProps} {...props}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  )
}

export function IconLink({ size = 18, strokeWidth = 2, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} strokeWidth={strokeWidth} className={className} {...defaultProps} {...props}>
      <path d="M9 17H7A5 5 0 0 1 7 7h2" />
      <path d="M15 7h2a5 5 0 1 1 0 10h-2" />
      <line x1="8" x2="16" y1="12" y2="12" />
    </svg>
  )
}

export function IconCode({ size = 18, strokeWidth = 2, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} strokeWidth={strokeWidth} className={className} {...defaultProps} {...props}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  )
}

export function IconZap({ size = 18, strokeWidth = 2, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} strokeWidth={strokeWidth} className={className} {...defaultProps} {...props}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

export function IconImage({ size = 18, strokeWidth = 2, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} strokeWidth={strokeWidth} className={className} {...defaultProps} {...props}>
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  )
}

export function IconVideo({ size = 18, strokeWidth = 2, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} strokeWidth={strokeWidth} className={className} {...defaultProps} {...props}>
      <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.934a.5.5 0 0 0-.777-.416L16 11" />
      <rect width="14" height="12" x="2" y="6" rx="2" />
    </svg>
  )
}

export function IconMusic({ size = 18, strokeWidth = 2, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} strokeWidth={strokeWidth} className={className} {...defaultProps} {...props}>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  )
}

export function IconSparkles({ size = 18, strokeWidth = 2, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} strokeWidth={strokeWidth} className={className} {...defaultProps} {...props}>
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
    </svg>
  )
}

export function IconGlobe({ size = 18, strokeWidth = 2, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} strokeWidth={strokeWidth} className={className} {...defaultProps} {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" x2="22" y1="12" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

export function IconShield({ size = 18, strokeWidth = 2, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} strokeWidth={strokeWidth} className={className} {...defaultProps} {...props}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  )
}

export function IconArrowLeft({ size = 18, strokeWidth = 2, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} strokeWidth={strokeWidth} className={className} {...defaultProps} {...props}>
      <line x1="19" x2="5" y1="12" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  )
}

export function IconAlertCircle({ size = 18, strokeWidth = 2, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} strokeWidth={strokeWidth} className={className} {...defaultProps} {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  )
}

export function IconKey({ size = 18, strokeWidth = 2, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} strokeWidth={strokeWidth} className={className} {...defaultProps} {...props}>
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="m21 2-9.6 9.6" />
      <path d="m15.5 7.5 3 3L22 7l-3-3" />
    </svg>
  )
}
