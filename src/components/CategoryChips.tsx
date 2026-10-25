'use client'

import { useState } from 'react'
import type { Category } from '@/lib/types'

const PALETTE = ['#38bdf8', '#34d399', '#f472b6', '#a78bfa', '#fbbf24', '#fb923c']

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
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
      <div className="flex items-center gap-1.5 min-w-max">
        <Chip active={activeId === null} onClick={() => onSelect(null)} label="All Categories" />
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
          <form onSubmit={submit} className="flex items-center">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => !name && setAdding(false)}
              placeholder="Category name…"
              className="text-xs bg-slate-900 border border-sky-400/50 text-white rounded-full px-3 py-1.5 outline-none w-32 shadow-[0_0_15px_rgba(56,189,248,0.2)]"
            />
          </form>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="text-xs px-3 py-1.5 rounded-full border border-dashed border-white/20 text-white/50 hover:text-white/80 hover:border-white/40 active:scale-95 transition-all flex items-center gap-1"
          >
            <span className="text-sm leading-none">+</span> Category
          </button>
        )}
      </div>
    </div>
  )
}

function Chip({
  active,
  onClick,
  label,
  color,
}: {
  active: boolean
  onClick: () => void
  label: string
  color?: string
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`text-xs px-3.5 py-1.5 rounded-full border transition-all active:scale-95 flex items-center gap-1.5 ${
        active
          ? 'bg-sky-500/15 border-sky-400/50 text-sky-200 font-medium shadow-[0_0_15px_rgba(56,189,248,0.2)]'
          : 'border-white/10 text-white/60 hover:text-white/85 hover:bg-white/5'
      }`}
    >
      {color && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
      )}
      <span>{label}</span>
    </button>
  )
}
