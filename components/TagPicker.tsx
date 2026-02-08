"use client"

import { useState, useMemo, useRef, useEffect } from 'react'

type Option = { key: string; label: string }

export default function TagPicker({
  value,
  onChange,
  options = [],
  placeholder = 'Filter by tags (comma-separated) e.g. react, python, machine_learning',
  maxSuggestions = 200,
}: {
  value: string[]
  onChange: (v: string[]) => void
  options?: Option[]
  placeholder?: string
  maxSuggestions?: number
}) {
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options.slice(0, maxSuggestions)
    return options.filter(o => o.label.toLowerCase().includes(q) || o.key.toLowerCase().includes(q)).slice(0, maxSuggestions)
  }, [query, options, maxSuggestions])

  function toggleTag(key: string) {
    if (value.includes(key)) onChange(value.filter(v => v !== key))
    else onChange([...value, key])
  }

  return (
    <div className="w-full">
      <div className="border rounded-lg px-3 py-2 flex flex-col" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-wrap gap-2 items-center">
            {value.length === 0 ? (
              <div className="text-sm text-[var(--text-muted)]">No tags selected</div>
            ) : (
              value.map(tag => (
                <div key={tag} className="px-3 py-1 rounded-full bg-primary/20 text-sm flex items-center gap-2">
                  <span>{(options.find(o => o.key === tag)?.label || tag).replace(/_/g, ' ')}</span>
                  <button type="button" onClick={() => toggleTag(tag)} className="opacity-80">✕</button>
                </div>
              ))
            )}
          </div>
          <button type="button" onClick={() => setExpanded(s => !s)} className="ml-3 text-sm opacity-80">
            {expanded ? 'Hide tags' : 'Show tags'}
          </button>
        </div>

        {expanded && (
          <div>
            <div className="mb-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded px-2 py-1 bg-transparent outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-2 max-h-56 overflow-auto">
              {filtered.map(opt => {
                const selected = value.includes(opt.key)
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => toggleTag(opt.key)}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${selected ? 'bg-primary text-black' : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:opacity-90'}`}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
