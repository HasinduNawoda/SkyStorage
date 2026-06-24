// FileSearchBar.tsx
import React, { useState, useRef, useEffect, useCallback } from "react"

// ─── Types ──────────────────────────────────────────────────────────────────

export type FileSearchItem = {
  id: string
  name: string
  kind: "folder" | "file"
  domId: string
  locationLabel: string
  isDeleted: boolean
}

type FileSearchBarProps = {
  items: FileSearchItem[]
  onSelect: (item: FileSearchItem) => void
  placeholder?: string
  /** Outer wrapper classes – for positioning, width, etc. */
  className?: string
  /** Input element classes – must include padding, borders, colours, etc. */
  inputClassName?: string
}

// ─── Search logic (unchanged) ─────────────────────────────────────────────

function scoreItem(item: FileSearchItem, query: string): number {
  const q = query.toLowerCase().trim()
  if (!q) return 0
  const nameL = item.name.toLowerCase()
  const locationL = item.locationLabel.toLowerCase()

  if (nameL === q) return 100
  if (nameL.startsWith(q)) return 90
  if (nameL.includes(q)) return 75
  if (locationL.includes(q)) return 40
  return 0
}

function search(items: FileSearchItem[], query: string): FileSearchItem[] {
  if (!query.trim()) return []
  return items
    .map((item) => ({ item, score: scoreItem(item, query) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ item }) => item)
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const parts = text.split(new RegExp(`(${escaped})`, "gi"))
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-blue-100 text-blue-700 rounded-sm font-medium" style={{ padding: "0 1px" }}>
        {part}
      </mark>
    ) : (
      part
    )
  )
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function FileSearchBar({
  items,
  onSelect,
  placeholder = "Search files and folders…",
  className = "relative w-full",
  inputClassName = "",   // removed default styling – parent must provide
}: FileSearchBarProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<FileSearchItem[]>([])
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length === 0) {
      setResults([])
      setOpen(false)
      setActiveIndex(-1)
      return
    }
    const found = search(items, trimmed)
    setResults(found)
    setOpen(true)
    setActiveIndex(-1)
  }, [query, items])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  useEffect(() => {
    if (activeIndex >= 0 && dropdownRef.current) {
      const el = dropdownRef.current.querySelector(`[data-index="${activeIndex}"]`) as HTMLElement | null
      el?.scrollIntoView({ block: "nearest" })
    }
  }, [activeIndex])

  const handleSelect = useCallback(
    (item: FileSearchItem) => {
      onSelect(item)
      setQuery("")
      setOpen(false)
      setActiveIndex(-1)
      inputRef.current?.blur()
    },
    [onSelect]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || results.length === 0) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      const target = activeIndex >= 0 ? results[activeIndex] : results[0]
      if (target) handleSelect(target)
    } else if (e.key === "Escape") {
      setOpen(false)
      setActiveIndex(-1)
      inputRef.current?.blur()
    }
  }

  const folderResults = results.filter((r) => r.kind === "folder")
  const fileResults = results.filter((r) => r.kind === "file")
  const groups: [string, FileSearchItem[]][] = [
    ...(folderResults.length ? [["Folders", folderResults] as [string, FileSearchItem[]]] : []),
    ...(fileResults.length ? [["Files", fileResults] as [string, FileSearchItem[]]] : []),
  ]

  return (
    <div ref={containerRef} className={className}>
      <div className="relative">
        {/* Magnifying glass icon – always present */}
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
          </svg>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setOpen(true)
          }}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          className={inputClassName}   // all design comes from parent
        />

        {query && (
          <button
            onClick={() => {
              setQuery("")
              setOpen(false)
              inputRef.current?.focus()
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
          >
            <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown – design kept internal (not duplicated) */}
      {open && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-100/80 overflow-hidden z-50 max-h-[420px] overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {groups.map(([groupLabel, groupItems]) => (
            <div key={groupLabel}>
              <div className="flex items-center gap-2 px-4 pt-3 pb-1.5">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{groupLabel}</span>
              </div>
              {groupItems.map((item) => {
                const flatIdx = results.indexOf(item)
                const isActive = flatIdx === activeIndex
                return (
                  <button
                    key={item.domId}
                    data-index={flatIdx}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setActiveIndex(flatIdx)}
                    className={`w-full text-left flex items-start gap-3 px-4 py-2.5 transition-colors ${
                      isActive ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isActive ? "bg-blue-100" : "bg-gray-100"
                      }`}
                    >
                      {item.kind === "folder" ? (
                        <svg className={`w-3.5 h-3.5 ${isActive ? "text-blue-600" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                        </svg>
                      ) : (
                        <svg className={`w-3.5 h-3.5 ${isActive ? "text-blue-600" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 3h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium truncate ${isActive ? "text-blue-700" : "text-gray-800"}`}>
                        {highlight(item.name, query)}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-gray-400 truncate">{highlight(item.locationLabel, query)}</span>
                        {item.isDeleted && (
                          <>
                            <span className="text-gray-300">·</span>
                            <span className="text-xs text-red-400">In trash</span>
                          </>
                        )}
                      </div>
                    </div>
                    <svg
                      className={`w-4 h-4 shrink-0 mt-1.5 transition-opacity ${isActive ? "opacity-100 text-blue-400" : "opacity-0"}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      )}

      {open && query.trim() && results.length === 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-100/80 z-50 px-4 py-6 text-center">
          <div className="text-2xl mb-2">🔍</div>
          <div className="text-sm font-medium text-gray-600">No results for "{query}"</div>
        </div>
      )}
    </div>
  )
}