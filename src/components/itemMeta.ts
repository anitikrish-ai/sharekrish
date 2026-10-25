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
      return React.createElement(IconFileText, { size, className })
    case 'link':
      return React.createElement(IconLink, { size, className })
    case 'snippet':
      return React.createElement(IconCode, { size, className })
    case 'shortcut':
      return React.createElement(IconZap, { size, className })
    case 'image':
      return React.createElement(IconImage, { size, className })
    case 'video':
      return React.createElement(IconVideo, { size, className })
    case 'music':
      return React.createElement(IconMusic, { size, className })
    default:
      return React.createElement(IconFileText, { size, className })
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
