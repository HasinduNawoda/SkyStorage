import { Menu, Portal } from "@chakra-ui/react"
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

  // Click-trigger mode: wrap the trigger element as children.
  children?: React.ReactNode

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
}: Omit<FileMenuProps, "children" | "openAt" | "onClosePositioned">) {
  return (
    <Menu.Content minW="44">
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
  const { children, openAt, onClosePositioned, ...contentProps } = props

  if (openAt !== undefined) {
    return (
      <Menu.Root
        open={!!openAt}
        onOpenChange={(d) => {
          if (!d.open) onClosePositioned?.()
        }}
      >
        <Menu.Trigger asChild>
          <div
            style={{
              position: "fixed",
              top: openAt?.y ?? 0,
              left: openAt?.x ?? 0,
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

  return (
    <Menu.Root>
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
