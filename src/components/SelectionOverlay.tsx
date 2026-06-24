import { useEffect, useRef, useState } from "react"

type Rect = { left: number; top: number; width: number; height: number }

type SelectionOverlayProps = {
  /** The scrollable container we measure item bounding boxes against. */
  containerRef: React.RefObject<HTMLElement>
  /** Called once a drag completes (or extends selection additively). */
  onSelectionChange: (folderIds: string[], fileIds: string[]) => void
  /** Enter select mode when a drag starts. */
  onEnterSelectMode: () => void
  /** Current select mode – overlay is active only when false (we take over) OR when true (additive). */
  selectMode: boolean
  /** Flag back to parent: "the right-click that just started was a drag" – used to suppress the context menu. */
  onDragStarted: () => void

  /** DOM IDs for folders and files so we can hit-test them.
   *  Each entry: { domId: string, folderId?: string, fileId?: string }
   */
  items: { domId: string; folderId?: string; fileId?: string }[]
}

/** Minimum pixel movement before we treat a mousedown as a drag. */
const DRAG_THRESHOLD = 6

export default function SelectionOverlay({
  containerRef,
  onSelectionChange,
  onEnterSelectMode,
  onDragStarted,
  items,
}: SelectionOverlayProps) {
  const [dragRect, setDragRect] = useState<Rect | null>(null)
  const startPos = useRef<{ x: number; y: number } | null>(null)
  const isDragging = useRef(false)
  const dragReported = useRef(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const onMouseDown = (e: MouseEvent) => {
      // Only start a drag on the container itself (empty space), not on cards / rows.
      const target = e.target as HTMLElement
      // If we clicked on a card, row, button, checkbox, or menu – skip.
      const clickedOnItem = target.closest(
        '[data-selectable], button, input, [role="menuitem"], [role="menu"]'
      )
      if (clickedOnItem) return

      startPos.current = { x: e.clientX, y: e.clientY }
      isDragging.current = false
      dragReported.current = false
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!startPos.current) return

      const dx = e.clientX - startPos.current.x
      const dy = e.clientY - startPos.current.y

      if (!isDragging.current) {
        if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return
        // Crossed threshold – start dragging
        isDragging.current = true
        onEnterSelectMode()
        if (!dragReported.current) {
          dragReported.current = true
          onDragStarted()
        }
      }

      const x1 = Math.min(startPos.current.x, e.clientX)
      const y1 = Math.min(startPos.current.y, e.clientY)
      const x2 = Math.max(startPos.current.x, e.clientX)
      const y2 = Math.max(startPos.current.y, e.clientY)

      setDragRect({ left: x1, top: y1, width: x2 - x1, height: y2 - y1 })

      // Hit-test items against the current selection rect
      const folderIds: string[] = []
      const fileIds: string[] = []

      items.forEach(({ domId, folderId, fileId }) => {
        const el = document.getElementById(domId)
        if (!el) return
        const r = el.getBoundingClientRect()
        const overlaps =
          r.left < x2 && r.right > x1 && r.top < y2 && r.bottom > y1
        if (overlaps) {
          if (folderId) folderIds.push(folderId)
          if (fileId) fileIds.push(fileId)
        }
      })

      onSelectionChange(folderIds, fileIds)
    }

    const onMouseUp = () => {
      startPos.current = null
      isDragging.current = false
      setDragRect(null)
    }

    container.addEventListener("mousedown", onMouseDown)
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)

    return () => {
      container.removeEventListener("mousedown", onMouseDown)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }
  }, [containerRef, items, onEnterSelectMode, onDragStarted, onSelectionChange])

  if (!dragRect) return null

  return (
    <div
      style={{
        position: "fixed",
        left: dragRect.left,
        top: dragRect.top,
        width: dragRect.width,
        height: dragRect.height,
        background: "rgba(59,130,246,0.12)",
        border: "1.5px solid rgba(59,130,246,0.55)",
        borderRadius: 4,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  )
}
