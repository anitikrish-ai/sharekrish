'use client'

import { IconSearch, IconX } from './Icons'

export function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative group">
      <div className="glass flex items-center gap-3 px-3.5 py-2.5 transition-all group-focus-within:border-sky-400/50 group-focus-within:shadow-[0_0_25px_rgba(56,189,248,0.15)]">
        <IconSearch
          size={16}
          strokeWidth={2.2}
          className="text-sky-400/80 flex-shrink-0 transition-transform group-focus-within:scale-110"
        />

        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search clips, notes, links, snippets..."
          aria-label="Search clips"
          className="flex-1 bg-transparent outline-none text-base sm:text-sm text-white placeholder:text-white/35 font-normal"
        />

        {value.trim() && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Clear search"
            className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <IconX size={12} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  )
}
