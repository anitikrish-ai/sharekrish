'use client'

import { useState } from 'react'
import type { ClipItem } from '@/lib/types'
import { Glass } from './Glass'
import { TYPE_ICON, primaryValue } from './itemMeta'
import { copyToClipboard } from '@/lib/clipboard'

export function QuickGrid({ items }: { items: ClipItem[] }) {
  const pool = [...items].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1
    if (a.is_favorite !== b.is_favorite) return a.is_favorite ? -1 : 1
    return +new Date(b.updated_at) - +new Date(a.updated_at)
  })
  const quick = pool.filter((i) => !i.is_archived).slice(0, 9)

  if (quick.length === 0) {
    return (
      <Glass className="p-4 text-center text-xs text-white/40">
        Pin or favorite items to have them appear here for one-tap copying.
      </Glass>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
      {quick.map((item) => (
        <QuickTile key={item.id} item={item} />
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
      className={`h-20 sm:h-24 flex flex-col items-center justify-center gap-1 p-2 text-center transition-all ${
        copied ? 'border-emerald-400/50 bg-emerald-500/15' : ''
      }`}
      aria-label={`Copy ${item.title || item.type}`}
    >
      <span
        className={`text-lg sm:text-xl transition-transform ${
          copied ? 'text-emerald-300 scale-110 font-bold' : ''
        }`}
        aria-hidden
      >
        {copied ? '✓' : TYPE_ICON[item.type]}
      </span>
      <span
        className={`text-[10px] sm:text-[11px] truncate w-full px-1 ${
          copied ? 'text-emerald-200 font-medium' : 'text-white/75'
        }`}
      >
        {copied ? 'Copied!' : item.title || '(untitled)'}
      </span>
    </Glass>
  )
}
