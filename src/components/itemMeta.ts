import type { ItemType } from '@/lib/types'

export const TYPE_ICON: Record<ItemType, string> = {
  text: '📝',
  link: '🔗',
  snippet: '💻',
  shortcut: '⚡',
  image: '🖼️',
  video: '🎬',
  music: '🎵',
}

export const TYPE_LABEL: Record<ItemType, string> = {
  text: 'Text',
  link: 'Link',
  snippet: 'Snippet',
  shortcut: 'Shortcut',
  image: 'Image',
  video: 'Video',
  music: 'Music',
}

// What a given item type actually copies/opens — links and media copy
// their URL, everything else copies its text content.
export function primaryValue(type: ItemType, content: string, url: string | null): string {
  if ((type === 'link' || type === 'image' || type === 'video' || type === 'music') && url) {
    return url
  }
  return content
}
