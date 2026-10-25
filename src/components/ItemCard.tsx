'use client'

import { useState } from 'react'
import type { Category, ClipItem } from '@/lib/types'
import { Glass } from './Glass'
import { TYPE_LABEL, primaryValue, renderTypeIcon } from './itemMeta'
import { copyToClipboard } from '@/lib/clipboard'
import {
  IconCopy,
  IconCheck,
  IconPin,
  IconStar,
  IconEdit,
  IconArchive,
  IconTrash,
  IconExternalLink,
} from './Icons'

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
      className="p-4 flex flex-col justify-between gap-3 animate-fade-up border-white/[0.08] hover:border-sky-400/30 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center flex-shrink-0 text-sky-400 group-hover:border-sky-400/30 transition-colors">
            {renderTypeIcon(item.type, 16, 'text-sky-400')}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm text-slate-100 truncate">
              {item.title || '(Untitled item)'}
            </h3>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              {TYPE_LABEL[item.type]}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {item.is_pinned && (
            <span
              aria-label="Pinned"
              title="Pinned"
              className="p-1 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-400"
            >
              <IconPin size={12} strokeWidth={2.5} />
            </span>
          )}
          {item.is_favorite && (
            <span
              aria-label="Favorite"
              title="Favorite"
              className="p-1 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-400"
            >
              <IconStar size={12} filled strokeWidth={2.5} />
            </span>
          )}
        </div>
      </div>

      {/* Content Preview */}
      {item.type === 'snippet' ? (
        <pre className="text-xs bg-black/40 rounded-xl p-3 overflow-x-auto max-h-28 text-sky-200/95 font-mono border border-white/[0.06] leading-relaxed">
          <code>{item.content}</code>
        </pre>
      ) : item.type === 'link' && item.url ? (
        <div className="flex items-center justify-between gap-2 bg-emerald-500/[0.08] border border-emerald-500/20 rounded-xl p-2.5">
          <p className="text-xs text-emerald-300 font-medium truncate flex-1">
            {item.url}
          </p>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-emerald-300 hover:text-emerald-200 flex items-center gap-1 flex-shrink-0 font-medium"
          >
            <span>Open</span>
            <IconExternalLink size={12} />
          </a>
        </div>
      ) : (
        <p className="text-xs text-slate-300 line-clamp-3 break-words leading-relaxed select-text font-normal">
          {primaryValue(item.type, item.content, item.url)}
        </p>
      )}

      {/* Footer & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.06]">
        {category ? (
          <span
            className="text-[11px] px-2.5 py-0.5 rounded-lg border font-medium truncate max-w-[130px] flex items-center gap-1.5"
            style={{
              borderColor: category.color + '55',
              color: category.color,
              background: category.color + '18',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: category.color }}
            />
            {category.name}
          </span>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-1.5 ml-auto">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            aria-label="Copy to clipboard"
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 flex items-center gap-1.5 ${
              copied
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-[0_0_15px_rgba(52,211,153,0.25)] animate-scale-pop'
                : 'bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border border-white/[0.1]'
            }`}
          >
            {copied ? <IconCheck size={13} strokeWidth={2.5} /> : <IconCopy size={13} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Action Icons */}
          {!readOnly && onToggle && (
            <div className="flex items-center gap-0.5 bg-black/25 rounded-xl p-0.5 border border-white/[0.06]">
              <button
                onClick={() => onToggle(item.id, 'is_favorite', !item.is_favorite)}
                aria-pressed={item.is_favorite}
                aria-label={item.is_favorite ? 'Remove favorite' : 'Favorite'}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-amber-400 hover:bg-white/[0.08] active:scale-90 transition-transform"
              >
                <IconStar size={14} filled={item.is_favorite} />
              </button>
              <button
                onClick={() => onToggle(item.id, 'is_pinned', !item.is_pinned)}
                aria-pressed={item.is_pinned}
                aria-label={item.is_pinned ? 'Unpin' : 'Pin'}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] active:scale-90 transition-transform"
              >
                <IconPin size={14} />
              </button>
              <button
                onClick={() => onEdit?.(item)}
                aria-label="Edit item"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-sky-300 hover:bg-white/[0.08] active:scale-90 transition-transform"
              >
                <IconEdit size={14} />
              </button>
              <button
                onClick={() => onToggle(item.id, 'is_archived', !item.is_archived)}
                aria-label={item.is_archived ? 'Unarchive' : 'Archive'}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] active:scale-90 transition-transform"
              >
                <IconArchive size={14} />
              </button>
              <button
                onClick={() => onDelete?.(item.id)}
                aria-label="Delete item"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 active:scale-90 transition-transform"
              >
                <IconTrash size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </Glass>
  )
}
