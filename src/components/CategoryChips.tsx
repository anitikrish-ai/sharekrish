'use client'

import { useState } from 'react'
import type { Category } from '@/lib/types'

const PALETTE = ['#7dd3fc', '#5eead4', '#fda4af', '#86efac', '#fde047', '#fdba74']

export function CategoryChips({
  categories,
  activeId,
  onSelect,
  onCreate,
}: {
  categories: Category[]
  activeId: string | null
  onSelect: (id: string | null) => void
  onCreate: (name: string, color: string) => Promise<void>
}) {
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    const color = PALETTE[categories.length % PALETTE.length]
    await onCreate(name.trim(), color)
    setName('')
    setAdding(false)
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Chip active={activeId === null} onClick={() => onSelect(null)} label="All" />
      {categories.map((c) => (
        <Chip
          key={c.id}
          active={activeId === c.id}
          onClick={() => onSelect(c.id)}
          label={c.name}
          color={c.color}
        />
      ))}

      {adding ? (
        <form onSubmit={submit} className="flex items-center gap-1">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => !name && setAdding(false)}
            placeholder="Category name"
            className="text-xs bg-black/30 border border-white/15 rounded-full px-3 py-1.5 outline-none focus-visible:border-sky-400/60 w-28"
          />
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="text-xs px-3 py-1.5 rounded-full border border-dashed border-white/20 text-white/50 hover:bg-white/5"
        >
          + Category
        </button>
      )}
    </div>
  )
}

function Chip({ active, onClick, label, color }: { active: boolean; onClick: () => void; label: string; color?: string }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className="text-xs px-3 py-1.5 rounded-full border transition-colors"
      style={
        active
          ? { background: (color ?? '#7dd3fc') + '26', borderColor: (color ?? '#7dd3fc') + '70', color: color ?? '#bae6fd' }
          : { borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)' }
      }
    >
      {label}
    </button>
  )
}
