'use client'

import { useState } from 'react'
import type { ClipItem } from '@/lib/types'
import { Glass } from './Glass'
import { TYPE_ICON, primaryValue } from './itemMeta'
import { copyToClipboard } from '@/lib/clipboard'

// The 3x3 "quick access" grid: pinned items first, then favorites, then
// most-recently-updated, filled to 9 tiles. One tap copies — this is the
// fast path the rest of the dashboard's filters/search exist alongside,
// not instead of.
export function QuickGrid({ items }: { items: ClipItem[] }) {
  const pool = [...items].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1
    if (a.is_favorite !== b.is_favorite) return a.is_favorite ? -1 : 1
    return +new Date(b.updated_at) - +new Date(a.updated_at)
  })
  const quick = pool.filter((i) => !i.is_archived).slice(0, 9)

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {quick.map((item) => (
        <QuickTile key={item.id} item={item} />
      ))}
      {Array.from({ length: Math.max(0, 9 - quick.length) }).map((_, i) => (
        <Glass key={`empty-${i}`} className="aspect-square flex items-center justify-center opacity-30">
          <span className="text-xs text-white/40">—</span>
        </Glass>
      ))}
    </div>
  )
}

function QuickTile({ item }: { item: ClipItem }) {
  const [copied, setCopied] = useState(false)
  return (
    <Glass
      as="button"
      interactive
      onClick={async () => {
        const ok = await copyToClipboard(primaryValue(item.type, item.content, item.url))
        if (ok) {
          setCopied(true)
          setTimeout(() => setCopied(false), 1200)
        }
      }}
      className="aspect-square flex flex-col items-center justify-center gap-1 p-2 text-center"
      aria-label={`Copy ${item.title || item.type}`}
    >
      <span className="text-xl" aria-hidden>{copied ? '✓' : TYPE_ICON[item.type]}</span>
      <span className="text-[11px] text-white/70 truncate w-full px-1">
        {copied ? 'Copied' : item.title || '(untitled)'}
      </span>
    </Glass>
  )
}
