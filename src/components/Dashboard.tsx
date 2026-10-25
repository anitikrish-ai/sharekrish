'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Category, ClipItem, Collection } from '@/lib/types'
import {
  createCategory, createCollection, createItem, deleteItem, toggleField, updateItem,
} from '@/lib/queries'
import type { ItemInput } from '@/lib/queries'
import { Glass } from './Glass'
import { QuickGrid } from './QuickGrid'
import { ItemCard } from './ItemCard'
import { ItemEditor } from './ItemEditor'
import { SearchBar } from './SearchBar'
import { CategoryChips } from './CategoryChips'
import { AccessCodePanel } from './AccessCodePanel'
import { NewCollectionButton } from './NewCollectionButton'

type Filter = 'all' | 'favorites' | 'pinned' | 'recent' | 'archive'

export function Dashboard({
  userId,
  userEmail,
  initialItems,
  initialCategories,
  initialCollections,
}: {
  userId: string
  userEmail: string
  initialItems: ClipItem[]
  initialCategories: Category[]
  initialCollections: Collection[]
}) {
  const supabase = useMemo(() => createClient(), [])
  const [items, setItems] = useState(initialItems)
  const [categories, setCategories] = useState(initialCategories)
  const [collections, setCollections] = useState(initialCollections)
  const [filter, setFilter] = useState<Filter>('all')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<ClipItem | 'new' | null>(null)
  const [showCodes, setShowCodes] = useState(false)
  const [syncError, setSyncError] = useState('')

  // Realtime: every item change (from this device or the other trusted
  // phone) is pushed in, so both stay in sync without polling. Scoped by
  // RLS already — `filter: user_id=eq.${userId}` just avoids subscribing
  // to postgres_changes noise for rows we couldn't read anyway.
  useEffect(() => {
    const channel = supabase
      .channel('items-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'items', filter: `user_id=eq.${userId}` },
        (payload) => {
          setItems((prev) => {
            if (payload.eventType === 'DELETE') {
              return prev.filter((i) => i.id !== (payload.old as ClipItem).id)
            }
            const next = payload.new as ClipItem
            const exists = prev.some((i) => i.id === next.id)
            return exists ? prev.map((i) => (i.id === next.id ? next : i)) : [next, ...prev]
          })
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setSyncError('Live sync is unavailable right now — changes still save, but the other device may not update instantly.')
        } else if (status === 'SUBSCRIBED') {
          setSyncError('')
        }
      })

    return () => { supabase.removeChannel(channel) }
  }, [supabase, userId])

  const visible = useMemo(() => {
    let list = items
    if (filter === 'archive') {
      list = list.filter((i) => i.is_archived)
    } else {
      list = list.filter((i) => !i.is_archived)
      if (filter === 'favorites') list = list.filter((i) => i.is_favorite)
      if (filter === 'pinned') list = list.filter((i) => i.is_pinned)
      if (filter === 'recent') {
        list = [...list].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)).slice(0, 20)
      }
    }
    if (categoryId) list = list.filter((i) => i.category_id === categoryId)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.content.toLowerCase().includes(q) ||
          (i.url ?? '').toLowerCase().includes(q)
      )
    }
    return list
  }, [items, filter, categoryId, search])

  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])

  const handleSave = useCallback(async (input: ItemInput) => {
    if (editing && editing !== 'new') {
      const updated = await updateItem(supabase, editing.id, input)
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
    } else {
      const created = await createItem(supabase, userId, input)
      setItems((prev) => [created, ...prev])
    }
  }, [editing, supabase, userId])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Delete this item? This can’t be undone.')) return
    setItems((prev) => prev.filter((i) => i.id !== id)) // optimistic
    try {
      await deleteItem(supabase, id)
    } catch {
      setSyncError('Could not delete that item — it may already be gone.')
    }
  }, [supabase])

  const handleToggle = useCallback(async (id: string, field: 'is_favorite' | 'is_pinned' | 'is_archived', value: boolean) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i))) // optimistic
    try {
      await toggleField(supabase, id, field, value)
    } catch {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: !value } : i))) // revert
      setSyncError('That change didn’t save — check your connection.')
    }
  }, [supabase])

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const quickPool = useMemo(() => items.filter((i) => !i.is_archived), [items])

  return (
    <div className="min-h-dvh max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-28">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Cloud Clipboard</h1>
          <p className="text-xs text-white/45">{userEmail}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCodes(true)}
            className="glass glass-interactive rounded-full px-3 py-2 text-xs"
          >
            Share
          </button>
          <button
            onClick={handleSignOut}
            className="rounded-full px-3 py-2 text-xs text-white/50 hover:bg-white/5"
          >
            Sign out
          </button>
        </div>
      </header>

      {syncError && (
        <Glass className="mb-4 px-3 py-2 text-xs text-amber-200 border-amber-300/20">{syncError}</Glass>
      )}

      <section className="mb-6">
        <h2 className="text-xs uppercase tracking-wide text-white/40 mb-2">Quick access</h2>
        <QuickGrid items={quickPool} />
      </section>

      <section className="mb-4">
        <SearchBar value={search} onChange={setSearch} />
      </section>

      <section className="mb-4 flex flex-wrap items-center gap-2">
        {(['all', 'favorites', 'pinned', 'recent', 'archive'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`text-xs px-3 py-1.5 rounded-full border capitalize ${
              filter === f ? 'bg-white/15 border-white/30' : 'border-white/15 text-white/55 hover:bg-white/5'
            }`}
          >
            {f}
          </button>
        ))}
      </section>

      <section className="mb-2">
        <CategoryChips
          categories={categories}
          activeId={categoryId}
          onSelect={setCategoryId}
          onCreate={async (name, color) => {
            const c = await createCategory(supabase, userId, name, color)
            setCategories((prev) => [...prev, c])
          }}
        />
      </section>

      {collections.length > 0 && (
        <section className="mb-5 flex flex-wrap gap-1.5">
          {collections.map((c) => (
            <span key={c.id} className="text-[11px] px-2.5 py-1 rounded-full border border-white/10 text-white/45">
              {c.name}
            </span>
          ))}
          <NewCollectionButton
            onCreate={async (name) => {
              const c = await createCollection(supabase, userId, name)
              setCollections((prev) => [...prev, c])
            }}
          />
        </section>
      )}
      {collections.length === 0 && (
        <section className="mb-5">
          <NewCollectionButton
            onCreate={async (name) => {
              const c = await createCollection(supabase, userId, name)
              setCollections((prev) => [...prev, c])
            }}
          />
        </section>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {visible.length === 0 ? (
          <Glass className="col-span-full p-8 text-center text-sm text-white/45">
            Nothing here yet.
          </Glass>
        ) : (
          visible.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              category={item.category_id ? categoryById.get(item.category_id) : undefined}
              onEdit={setEditing}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          ))
        )}
      </section>

      <button
        onClick={() => setEditing('new')}
        aria-label="Add new item"
        className="glass glass-strong glass-interactive fixed bottom-6 right-6 w-14 h-14 rounded-full text-2xl flex items-center justify-center shadow-glass"
      >
        +
      </button>

      {editing && (
        <ItemEditor
          item={editing === 'new' ? null : editing}
          categories={categories}
          collections={collections}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}

      {showCodes && (
        <AccessCodePanel categories={categories} onClose={() => setShowCodes(false)} />
      )}
    </div>
  )
}
