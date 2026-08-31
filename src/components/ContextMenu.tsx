import { useEffect, useRef } from "react"
import cut from "../assets/icons/cut.png"
import copy from "../assets/icons/copy.png"
import paste from "../assets/icons/paste.png"

type ContextMenuProps = {
  open: boolean
  x: number
  y: number
  onClose: () => void
  onPaste: () => void
  onUploadFile: () => void
  onUploadFolder: () => void
  /** Now only enters select mode – no longer auto-checks all items. */
  onSelectItems: () => void
  onCreateNewFolder: () => void
  isSelectModeActive: boolean
  canPaste: boolean
  /** Whether the current view has any files or folders that could be selected. */
  hasSelectableItems: boolean
}

export default function ContextMenu({
  open,
  x,
  y,
  onClose,
  onPaste,
  onUploadFile,
  onUploadFolder,
  onSelectItems,
  onCreateNewFolder,
  isSelectModeActive,
  canPaste,
  hasSelectableItems,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  // Close when clicking outside
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    // Use a timeout so the current right-click event doesn't immediately close it
    const id = setTimeout(() => {
      document.addEventListener("mousedown", handler)
    }, 0)
    return () => {
      clearTimeout(id)
      document.removeEventListener("mousedown", handler)
    }
  }, [open, onClose])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, onClose])

  if (!open) return null

  // Clamp to viewport
  const menuWidth = 210
  const menuHeight = 280
  const clampedX = Math.min(x, window.innerWidth - menuWidth - 8)
  const clampedY = Math.min(y, window.innerHeight - menuHeight - 8)

  const clipboardItems = [
    { label: "Cut", icon: cut, onClick: undefined as (() => void) | undefined, disabled: true },
    { label: "Copy", icon: copy, onClick: undefined as (() => void) | undefined, disabled: true },
    { label: "Paste", icon: paste, onClick: onPaste, disabled: !canPaste },
  ]

  const handleAction = (action?: () => void) => {
    if (!action) return
    onClose()
    action()
  }

  return (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top: clampedY,
        left: clampedX,
        zIndex: 9999,
      }}
      className="bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[200px] animate-in fade-in zoom-in-95 duration-100"
    >
      {/* Clipboard row */}
      <div className="flex items-center justify-around px-2 py-1.5 border-b border-gray-100">
        {clipboardItems.map((item) => (
          <button
            key={item.label}
            onClick={() => handleAction(item.onClick)}
            disabled={item.disabled}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors ${
              item.disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <img src={item.icon} className="w-4 h-4" />
            <span className="text-xs text-gray-600">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Action items */}
      <button
        onClick={() => handleAction(onUploadFile)}
        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
      >
        Upload file
      </button>
      <button
        onClick={() => handleAction(onUploadFolder)}
        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
      >
        Upload folder
      </button>

      <div className="border-t border-gray-100 my-0.5" />

      {!isSelectModeActive && (
        <button
          onClick={() => handleAction(onSelectItems)}
          disabled={!hasSelectableItems}
          className={`w-full text-left px-4 py-2 text-sm transition-colors ${
            hasSelectableItems
              ? "text-gray-700 hover:bg-gray-100 cursor-pointer"
              : "text-gray-300 cursor-not-allowed"
          }`}
        >
          Select items
        </button>
      )}
      <button
        onClick={() => handleAction(onCreateNewFolder)}
        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
      >
        Create new folder
      </button>
    </div>
  )
}
