'use client'

import { useEffect, useRef, useState } from 'react'
import type { Category, ClipItem, Collection, ItemType } from '@/lib/types'
import { Glass } from './Glass'
import { TYPE_LABEL } from './itemMeta'
import type { ItemInput } from '@/lib/queries'
import { IconX } from './Icons'

const TYPES: ItemType[] = ['text', 'link', 'snippet', 'shortcut', 'image', 'video', 'music']
const URL_TYPES: ItemType[] = ['link', 'image', 'video', 'music']

export function ItemEditor({
  item,
  initialType = 'text',
  categories,
  collections,
  onSave,
  onClose,
}: {
  item: ClipItem | null
  initialType?: ItemType
  categories: Category[]
  collections: Collection[]
  onSave: (input: ItemInput) => Promise<void>
  onClose: () => void
}) {
  const [type, setType] = useState<ItemType>(item?.type ?? initialType)
  const [title, setTitle] = useState(item?.title ?? '')
  const [content, setContent] = useState(item?.content ?? '')
  const [url, setUrl] = useState(item?.url ?? '')
  const [language, setLanguage] = useState(item?.language ?? '')
  const [categoryId, setCategoryId] = useState(item?.category_id ?? '')
  const [collectionId, setCollectionId] = useState(item?.collection_id ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (URL_TYPES.includes(type) && !url.trim()) {
      setError('This type needs a URL.')
      return
    }
    if (!URL_TYPES.includes(type) && !content.trim()) {
      setError('Content cannot be empty.')
      return
    }
    setSaving(true)
    try {
      await onSave({
        type,
        title: title.trim(),
        content: content.trim(),
        url: url.trim() || null,
        language: type === 'snippet' ? language.trim() || null : null,
        category_id: categoryId || null,
        collection_id: collectionId || null,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this item.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in"
      role="dialog"
      aria-modal
    >
      <Glass
        strong
        className="w-full sm:max-w-lg max-h-[88dvh] overflow-y-auto rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 animate-sheet-up sm:animate-scale-pop shadow-2xl border-white/20 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        <div ref={dialogRef}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-white/95">
              {item ? 'Edit item' : 'New item'}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 active:scale-90 transition-all"
            >
              <IconX size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Type selector */}
            <div>
              <label className="block text-[11px] font-medium text-white/60 mb-1.5 uppercase tracking-wider">
                Type
              </label>
              <div className="flex flex-wrap gap-1.5">
                {TYPES.map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setType(t)}
                    aria-pressed={type === t}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all active:scale-95 ${
                      type === t
                        ? 'bg-sky-400/25 border-sky-400/60 text-sky-100 font-medium'
                        : 'border-white/10 text-white/60 hover:bg-white/5'
                    }`}
                  >
                    {TYPE_LABEL[t]}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-[11px] font-medium text-white/60 mb-1">
                Title
              </label>
              <input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Optional label"
                className="w-full rounded-xl bg-black/40 border border-white/15 px-3.5 py-2.5 text-base sm:text-sm outline-none focus-visible:border-sky-400/70 placeholder:text-white/30"
              />
            </div>

            {/* URL */}
            {URL_TYPES.includes(type) ? (
              <div>
                <label htmlFor="url" className="block text-[11px] font-medium text-white/60 mb-1">
                  URL
                </label>
                <input
                  id="url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://…"
                  className="w-full rounded-xl bg-black/40 border border-white/15 px-3.5 py-2.5 text-base sm:text-sm outline-none focus-visible:border-sky-400/70 placeholder:text-white/30"
                />
              </div>
            ) : null}

            {/* Content textarea */}
            <div>
              <label htmlFor="content" className="block text-[11px] font-medium text-white/60 mb-1">
                {type === 'snippet'
                  ? 'Code snippet'
                  : type === 'shortcut'
                  ? 'Command'
                  : URL_TYPES.includes(type)
                  ? 'Notes (optional)'
                  : 'Content'}
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={type === 'snippet' ? 6 : 3}
                placeholder="Enter text, link or snippet..."
                className={`w-full rounded-xl bg-black/40 border border-white/15 px-3.5 py-2.5 text-base sm:text-sm outline-none focus-visible:border-sky-400/70 placeholder:text-white/30 ${
                  type === 'snippet' ? 'font-mono text-xs' : ''
                }`}
              />
            </div>

            {/* Snippet Language */}
            {type === 'snippet' && (
              <div>
                <label htmlFor="language" className="block text-[11px] font-medium text-white/60 mb-1">
                  Language hint
                </label>
                <input
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  placeholder="ts, python, bash, json…"
                  className="w-full rounded-xl bg-black/40 border border-white/15 px-3.5 py-2 text-base sm:text-sm outline-none focus-visible:border-sky-400/70 placeholder:text-white/30"
                />
              </div>
            )}

            {/* Category and Collection */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label htmlFor="category" className="block text-[11px] font-medium text-white/60 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-xl bg-black/40 border border-white/15 px-3 py-2 text-base sm:text-sm outline-none focus-visible:border-sky-400/70"
                >
                  <option value="" className="bg-slate-900">None</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="collection" className="block text-[11px] font-medium text-white/60 mb-1">
                  Collection
                </label>
                <select
                  id="collection"
                  value={collectionId}
                  onChange={(e) => setCollectionId(e.target.value)}
                  className="w-full rounded-xl bg-black/40 border border-white/15 px-3 py-2 text-base sm:text-sm outline-none focus-visible:border-sky-400/70"
                >
                  <option value="" className="bg-slate-900">None</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <p role="alert" className="text-xs text-rose-300 bg-rose-500/10 border border-rose-400/20 rounded-lg p-2.5">
                {error}
              </p>
            )}

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl px-4 py-2.5 text-xs sm:text-sm border border-white/15 text-white/70 hover:bg-white/5 active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 glass glass-interactive rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-sky-100 bg-sky-500/20 border-sky-400/40 active:scale-95 transition-all disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save item'}
              </button>
            </div>
          </form>
        </div>
      </Glass>
    </div>
  )
}
