import { Group, Menu, Portal } from "@chakra-ui/react"
import cut from "../assets/icons/cut.png"
import copy from "../assets/icons/copy.png"
import download from "../assets/icons/downloadicon.png"
import trash from "../assets/icons/bin.png"
import deleted from "../assets/icons/deleted.png"
import share from "../assets/icons/shareicon.png"
import star from "../assets/icons/star.png"
import fav from "../assets/icons/fav.png"

type FileMenuProps = {
  isFavorite: boolean
  isDeleted: boolean
  onDownload: () => void
  onDelete: () => void
  onShare: () => void
  onToggleFavorite: () => void
  onRename?: () => void
  onCut?: () => void
  onCopy?: () => void

  // Click-trigger mode: wrap the trigger element as children.
  children?: React.ReactNode
  /** Notified whenever the click-trigger dropdown opens/closes. */
  onOpenChange?: (open: boolean) => void

  // Controlled position-trigger mode (right-click).
  openAt?: { x: number; y: number } | null
  onClosePositioned?: () => void
}

function FileMenuContent({
  isFavorite,
  isDeleted,
  onDownload,
  onDelete,
  onShare,
  onToggleFavorite,
  onRename,
  onCut,
  onCopy,
}: Omit<FileMenuProps, "children" | "openAt" | "onClosePositioned">) {
  const clipboardItems = [
    { label: "Cut", value: "cut", icon: cut, onClick: onCut },
    { label: "Copy", value: "copy", icon: copy, onClick: onCopy },
  ]

  return (
    <Menu.Content minW="44">
      {!isDeleted && (
        <>
          <Group grow gap="0">
            {clipboardItems.map((item) => (
              <Menu.Item
                key={item.value}
                value={item.value}
                onClick={item.onClick}
                width="14"
                gap="1"
                flexDirection="column"
                justifyContent="center"
              >
                <img src={item.icon} className="w-4 h-4 opacity-80" />
                <span className="text-xs">{item.label}</span>
              </Menu.Item>
            ))}
          </Group>
          <Menu.Separator />
        </>
      )}

      {onRename && !isDeleted && (
        <Menu.Item value="rename" onClick={onRename} gap="2">
          <span className="w-4 h-4 shrink-0" />
          <span>Rename</span>
        </Menu.Item>
      )}

      <Menu.Item value="download" onClick={onDownload} gap="2">
        <img src={download} className="w-4 h-4 opacity-70" />
        <span>Download</span>
      </Menu.Item>

      <Menu.Item value="delete" onClick={onDelete} gap="2">
        <img src={isDeleted ? deleted : trash} className="w-4 h-4 opacity-70" />
        <span>{isDeleted ? "Restore" : "Delete"}</span>
      </Menu.Item>

      {!isDeleted && (
        <Menu.Item value="share" onClick={onShare} gap="2">
          <img src={share} className="w-4 h-4 opacity-70" />
          <span>Share</span>
        </Menu.Item>
      )}

      {!isDeleted && (
        <Menu.Item value="favorite" onClick={onToggleFavorite} gap="2">
          <img src={isFavorite ? fav : star} className="w-4 h-4" />
          <span>{isFavorite ? "Remove from favorites" : "Add to favorites"}</span>
        </Menu.Item>
      )}
    </Menu.Content>
  )
}

export default function FileMenu(props: FileMenuProps) {
  const { children, openAt, onClosePositioned, onOpenChange, ...contentProps } = props

  if (openAt) {
    return (
      <Menu.Root
        open
        onOpenChange={(d) => {
          if (!d.open) onClosePositioned?.()
        }}
      >
        <Menu.Trigger asChild>
          <div
            style={{
              position: "fixed",
              top: openAt.y,
              left: openAt.x,
              width: 1,
              height: 1,
            }}
          />
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <FileMenuContent {...contentProps} />
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    )
  }

  // openAt was explicitly passed as null (closed, but still "controlled" mode):
  // render nothing at all, rather than mounting a closed trigger at (0, 0).
  if (openAt !== undefined) return null

  return (
    <Menu.Root onOpenChange={(d) => onOpenChange?.(d.open)}>
      <Menu.Trigger asChild onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        {children}
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <FileMenuContent {...contentProps} />
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
}
