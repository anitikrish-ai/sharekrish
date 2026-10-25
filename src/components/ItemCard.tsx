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
    <Glass
      interactive
      className="p-3.5 sm:p-4 flex flex-col justify-between gap-2.5 animate-fade-up"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span aria-hidden className="text-base sm:text-lg flex-shrink-0 select-none">
            {TYPE_ICON[item.type]}
          </span>
          <h3 className="font-medium text-xs sm:text-sm text-white/95 truncate">
            {item.title || '(Untitled item)'}
          </h3>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {item.is_pinned && (
            <span
              aria-label="Pinned"
              title="Pinned"
              className="text-amber-300 text-xs px-1.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20"
            >
              📌
            </span>
          )}
          {item.is_favorite && (
            <span
              aria-label="Favorite"
              title="Favorite"
              className="text-amber-300 text-xs px-1.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20"
            >
              ★
            </span>
          )}
        </div>
      </div>

      {/* Content Preview */}
      {item.type === 'snippet' ? (
        <pre className="text-[11px] sm:text-xs bg-black/40 rounded-xl p-2.5 overflow-x-auto max-h-24 sm:max-h-28 text-sky-200/90 font-mono border border-white/5">
          <code>{item.content}</code>
        </pre>
      ) : (
        <p className="text-xs text-white/70 line-clamp-2 sm:line-clamp-3 break-words leading-relaxed select-text">
          {primaryValue(item.type, item.content, item.url)}
        </p>
      )}

      {/* Footer & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5">
        {category ? (
          <span
            className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full border font-medium truncate max-w-[120px]"
            style={{
              borderColor: category.color + '55',
              color: category.color,
              background: category.color + '1a',
            }}
          >
            {category.name}
          </span>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-1 ml-auto">
          {/* Quick Copy Button */}
          <button
            onClick={handleCopy}
            aria-label="Copy to clipboard"
            className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
              copied
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 animate-scale-pop'
                : 'glass glass-interactive text-white/90 hover:text-white'
            }`}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>

          {/* Action Icons for Admin */}
          {!readOnly && onToggle && (
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => onToggle(item.id, 'is_favorite', !item.is_favorite)}
                aria-pressed={item.is_favorite}
                aria-label={item.is_favorite ? 'Remove favorite' : 'Favorite'}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs text-white/60 hover:text-white hover:bg-white/10 active:scale-95 transition-transform"
              >
                {item.is_favorite ? '★' : '☆'}
              </button>
              <button
                onClick={() => onToggle(item.id, 'is_pinned', !item.is_pinned)}
                aria-pressed={item.is_pinned}
                aria-label={item.is_pinned ? 'Unpin' : 'Pin'}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs text-white/60 hover:text-white hover:bg-white/10 active:scale-95 transition-transform"
              >
                📌
              </button>
              <button
                onClick={() => onEdit?.(item)}
                aria-label="Edit item"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs text-white/60 hover:text-white hover:bg-white/10 active:scale-95 transition-transform"
              >
                ✎
              </button>
              <button
                onClick={() => onToggle(item.id, 'is_archived', !item.is_archived)}
                aria-label={item.is_archived ? 'Unarchive' : 'Archive'}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs text-white/60 hover:text-white hover:bg-white/10 active:scale-95 transition-transform"
              >
                {item.is_archived ? '↩' : '🗄'}
              </button>
              <button
                onClick={() => onDelete?.(item.id)}
                aria-label="Delete item"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs text-rose-300 hover:bg-rose-500/15 active:scale-95 transition-transform"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>
    </Glass>
  )
}
