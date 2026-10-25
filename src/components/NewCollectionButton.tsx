'use client'

import { useState } from 'react'
import { IconPlus } from './Icons'

export function NewCollectionButton({ onCreate }: { onCreate: (name: string) => Promise<void> }) {
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || saving) return
    setSaving(true)
    try {
      await onCreate(name.trim())
      setName('')
      setAdding(false)
    } finally {
      setSaving(false)
    }
  }

  if (!adding) {
    return (
      <button
        onClick={() => setAdding(true)}
        className="text-[11px] px-2.5 py-1 rounded-xl border border-dashed border-white/20 text-slate-400 hover:text-white hover:border-white/40 active:scale-95 transition-all inline-flex items-center gap-1"
      >
        <IconPlus size={11} strokeWidth={2.5} />
        <span>Collection</span>
      </button>
    )
  }

  return (
    <form onSubmit={submit} className="inline-flex">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => !name && setAdding(false)}
        placeholder="Collection name…"
        className="text-[11px] bg-slate-900 border border-sky-400/50 text-white rounded-xl px-2.5 py-1 outline-none w-28 shadow-[0_0_15px_rgba(56,189,248,0.2)]"
      />
    </form>
  )
}
