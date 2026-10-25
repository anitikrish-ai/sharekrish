'use client'

export function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="glass rounded-xl flex items-center gap-2 px-3 py-2.5">
      <span aria-hidden className="text-white/40">⌕</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search your clipboard…"
        aria-label="Search items"
        className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/35"
      />
    </div>
  )
}
