import React from 'react'
import type { ItemType } from '@/lib/types'
import {
  IconFileText,
  IconLink,
  IconCode,
  IconZap,
  IconImage,
  IconVideo,
  IconMusic,
} from './Icons'

export const TYPE_LABEL: Record<ItemType, string> = {
  text: 'Text',
  link: 'Link',
  snippet: 'Snippet',
  shortcut: 'Shortcut',
  image: 'Image',
  video: 'Video',
  music: 'Music',
}

export function renderTypeIcon(type: ItemType, size = 18, className = ''): React.ReactElement {
  switch (type) {
    case 'text':
      return <IconFileText size={size} className={className} />
    case 'link':
      return <IconLink size={size} className={className} />
    case 'snippet':
      return <IconCode size={size} className={className} />
    case 'shortcut':
      return <IconZap size={size} className={className} />
    case 'image':
      return <IconImage size={size} className={className} />
    case 'video':
      return <IconVideo size={size} className={className} />
    case 'music':
      return <IconMusic size={size} className={className} />
    default:
      return <IconFileText size={size} className={className} />
  }
}

// What a given item type actually copies/opens — links and media copy
// their URL, everything else copies its text content.
export function primaryValue(type: ItemType, content: string, url: string | null): string {
  if ((type === 'link' || type === 'image' || type === 'video' || type === 'music') && url) {
    return url
  }
  return content
}
