'use client'

import { useEffect, useState } from 'react'
import type { AccessCode, Category } from '@/lib/types'
import { Glass } from './Glass'

function timeLeft(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now()
  if (ms <= 0) return 'expired'
  const mins = Math.floor(ms / 60000)
  const secs = Math.floor((ms % 60000) / 1000)
  return mins > 0 ? `${mins}m ${secs}s left` : `${secs}s left`
}

export function AccessCodePanel({ categories, onClose }: { categories: Category[]; onClose: () => void }) {
  const [codes, setCodes] = useState<AccessCode[]>([])
  const [loading, setLoading] = useState(true)
  const [ttl, setTtl] = useState(5)
  const [maxSessions, setMaxSessions] = useState(1)
  const [restrictCategories, setRestrictCategories] = useState<string[]>([])
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [, forceTick] = useState(0)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/access-codes')
    const data = await res.json()
    if (res.ok) setCodes(data.codes)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  // re-render every second so "time left" counts down live
  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [])

  async function createCode(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setError('')
    const res = await fetch('/api/access-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ttlMinutes: ttl,
        maxSessions,
        categoryIds: restrictCategories.length ? restrictCategories : null,
      }),
    })
    const data = await res.json()
    setCreating(false)
    if (!res.ok) {
      setError(data.error ?? 'Could not create code.')
      return
    }
    setCodes((prev) => [data.accessCode, ...prev])
  }

  async function revoke(id: string) {
    await fetch(`/api/access-codes?id=${id}`, { method: 'DELETE' })
    setCodes((prev) => prev.map((c) => (c.id === id ? { ...c, revoked: true } : c)))
  }

  function toggleCategory(id: string) {
    setRestrictCategories((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in" role="dialog" aria-modal>
      <Glass strong className="w-full sm:max-w-lg max-h-[88dvh] overflow-y-auto rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 animate-sheet-up sm:animate-scale-pop shadow-2xl border-white/20 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
          <h2 className="text-base sm:text-lg font-semibold tracking-tight text-white/95">Guest access</h2>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 active:scale-90 transition-all">✕</button>
        </div>

        <form onSubmit={createCode} className="space-y-3 mb-6">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="ttl" className="block text-xs text-white/60 mb-1.5">Expires after (minutes)</label>
              <input
                id="ttl"
                type="number"
                min={1}
                max={120}
                value={ttl}
                onChange={(e) => setTtl(Number(e.target.value))}
                className="w-full rounded-xl bg-black/30 border border-white/15 px-3 py-2 text-base sm:text-sm outline-none focus-visible:border-sky-400/60"
              />
            </div>
            <div>
              <label htmlFor="sessions" className="block text-xs text-white/60 mb-1.5">Max devices</label>
              <input
                id="sessions"
                type="number"
                min={1}
                max={10}
                value={maxSessions}
                onChange={(e) => setMaxSessions(Number(e.target.value))}
                className="w-full rounded-xl bg-black/30 border border-white/15 px-3 py-2 text-base sm:text-sm outline-none focus-visible:border-sky-400/60"
              />
            </div>
          </div>

          {categories.length > 0 && (
            <div>
              <span className="block text-xs text-white/60 mb-1.5">Limit to categories (optional)</span>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => toggleCategory(c.id)}
                    aria-pressed={restrictCategories.includes(c.id)}
                    className={`text-xs px-3 py-1.5 rounded-full border ${
                      restrictCategories.includes(c.id)
                        ? 'bg-sky-400/20 border-sky-400/50 text-sky-100'
                        : 'border-white/15 text-white/60'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}

          <button
            type="submit"
            disabled={creating}
            className="w-full glass glass-interactive rounded-xl px-4 py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {creating ? 'Generating…' : 'Generate code'}
          </button>
        </form>

        <h3 className="text-xs uppercase tracking-wide text-white/40 mb-2">Recent codes</h3>
        {loading ? (
          <p className="text-sm text-white/50">Loading…</p>
        ) : codes.length === 0 ? (
          <p className="text-sm text-white/50">No codes generated yet.</p>
        ) : (
          <ul className="space-y-2">
            {codes.map((c) => {
              const expired = new Date(c.expires_at).getTime() < Date.now()
              const dead = c.revoked || expired || c.sessions_used >= c.max_sessions
              return (
                <li key={c.id} className="glass rounded-xl px-3 py-2.5 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-mono text-base tracking-[0.2em]">{c.code}</div>
                    <div className="text-[11px] text-white/50">
                      {c.revoked ? 'Revoked' : expired ? 'Expired' : `${timeLeft(c.expires_at)} · ${c.sessions_used}/${c.max_sessions} used`}
                      {c.category_ids?.length ? ' · category-limited' : ''}
                    </div>
                  </div>
                  {!dead && (
                    <button
                      onClick={() => revoke(c.id)}
                      className="text-xs px-3 py-1.5 rounded-full border border-rose-400/40 text-rose-300 hover:bg-rose-500/10"
                    >
                      Revoke
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </Glass>
    </div>
  )
}
