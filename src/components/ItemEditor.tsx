'use client'

import { useEffect, useRef, useState } from 'react'
import type { Category, ClipItem, Collection, ItemType } from '@/lib/types'
import { Glass } from './Glass'
import { TYPE_LABEL } from './itemMeta'
import type { ItemInput } from '@/lib/queries'

const TYPES: ItemType[] = ['text', 'link', 'snippet', 'shortcut', 'image', 'video', 'music']
const URL_TYPES: ItemType[] = ['link', 'image', 'video', 'music']

export function ItemEditor({
  item,
  categories,
  collections,
  onSave,
  onClose,
}: {
  item: ClipItem | null // null = creating new
  categories: Category[]
  collections: Collection[]
  onSave: (input: ItemInput) => Promise<void>
  onClose: () => void
}) {
  const [type, setType] = useState<ItemType>(item?.type ?? 'text')
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
    dialogRef.current?.querySelector<HTMLElement>('input, textarea, select')?.focus()
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
      setError('Content can’t be empty.')
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-6" role="dialog" aria-modal>
      <Glass
        strong
        className="w-full sm:max-w-lg max-h-[90dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-6 animate-rise-in"
      >
        <div ref={dialogRef}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{item ? 'Edit item' : 'New item'}</h2>
            <button onClick={onClose} aria-label="Close" className="rounded-lg px-2 py-1 hover:bg-white/10">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-white/60 mb-1.5">Type</label>
              <div className="flex flex-wrap gap-1.5">
                {TYPES.map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setType(t)}
                    aria-pressed={type === t}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      type === t
                        ? 'bg-sky-400/20 border-sky-400/50 text-sky-100'
                        : 'border-white/15 text-white/60 hover:bg-white/5'
                    }`}
                  >
                    {TYPE_LABEL[t]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="title" className="block text-xs text-white/60 mb-1.5">Title</label>
              <input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Optional label"
                className="w-full rounded-xl bg-black/30 border border-white/15 px-3 py-2 text-sm outline-none focus-visible:border-sky-400/60"
              />
            </div>

            {URL_TYPES.includes(type) ? (
              <div>
                <label htmlFor="url" className="block text-xs text-white/60 mb-1.5">URL</label>
                <input
                  id="url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://…"
                  className="w-full rounded-xl bg-black/30 border border-white/15 px-3 py-2 text-sm outline-none focus-visible:border-sky-400/60"
                />
              </div>
            ) : null}

            <div>
              <label htmlFor="content" className="block text-xs text-white/60 mb-1.5">
                {type === 'snippet' ? 'Code' : type === 'shortcut' ? 'Command' : URL_TYPES.includes(type) ? 'Notes (optional)' : 'Content'}
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={type === 'snippet' ? 8 : 4}
                className={`w-full rounded-xl bg-black/30 border border-white/15 px-3 py-2 text-sm outline-none focus-visible:border-sky-400/60 ${type === 'snippet' ? 'font-mono' : ''}`}
              />
            </div>

            {type === 'snippet' && (
              <div>
                <label htmlFor="language" className="block text-xs text-white/60 mb-1.5">Language (optional)</label>
                <input
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  placeholder="ts, python, bash…"
                  className="w-full rounded-xl bg-black/30 border border-white/15 px-3 py-2 text-sm outline-none focus-visible:border-sky-400/60"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="category" className="block text-xs text-white/60 mb-1.5">Category</label>
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-xl bg-black/30 border border-white/15 px-3 py-2 text-sm outline-none focus-visible:border-sky-400/60"
                >
                  <option value="">None</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="collection" className="block text-xs text-white/60 mb-1.5">Collection</label>
                <select
                  id="collection"
                  value={collectionId}
                  onChange={(e) => setCollectionId(e.target.value)}
                  className="w-full rounded-xl bg-black/30 border border-white/15 px-3 py-2 text-sm outline-none focus-visible:border-sky-400/60"
                >
                  <option value="">None</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl px-4 py-2.5 text-sm border border-white/15 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 glass glass-interactive rounded-xl px-4 py-2.5 text-sm font-medium disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </Glass>
    </div>
  )
}
