'use client'

import { useState } from 'react'
import type { Category, ClipItem } from '@/lib/types'
import { Glass } from './Glass'
import { TYPE_ICON, TYPE_LABEL, primaryValue } from './itemMeta'
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
      className="p-4 flex flex-col justify-between gap-3 animate-fade-up border-white/10 hover:border-sky-400/30"
    >
      {/* Header with Type Badge & Pin/Fav */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-base flex-shrink-0 select-none" aria-hidden>
            {TYPE_ICON[item.type]}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm text-white truncate">
              {item.title || '(Untitled item)'}
            </h3>
            <span className="text-[10px] uppercase font-bold tracking-wider text-sky-400/80">
              {TYPE_LABEL[item.type]}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {item.is_pinned && (
            <span
              aria-label="Pinned"
              title="Pinned"
              className="text-amber-300 text-xs px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/25 font-medium"
            >
              📌
            </span>
          )}
          {item.is_favorite && (
            <span
              aria-label="Favorite"
              title="Favorite"
              className="text-amber-300 text-xs px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/25 font-medium"
            >
              ★
            </span>
          )}
        </div>
      </div>

      {/* Content Preview */}
      {item.type === 'snippet' ? (
        <pre className="text-xs bg-black/50 rounded-xl p-3 overflow-x-auto max-h-28 text-sky-200 font-mono border border-white/10 leading-relaxed">
          <code>{item.content}</code>
        </pre>
      ) : item.type === 'link' && item.url ? (
        <div className="flex items-center justify-between gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5">
          <p className="text-xs text-emerald-300 font-medium truncate flex-1">
            {item.url}
          </p>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-emerald-300 hover:text-emerald-200 underline flex items-center gap-0.5 flex-shrink-0"
          >
            Open ↗
          </a>
        </div>
      ) : (
        <p className="text-xs text-white/75 line-clamp-3 break-words leading-relaxed select-text">
          {primaryValue(item.type, item.content, item.url)}
        </p>
      )}

      {/* Footer: Category badge & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
        {category ? (
          <span
            className="text-[11px] px-2.5 py-0.5 rounded-full border font-medium truncate max-w-[130px]"
            style={{
              borderColor: category.color + '60',
              color: category.color,
              background: category.color + '1c',
            }}
          >
            {category.name}
          </span>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-1.5 ml-auto">
          {/* Copy Button with checkmark animation */}
          <button
            onClick={handleCopy}
            aria-label="Copy to clipboard"
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 flex items-center gap-1 ${
              copied
                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/50 shadow-[0_0_15px_rgba(52,211,153,0.3)] animate-scale-pop'
                : 'bg-white/10 hover:bg-white/15 text-white border border-white/15'
            }`}
          >
            <span>{copied ? '✓' : '📋'}</span>
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Action Icons for Admin */}
          {!readOnly && onToggle && (
            <div className="flex items-center gap-0.5 bg-black/20 rounded-xl p-0.5 border border-white/5">
              <button
                onClick={() => onToggle(item.id, 'is_favorite', !item.is_favorite)}
                aria-pressed={item.is_favorite}
                aria-label={item.is_favorite ? 'Remove favorite' : 'Favorite'}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs text-white/60 hover:text-amber-300 hover:bg-white/10 active:scale-90 transition-transform"
              >
                {item.is_favorite ? '★' : '☆'}
              </button>
              <button
                onClick={() => onToggle(item.id, 'is_pinned', !item.is_pinned)}
                aria-pressed={item.is_pinned}
                aria-label={item.is_pinned ? 'Unpin' : 'Pin'}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs text-white/60 hover:text-white hover:bg-white/10 active:scale-90 transition-transform"
              >
                📌
              </button>
              <button
                onClick={() => onEdit?.(item)}
                aria-label="Edit item"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs text-white/60 hover:text-sky-300 hover:bg-white/10 active:scale-90 transition-transform"
              >
                ✎
              </button>
              <button
                onClick={() => onToggle(item.id, 'is_archived', !item.is_archived)}
                aria-label={item.is_archived ? 'Unarchive' : 'Archive'}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs text-white/60 hover:text-white hover:bg-white/10 active:scale-90 transition-transform"
              >
                {item.is_archived ? '↩' : '🗄'}
              </button>
              <button
                onClick={() => onDelete?.(item.id)}
                aria-label="Delete item"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs text-rose-300 hover:bg-rose-500/20 active:scale-90 transition-transform"
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
