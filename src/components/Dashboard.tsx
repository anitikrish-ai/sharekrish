'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Category, ClipItem, Collection, ItemType } from '@/lib/types'
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
import {
  IconClipboard,
  IconShare,
  IconLogOut,
  IconZap,
  IconGlobe,
  IconStar,
  IconPin,
  IconClock,
  IconArchive,
  IconSparkles,
  IconPlus,
  IconAlertCircle,
  IconFolder,
} from './Icons'

type Filter = 'all' | 'favorites' | 'pinned' | 'recent' | 'archive'

const FILTER_CONFIG: { id: Filter; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: 'all', label: 'All', icon: IconGlobe },
  { id: 'favorites', label: 'Favorites', icon: IconStar },
  { id: 'pinned', label: 'Pinned', icon: IconPin },
  { id: 'recent', label: 'Recent', icon: IconClock },
  { id: 'archive', label: 'Archive', icon: IconArchive },
]

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
  const [editingType, setEditingType] = useState<ItemType>('text')
  const [showCodes, setShowCodes] = useState(false)
  const [syncError, setSyncError] = useState('')

  // Supabase Realtime Sync
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
          setSyncError('Live sync is temporarily offline — changes will save, but other devices may need a refresh.')
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
    if (!confirm('Delete this item? This cannot be undone.')) return
    setItems((prev) => prev.filter((i) => i.id !== id))
    try {
      await deleteItem(supabase, id)
    } catch {
      setSyncError('Could not delete that item — check your connection.')
    }
  }, [supabase])

  const handleToggle = useCallback(async (id: string, field: 'is_favorite' | 'is_pinned' | 'is_archived', value: boolean) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)))
    try {
      await toggleField(supabase, id, field, value)
    } catch {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: !value } : i)))
      setSyncError('That change did not save — check your connection.')
    }
  }, [supabase])

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const quickPool = useMemo(() => items.filter((i) => !i.is_archived), [items])

  function openNewItem(type: ItemType = 'text') {
    setEditingType(type)
    setEditing('new')
  }

  return (
    <div className="min-h-dvh max-w-3xl mx-auto px-4 sm:px-6 py-5 sm:py-7 pb-28">
      {/* Brand Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 via-sky-500 to-teal-400 p-[1px] shadow-[0_0_20px_rgba(56,189,248,0.35)] flex-shrink-0">
            <div className="w-full h-full rounded-2xl bg-[#090d16] flex items-center justify-center text-sky-400">
              <IconClipboard size={20} strokeWidth={2.2} />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                Cloud Clipboard
              </h1>
              <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Synced
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[190px] sm:max-w-none">
              {userEmail}
            </p>
          </div>
        </div>

        {/* Top actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setShowCodes(true)}
            className="glass glass-interactive rounded-xl px-3.5 py-1.5 text-xs font-semibold text-slate-200 border-white/[0.1] hover:border-sky-400/40 flex items-center gap-1.5 shadow-sm"
          >
            <IconShare size={13} className="text-sky-400" />
            <span>Share</span>
          </button>
          <button
            onClick={handleSignOut}
            aria-label="Sign out"
            className="rounded-xl px-2.5 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-white/[0.06] active:scale-95 transition-all flex items-center gap-1.5"
          >
            <IconLogOut size={13} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      {/* Sync Error Notice */}
      {syncError && (
        <Glass className="mb-5 px-4 py-3 text-xs text-amber-200 border-amber-400/30 bg-amber-500/10 animate-fade-in flex items-center gap-2">
          <IconAlertCircle size={15} className="text-amber-400 flex-shrink-0" />
          <span>{syncError}</span>
        </Glass>
      )}

      {/* Quick Access Section */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-[11px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
            <IconZap size={13} className="text-amber-400" />
            <span>Quick Access</span>
          </h2>
          <span className="text-[11px] text-slate-500">Tap tile to copy</span>
        </div>
        <QuickGrid items={quickPool} onQuickCreate={openNewItem} />
      </section>

      {/* Search Bar */}
      <section className="mb-4">
        <SearchBar value={search} onChange={setSearch} />
      </section>

      {/* Filter Segmented Control */}
      <section className="mb-4 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-1.5 min-w-max pb-0.5">
          {FILTER_CONFIG.map(({ id, label, icon: IconComponent }) => {
            const isActive = filter === id
            return (
              <button
                key={id}
                onClick={() => setFilter(id)}
                aria-pressed={isActive}
                className={`text-xs px-3.5 py-2 rounded-xl border transition-all active:scale-95 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-sky-500/20 border-sky-400/50 text-sky-100 font-semibold shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                    : 'glass text-slate-400 hover:text-white hover:border-white/[0.18]'
                }`}
              >
                <IconComponent size={13} className={isActive ? 'text-sky-300' : 'text-slate-400'} />
                <span>{label}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Category Chips Bar */}
      <section className="mb-3">
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
        <section className="mb-5 flex flex-wrap items-center gap-1.5">
          {collections.map((c) => (
            <span
              key={c.id}
              className="text-[11px] px-2.5 py-1 rounded-xl border border-white/[0.08] text-slate-400 bg-white/[0.02] flex items-center gap-1.5"
            >
              <IconFolder size={12} className="text-slate-500" />
              <span>{c.name}</span>
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

      {/* Main Items Display / Empty State */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {visible.length === 0 ? (
          <div className="col-span-full">
            <div className="glass p-8 sm:p-10 text-center flex flex-col items-center justify-center gap-3 border-white/[0.08] relative overflow-hidden">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-400/20 flex items-center justify-center text-sky-400 mb-1 shadow-[0_0_30px_rgba(56,189,248,0.15)]">
                <IconSparkles size={26} strokeWidth={1.8} />
              </div>
              <h3 className="text-base font-semibold text-white">
                {search.trim() ? 'No matching items found' : 'Your clipboard is empty'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                {search.trim()
                  ? 'Try searching for a different keyword or clear your filter.'
                  : 'Start by adding your first note, link, snippet, or shortcut. It will sync instantly across all your devices.'}
              </p>
              {!search.trim() && (
                <button
                  type="button"
                  onClick={() => openNewItem('text')}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-teal-400 text-slate-950 font-bold text-xs shadow-[0_4px_20px_rgba(56,189,248,0.35)] active:scale-95 hover:brightness-110 transition-all flex items-center gap-1.5"
                >
                  <IconPlus size={14} strokeWidth={2.5} />
                  <span>Create Your First Clip</span>
                </button>
              )}
            </div>
          </div>
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

      {/* Prominent High-End Floating Action Button (+) */}
      <button
        onClick={() => openNewItem('text')}
        aria-label="Add new item"
        className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 sm:right-8 w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-400 via-sky-500 to-teal-400 text-slate-950 shadow-[0_10px_35px_rgba(56,189,248,0.55)] flex items-center justify-center active:scale-90 hover:scale-105 transition-all z-40 border border-white/30"
      >
        <IconPlus size={24} strokeWidth={2.8} />
      </button>

      {/* Item Editor Drawer/Modal */}
      {editing && (
        <ItemEditor
          item={editing === 'new' ? null : editing}
          initialType={editingType}
          categories={categories}
          collections={collections}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}

      {/* Access Code Panel */}
      {showCodes && (
        <AccessCodePanel categories={categories} onClose={() => setShowCodes(false)} />
      )}
    </div>
  )
}
