import docIcon from "../assets/icons/doc.png"
import imageIcon from "../assets/icons/image.png"
import videoIcon from "../assets/icons/mp4.png"
import audioIcon from "../assets/icons/mp3.png"
import otherIcon from "../assets/icons/other.png"
import share from "../assets/icons/shareicon.png"
import download from "../assets/icons/downloadicon.png"
import trash from "../assets/icons/bin.png"
import more from "../assets/icons/moreicon.png"
import star from "../assets/icons/star.png"
import fav from "../assets/icons/fav.png"
import { getFileType } from "../utils/FileType"
import deleted from "../assets/icons/deleted.png"
import { useEffect, useRef, useState } from "react"
import ShareModal from "./ShareModal"
import MembersAvatars from "./MembersAvatars"
import FileMenu from "./FileMenu"

const formatDate = (dateString: string | Date): string => {
  const date = new Date(dateString)
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

type FileTable = {
  /** Stable DOM id used by SelectionOverlay for bounding-box hit-testing. */
  domId?: string
  name: string
  size: string
  lastModified: string
  dateShared?: string
  people?: { email: string }[]
  isFavorite: boolean
  onToggleFavorite: () => void
  isDeleted?: boolean
  onToggleDelete: () => void
  onShare?: (payload: any) => void
  isShared?: boolean
  message?: string
  /** The real File/Blob captured at upload time, if available — used for real downloads. */
  blob?: Blob
  /** Called when the user wants to download this file (hover icon or menu item). */
  onDownload?: () => void

  // Rename
  isEditing?: boolean
  /** Commit a rename with the new name typed in the inline input. */
  onRename?: (newName: string) => void
  /** Cancel out of edit mode without changing the name. */
  onCancelEdit?: () => void
  /** Called when the user picks "Rename" from the ••• / right-click menu to enter edit mode. */
  onRequestRename?: () => void
  onCut?: () => void
  onCopy?: () => void

  // Select mode
  selectMode?: boolean
  isSelected?: boolean
  onToggleSelect?: () => void

  /**
   * When the user right-clicks this row while it's selected, call this instead
   * of opening the per-file menu so the parent can show the bulk menu.
   */
  onBulkRightClick?: (x: number, y: number) => void
  /** Total items selected – used to decide whether to invoke bulk right-click. */
  selectedCount?: number
}

function getIconByType(type: string) {
  if (type === "document") return docIcon
  if (type === "image") return imageIcon
  if (type === "video") return videoIcon
  if (type === "audio") return audioIcon
  return otherIcon
}

export default function FilesTable({
  domId,
  name,
  size,
  lastModified,
  dateShared,
  people,
  isFavorite,
  onToggleFavorite,
  isDeleted,
  onToggleDelete,
  onShare,
  message,
  isShared,
  onDownload,
  isEditing = false,
  onRename,
  onCancelEdit,
  onRequestRename,
  onCut,
  onCopy,
  selectMode = false,
  isSelected = false,
  onToggleSelect,
  onBulkRightClick,
  selectedCount = 0,
}: FileTable) {
  const icon = getIconByType(getFileType(name))
  const [openMsg, setOpenMsg] = useState(false)
  const [open, setOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [rightClickAt, setRightClickAt] = useState<{ x: number; y: number } | null>(null)
  const [value, setValue] = useState(name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) {
      setValue(name)
      requestAnimationFrame(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      })
    }
  }, [isEditing, name])

  const commitRename = () => onRename?.(value)

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      commitRename()
    } else if (e.key === "Escape") {
      e.preventDefault()
      onCancelEdit?.()
    }
  }

  const formatDateIfNeeded = (dateString: string): string => {
    if (dateString && (dateString.includes("T") || dateString.includes("-"))) {
      return formatDate(dateString)
    }
    return dateString
  }

  const displayDate = isShared && dateShared
    ? formatDateIfNeeded(dateShared)
    : lastModified

  const handleRowClick = () => {
    if (isEditing) return
    if (selectMode) onToggleSelect?.()
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isEditing) return

    // Bulk right-click: selected row in select mode with ≥1 item selected
    if (selectMode && isSelected && selectedCount > 0 && onBulkRightClick) {
      onBulkRightClick(e.clientX, e.clientY)
      return
    }

    if (selectMode) return
    setRightClickAt({ x: e.clientX, y: e.clientY })
  }

  const fileMenuActionProps = {
    isFavorite,
    isDeleted: !!isDeleted,
    onDownload: () => onDownload?.(),
    onDelete: onToggleDelete,
    onShare: () => setOpen(true),
    onToggleFavorite,
    onRename: () => onRequestRename?.(),
    onCut: () => onCut?.(),
    onCopy: () => onCopy?.(),
  }

  return (
    <tr
      id={domId}
      // data-selectable tells SelectionOverlay this is a real item (not empty space)
      data-selectable="true"
      onClick={handleRowClick}
      onContextMenu={handleContextMenu}
      className={`group hover:bg-gray-100 cursor-pointer ${isSelected ? "bg-blue-50" : ""}`}
    >
      {selectMode && (
        <td className="px-2 py-2 w-[36px]">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect?.()}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 accent-blue-500 cursor-pointer"
          />
        </td>
      )}

      <td className="px-4 py-2 w-[420px]">
        <div className="relative flex items-center gap-3">
          <img src={icon} className="w-6 h-6 shrink-0" />

          {isEditing ? (
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleRenameKeyDown}
              onBlur={commitRename}
              onClick={(e) => e.stopPropagation()}
              className="font-normal text-sm w-full max-w-[220px] border border-blue-500 rounded px-1 py-0.5 focus:outline-none selection:bg-blue-200 selection:text-black"
            />
          ) : (
            <span className="truncate max-w-[220px]">{name}</span>
          )}

          {!isEditing && (
            <div
              className={`absolute right-0 items-center gap-3 bg-gray-100 pl-3 ${
                menuOpen ? "flex" : "hidden group-hover:flex"
              }`}
            >
              <button onClick={(e) => { e.stopPropagation(); onDownload?.() }}>
                <img src={download} className="w-4 h-4 opacity-70 hover:opacity-100" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); onToggleDelete() }}>
                <img src={isDeleted ? deleted : trash} className="w-4 h-4 opacity-70 hover:opacity-100" />
              </button>
              {!isDeleted && (
                <button onClick={(e) => { e.stopPropagation(); setOpen(true) }}>
                  <img src={share} className="w-4 h-4 opacity-70 hover:opacity-100" />
                </button>
              )}
              <ShareModal
                open={open}
                onClose={() => setOpen(false)}
                fileName={name}
                onShare={(payload: any) => {
                  onShare?.(payload)
                  setOpen(false)
                }}
              />
              <FileMenu {...fileMenuActionProps} onOpenChange={setMenuOpen}>
                <button onClick={(e) => e.stopPropagation()}>
                  <img src={more} className="w-4 h-4 opacity-70 hover:opacity-100" />
                </button>
              </FileMenu>
              {!isDeleted && (
                <button onClick={(e) => { e.stopPropagation(); onToggleFavorite() }}>
                  <img src={isFavorite ? fav : star} className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </td>

      <td className="px-4 py-2 w-[120px]">{size}</td>
      <td className="px-4 py-2 w-[160px]">{displayDate}</td>
      <td className="px-4 py-2 w-[160px] text-center">
        {people && people.length > 0 ? (
          <MembersAvatars emails={people.map((p) => p.email)} />
        ) : (
          <span className="text-gray-400 text-sm text-center">—</span>
        )}
      </td>

      {isShared && (
        <td className="px-4 py-2">
          <button
            disabled={!message}
            onClick={(e) => { e.stopPropagation(); setOpenMsg(true) }}
            className={`px-3 py-1 rounded text-sm ${
              message
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            View
          </button>

          {openMsg && (
            <div
              className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
              onClick={() => setOpenMsg(false)}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-lg p-6 max-w-lg shadow-xl"
              >
                <h3 className="text-lg font-semibold mb-3">Message</h3>
                <p className="whitespace-pre-wrap text-gray-700">{message}</p>
                <button onClick={() => setOpenMsg(false)} className="mt-4 text-sm text-blue-600">
                  Close
                </button>
              </div>
            </div>
          )}
        </td>
      )}

      <td className="p-0 m-0 border-0" style={{ width: 0, height: 0 }}>
        <FileMenu
          {...fileMenuActionProps}
          openAt={rightClickAt}
          onClosePositioned={() => setRightClickAt(null)}
        />
      </td>
    </tr>
  )
}
