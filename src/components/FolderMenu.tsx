import { Group, Menu, Portal } from "@chakra-ui/react"
import cut from "../assets/icons/cut.png"
import copy from "../assets/icons/copy.png"
import paste from "../assets/icons/paste.png"
import download from "../assets/icons/downloadicon.png"
import trash from "../assets/icons/bin.png"
import deleted from "../assets/icons/deleted.png"
import share from "../assets/icons/shareicon.png"
import star from "../assets/icons/star.png"
import fav from "../assets/icons/fav.png"

type FolderMenuProps = {
  isFavorite: boolean
  isDeleted: boolean
  onDownload: () => void
  onDelete: () => void
  onShare: () => void
  onToggleFavorite: () => void
  onProperties: () => void
  onRename?: () => void
  onCut?: () => void
  onCopy?: () => void
  onPaste?: () => void
  canPaste?: boolean

  // Click-trigger mode (•••  button): wrap the trigger element as children.
  children?: React.ReactNode

  // Controlled position-trigger mode (right-click): pass coordinates + open state
  // instead of children. When openAt is set, the menu ignores children entirely.
  openAt?: { x: number; y: number } | null
  onClosePositioned?: () => void
}

function FolderMenuContent({
  isFavorite,
  isDeleted,
  onDownload,
  onDelete,
  onShare,
  onToggleFavorite,
  onProperties,
  onRename,
  onCut,
  onCopy,
  onPaste,
  canPaste,
}: Omit<FolderMenuProps, "children" | "openAt" | "onClosePositioned">) {
  // Cut/Copy/Paste don't make sense on a folder that's already in the trash —
  // matches Share already being hidden in that state.
  const showClipboardRow = !isDeleted

  const clipboardItems = [
    { label: "Cut", value: "cut", icon: cut, onClick: onCut, disabled: false },
    { label: "Copy", value: "copy", icon: copy, onClick: onCopy, disabled: false },
    { label: "Paste", value: "paste", icon: paste, onClick: onPaste, disabled: !canPaste },
  ]

  return (
    <Menu.Content minW="44">
      {showClipboardRow && (
        <>
          <Group grow gap="0">
            {clipboardItems.map((item) => (
              <Menu.Item
                key={item.value}
                value={item.value}
                onClick={item.onClick}
                disabled={item.disabled}
                width="14"
                gap="1"
                flexDirection="column"
                justifyContent="center"
              >
                <img
                  src={item.icon}
                  className={`w-4 h-4 ${item.disabled ? "opacity-30" : "opacity-80"}`}
                />
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

      <Menu.Item value="properties" onClick={onProperties} gap="2">
        <span className="w-4 h-4 shrink-0" />
        <span>Properties</span>
      </Menu.Item>
    </Menu.Content>
  )
}

export default function FolderMenu(props: FolderMenuProps) {
  const { children, openAt, onClosePositioned, ...contentProps } = props

  // Right-click mode: controlled open state, anchored to an invisible point at the cursor.
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
            <FolderMenuContent {...contentProps} />
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    )
  }

  // Click-trigger mode: the ••• button passed in as children.
  return (
    <Menu.Root>
      <Menu.Trigger asChild onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        {children}
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <FolderMenuContent {...contentProps} />
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
}
