'use client'

import { useState } from 'react'
import type { ClipItem, ItemType } from '@/lib/types'
import { Glass } from './Glass'
import { primaryValue, renderTypeIcon } from './itemMeta'
import { copyToClipboard } from '@/lib/clipboard'
import { IconFileText, IconLink, IconCode, IconCheck } from './Icons'

export function QuickGrid({
  items,
  onQuickCreate,
}: {
  items: ClipItem[]
  onQuickCreate?: (type: ItemType) => void
}) {
  const pool = [...items].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1
    if (a.is_favorite !== b.is_favorite) return a.is_favorite ? -1 : 1
    return +new Date(b.updated_at) - +new Date(a.updated_at)
  })
  const quick = pool.filter((i) => !i.is_archived).slice(0, 9)

  if (quick.length === 0) {
    return (
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
        <button
          type="button"
          onClick={() => onQuickCreate?.('text')}
          className="glass glass-interactive h-20 sm:h-22 rounded-2xl flex flex-col items-center justify-center gap-1.5 p-2 text-center group border-white/[0.08] hover:border-sky-400/40"
        >
          <IconFileText size={20} className="text-sky-400 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-medium text-slate-300 group-hover:text-sky-300">New Note</span>
        </button>

        <button
          type="button"
          onClick={() => onQuickCreate?.('link')}
          className="glass glass-interactive h-20 sm:h-22 rounded-2xl flex flex-col items-center justify-center gap-1.5 p-2 text-center group border-white/[0.08] hover:border-teal-400/40"
        >
          <IconLink size={20} className="text-teal-400 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-medium text-slate-300 group-hover:text-teal-300">Save Link</span>
        </button>

        <button
          type="button"
          onClick={() => onQuickCreate?.('snippet')}
          className="glass glass-interactive h-20 sm:h-22 rounded-2xl flex flex-col items-center justify-center gap-1.5 p-2 text-center group border-white/[0.08] hover:border-amber-400/40"
        >
          <IconCode size={20} className="text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-medium text-slate-300 group-hover:text-amber-300">Snippet</span>
        </button>
      </div>
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
      className={`h-20 sm:h-22 flex flex-col items-center justify-center gap-1.5 p-2 text-center transition-all relative overflow-hidden ${
        copied
          ? 'border-emerald-400/50 bg-emerald-500/20 shadow-[0_0_20px_rgba(52,211,153,0.25)]'
          : 'hover:border-sky-400/35 border-white/[0.08]'
      }`}
      aria-label={`Copy ${item.title || item.type}`}
    >
      <span
        className={`transition-transform flex items-center justify-center ${
          copied ? 'text-emerald-400 scale-125' : 'text-sky-400'
        }`}
        aria-hidden
      >
        {copied ? <IconCheck size={20} strokeWidth={2.5} /> : renderTypeIcon(item.type, 20)}
      </span>
      <span
        className={`text-[11px] truncate w-full px-1 font-medium ${
          copied ? 'text-emerald-200 font-semibold' : 'text-slate-200'
        }`}
      >
        {copied ? 'Copied' : item.title || '(untitled)'}
      </span>
    </Glass>
  )
}
