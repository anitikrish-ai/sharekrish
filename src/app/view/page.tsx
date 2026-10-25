'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Category, ClipItem } from '@/lib/types'
import { Glass } from '@/components/Glass'
import { ItemCard } from '@/components/ItemCard'
import { SearchBar } from '@/components/SearchBar'
import { IconClipboard, IconClock } from '@/components/Icons'

type ViewState =
  | { status: 'enter-code' }
  | { status: 'loading' }
  | { status: 'active'; items: ClipItem[]; categories: Category[]; expiresAt: number }
  | { status: 'error'; message: string }

export default function GuestViewPage() {
  const [state, setState] = useState<ViewState>({ status: 'enter-code' })
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  const [, forceTick] = useState(0)

  const loadData = useCallback(async () => {
    const res = await fetch('/api/guest/data')
    const data = await res.json()
    if (!res.ok) {
      setState({ status: 'error', message: data.error ?? 'Your session has ended.' })
      return
    }
    setState({ status: 'active', items: data.items, categories: data.categories, expiresAt: data.expiresAt })
  }, [])

  // On load, try the existing guest cookie before asking for a code again —
  // this is what makes the 30-minute guest session actually useful instead
  // of re-prompting on every page refresh.
  useEffect(() => {
    setState({ status: 'loading' })
    loadData().catch(() => setState({ status: 'enter-code' }))
  }, [loadData])

  useEffect(() => {
    if (state.status !== 'active') return
    const id = setInterval(() => {
      forceTick((n) => n + 1)
      if (Date.now() > state.expiresAt) {
        setState({ status: 'error', message: 'Your access has expired.' })
      }
    }, 1000)
    return () => clearInterval(id)
  }, [state])

  async function submitCode(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const res = await fetch('/api/guest/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.trim() }),
    })
    const data = await res.json()
    setSubmitting(false)
    if (!res.ok) {
      setState({ status: 'error', message: data.error ?? 'That code is invalid or has expired.' })
      return
    }
    setState({ status: 'loading' })
    loadData()
  }

  if (state.status === 'enter-code' || state.status === 'error') {
    return (
      <main className="min-h-dvh flex items-center justify-center p-6">
        <Glass strong className="w-full max-w-sm p-8 animate-rise-in">
          <h1 className="text-xl font-semibold tracking-tight mb-1">Shared clipboard</h1>
          <p className="text-sm text-white/60 mb-6">Enter the access code you were given.</p>

          {state.status === 'error' && (
            <p role="alert" className="text-sm text-rose-300 bg-rose-500/10 border border-rose-400/20 rounded-xl p-3 mb-4">
              {state.message}
            </p>
          )}

          <form onSubmit={submitCode} className="space-y-3">
            <label htmlFor="code" className="sr-only">Access code</label>
            <input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              placeholder="123456"
              maxLength={12}
              className="w-full text-center tracking-[0.3em] font-mono text-lg rounded-xl bg-black/30 border border-white/15 px-4 py-3 outline-none focus-visible:border-sky-400/60"
            />
            <button
              type="submit"
              disabled={submitting || !code.trim()}
              className="glass glass-interactive w-full rounded-xl px-4 py-3 text-sm font-medium disabled:opacity-50"
            >
              {submitting ? 'Checking…' : 'View clipboard'}
            </button>
          </form>
        </Glass>
      </main>
    )
  }

  if (state.status === 'loading') {
    return (
      <main className="min-h-dvh flex items-center justify-center">
        <p className="text-sm text-white/50">Loading…</p>
      </main>
    )
  }

  const categoryById = new Map(state.categories.map((c) => [c.id, c]))
  const msLeft = state.expiresAt - Date.now()
  const minsLeft = Math.max(0, Math.floor(msLeft / 60000))
  const secsLeft = Math.max(0, Math.floor((msLeft % 60000) / 1000))

  const visible = search.trim()
    ? state.items.filter((i) => {
        const q = search.toLowerCase()
        return i.title.toLowerCase().includes(q) || i.content.toLowerCase().includes(q) || (i.url ?? '').toLowerCase().includes(q)
      })
    : state.items

  return (
    <div className="min-h-dvh max-w-3xl mx-auto px-4 sm:px-6 py-5 sm:py-7 pb-16">
      <header className="flex items-center justify-between mb-6 pt-1">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-400 via-sky-500 to-teal-400 p-[1px] shadow-[0_0_15px_rgba(56,189,248,0.3)] flex-shrink-0">
            <div className="w-full h-full rounded-xl bg-[#090d16] flex items-center justify-center">
              <IconClipboard size={18} className="text-sky-400" strokeWidth={2.2} />
            </div>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white">Shared Clipboard</h1>
            <p className="text-[11px] text-slate-400">Guest Read-Only Access</p>
          </div>
        </div>
        <Glass className="px-3 py-1.5 text-xs text-sky-200 border-sky-400/30 bg-sky-500/10 font-medium flex items-center gap-1.5">
          <IconClock size={13} className="text-sky-300" />
          <span>{minsLeft}m {secsLeft}s left</span>
        </Glass>
      </header>

      <section className="mb-4">
        <SearchBar value={search} onChange={setSearch} />
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
        {visible.length === 0 ? (
          <Glass className="col-span-full p-8 text-center text-sm text-white/45">Nothing shared here.</Glass>
        ) : (
          visible.map((item) => (
            <ItemCard key={item.id} item={item} category={item.category_id ? categoryById.get(item.category_id) : undefined} readOnly />
          ))
        )}
      </section>
    </div>
  )
}
