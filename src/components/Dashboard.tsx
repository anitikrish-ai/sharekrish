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
    <div className="min-h-dvh max-w-3xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6 pb-28">
      {/* App Header */}
      <header className="flex items-center justify-between mb-5 pt-1">
        <div className="min-w-0 pr-2">
          <h1 className="text-base sm:text-lg font-semibold tracking-tight text-white/95 truncate">
            Cloud Clipboard
          </h1>
          <p className="text-[11px] sm:text-xs text-white/45 truncate">{userEmail}</p>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <button
            onClick={() => setShowCodes(true)}
            className="glass glass-interactive rounded-full px-3 py-1.5 sm:py-2 text-xs font-medium text-white/85"
          >
            Share
          </button>
          <button
            onClick={handleSignOut}
            className="rounded-full px-2.5 py-1.5 sm:py-2 text-xs text-white/45 hover:text-white/80 hover:bg-white/5 active:scale-95 transition-all"
          >
            Sign out
          </button>
        </div>
      </header>

      {syncError && (
        <Glass className="mb-4 px-3.5 py-2.5 text-xs text-amber-200 border-amber-300/25 bg-amber-500/10 animate-fade-in">
          {syncError}
        </Glass>
      )}

      {/* Quick Access */}
      <section className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[11px] uppercase tracking-wider font-semibold text-white/40">
            Quick Access
          </h2>
          <span className="text-[10px] text-white/35">Tap to copy</span>
        </div>
        <QuickGrid items={quickPool} />
      </section>

      {/* Search Input */}
      <section className="mb-3.5">
        <SearchBar value={search} onChange={setSearch} />
      </section>

      {/* Filter Tabs - horizontally scrollable without breaking on phone */}
      <section className="mb-3.5 overflow-x-auto no-scrollbar -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-1.5 min-w-max pb-0.5">
          {(['all', 'favorites', 'pinned', 'recent', 'archive'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`text-xs px-3 py-1.5 rounded-full border capitalize transition-all active:scale-95 ${
                filter === f
                  ? 'bg-sky-400/20 border-sky-400/40 text-sky-100 font-medium'
                  : 'border-white/10 text-white/55 hover:bg-white/5 hover:text-white/80'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      {/* Category Chips - mobile wrap */}
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

      {/* Collections Row */}
      {collections.length > 0 && (
        <section className="mb-4 flex flex-wrap items-center gap-1.5">
          {collections.map((c) => (
            <span
              key={c.id}
              className="text-[11px] px-2.5 py-1 rounded-full border border-white/10 text-white/45 bg-white/[0.02]"
            >
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

      {/* Main Items Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
        {visible.length === 0 ? (
          <Glass className="col-span-full p-8 text-center text-sm text-white/40">
            {search.trim() ? 'No items match your search.' : 'Nothing here yet. Tap + to add an item.'}
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

      {/* Floating Action Button (+) */}
      <button
        onClick={() => setEditing('new')}
        aria-label="Add new item"
        className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 sm:right-6 w-13 h-13 sm:w-14 sm:h-14 rounded-full text-2xl flex items-center justify-center shadow-xl active:scale-90 transition-transform z-40 bg-sky-500/25 text-sky-200 border border-sky-400/40 glass glass-strong"
      >
        +
      </button>

      {/* Item Editor Dialog / Bottom Sheet */}
      {editing && (
        <ItemEditor
          item={editing === 'new' ? null : editing}
          categories={categories}
          collections={collections}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}

      {/* Access Code Modal */}
      {showCodes && (
        <AccessCodePanel categories={categories} onClose={() => setShowCodes(false)} />
      )}
    </div>
  )
}
