'use client'

import { useState } from 'react'
import type { Category, ClipItem } from '@/lib/types'
import { Glass } from './Glass'
import { TYPE_ICON, primaryValue } from './itemMeta'
import { copyToClipboard } from '@/lib/clipboard'

export function ItemCard({
  item,
  category,
  readOnly = false,
  onEdit,
  onDelete,
  onToggle,
}: {
  item: ClipItem
  category?: Category
  readOnly?: boolean
  onEdit?: (item: ClipItem) => void
  onDelete?: (id: string) => void
  onToggle?: (id: string, field: 'is_favorite' | 'is_pinned' | 'is_archived', value: boolean) => void
}) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const ok = await copyToClipboard(primaryValue(item.type, item.content, item.url))
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    }
  }

  return (
    <Glass interactive className="p-4 flex flex-col gap-2 animate-fade-in">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span aria-hidden className="text-lg leading-none">{TYPE_ICON[item.type]}</span>
          <h3 className="font-medium text-sm truncate">{item.title || TYPE_ICON[item.type]}</h3>
        </div>
        {item.is_pinned && <span aria-label="Pinned" title="Pinned" className="text-amber-300 text-xs">📌</span>}
      </div>

      {item.type === 'snippet' ? (
        <pre className="text-xs bg-black/30 rounded-lg p-2 overflow-x-auto max-h-28 text-sky-100/90">
          <code>{item.content}</code>
        </pre>
      ) : (
        <p className="text-xs text-white/65 line-clamp-3 break-words">
          {primaryValue(item.type, item.content, item.url)}
        </p>
      )}

      <div className="flex items-center justify-between mt-1">
        {category ? (
          <span
            className="text-[11px] px-2 py-0.5 rounded-full border"
            style={{ borderColor: category.color + '55', color: category.color, background: category.color + '1a' }}
          >
            {category.name}
          </span>
        ) : <span />}

        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            aria-label="Copy to clipboard"
            className="glass glass-interactive rounded-lg px-2 py-1 text-xs"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>

          {!readOnly && onToggle && (
            <>
              <button
                onClick={() => onToggle(item.id, 'is_favorite', !item.is_favorite)}
                aria-pressed={item.is_favorite}
                aria-label={item.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                className="rounded-lg px-2 py-1 text-xs hover:bg-white/10"
              >
                {item.is_favorite ? '★' : '☆'}
              </button>
              <button
                onClick={() => onToggle(item.id, 'is_pinned', !item.is_pinned)}
                aria-pressed={item.is_pinned}
                aria-label={item.is_pinned ? 'Unpin' : 'Pin'}
                className="rounded-lg px-2 py-1 text-xs hover:bg-white/10"
              >
                📌
              </button>
              <button
                onClick={() => onEdit?.(item)}
                aria-label="Edit item"
                className="rounded-lg px-2 py-1 text-xs hover:bg-white/10"
              >
                ✎
              </button>
              <button
                onClick={() => onToggle(item.id, 'is_archived', !item.is_archived)}
                aria-label={item.is_archived ? 'Unarchive' : 'Archive'}
                className="rounded-lg px-2 py-1 text-xs hover:bg-white/10"
              >
                {item.is_archived ? '↩' : '🗄'}
              </button>
              <button
                onClick={() => onDelete?.(item.id)}
                aria-label="Delete item"
                className="rounded-lg px-2 py-1 text-xs text-rose-300 hover:bg-rose-500/10"
              >
                ✕
              </button>
            </>
          )}
        </div>
      </div>
    </Glass>
  )
}
