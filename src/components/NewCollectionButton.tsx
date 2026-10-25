'use client'

import { useState } from 'react'

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
        className="text-[11px] px-2.5 py-1 rounded-full border border-dashed border-white/20 text-white/45 hover:bg-white/5"
      >
        + Collection
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
        placeholder="Collection name"
        className="text-[11px] bg-black/30 border border-white/15 rounded-full px-2.5 py-1 outline-none focus-visible:border-sky-400/60 w-28"
      />
    </form>
  )
}
