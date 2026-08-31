import { Menu, Portal } from "@chakra-ui/react"
import download from "../assets/icons/downloadicon.png"
import trash from "../assets/icons/bin.png"
import star from "../assets/icons/star.png"
import copy from "../assets/icons/copy.png"
import cut from "../assets/icons/cut.png"
import share from "../assets/icons/shareicon.png"
import deleted from "../assets/icons/deleted.png"

type BulkMenuProps = {
  /** Number of selected items (folders + files combined). */
  selectionCount: number
  isRecycleBin?: boolean

  onDownload: () => void
  onDelete: () => void
  onFavorite: () => void
  onCopy: () => void
  onCut: () => void
  onShare: () => void
  onRestore?: () => void
  onProperties?: () => void

  /** Controlled position-trigger mode — coordinates of the right-click. */
  openAt: { x: number; y: number } | null
  onClose: () => void
}

function BulkMenuContent({
  selectionCount,
  isRecycleBin,
  onDownload,
  onDelete,
  onFavorite,
  onCopy,
  onCut,
  onShare,
  onRestore,
  onProperties,
}: Omit<BulkMenuProps, "openAt" | "onClose">) {
  return (
    <Menu.Content minW="52">
      {/* Header showing how many items are selected */}
      <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 border-b border-gray-100 mb-1">
        {selectionCount} item{selectionCount !== 1 ? "s" : ""} selected
      </div>

      <Menu.Item value="download" onClick={onDownload} gap="2">
        <img src={download} className="w-4 h-4 opacity-70" />
        <span>Download</span>
      </Menu.Item>

      {isRecycleBin ? (
        <>
          <Menu.Item value="restore" onClick={onRestore} gap="2">
            <img src={deleted} className="w-4 h-4 opacity-70" />
            <span>Restore</span>
          </Menu.Item>

          <Menu.Item value="properties" onClick={onProperties} gap="2">
            <span className="w-4 h-4 shrink-0" />
            <span>Properties</span>
          </Menu.Item>
        </>
      ) : (
        <>
          <Menu.Item value="delete" onClick={onDelete} gap="2">
            <img src={trash} className="w-4 h-4 opacity-70" />
            <span>Delete</span>
          </Menu.Item>

          <Menu.Item value="favorite" onClick={onFavorite} gap="2">
            <img src={star} className="w-4 h-4" />
            <span>Add to favorites</span>
          </Menu.Item>

          <Menu.Item value="copy" onClick={onCopy} gap="2">
            <img src={copy} className="w-4 h-4 opacity-70" />
            <span>Copy</span>
          </Menu.Item>

          <Menu.Item value="cut" onClick={onCut} gap="2">
            <img src={cut} className="w-4 h-4 opacity-70" />
            <span>Cut</span>
          </Menu.Item>

          <Menu.Item value="share" onClick={onShare} gap="2">
            <img src={share} className="w-4 h-4 opacity-70" />
            <span>Share</span>
          </Menu.Item>
        </>
      )}
    </Menu.Content>
  )
}

export default function BulkMenu({
  openAt,
  onClose,
  ...contentProps
}: BulkMenuProps) {
  return (
    <Menu.Root
      open={!!openAt}
      onOpenChange={(d) => {
        if (!d.open) onClose()
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
          <BulkMenuContent {...contentProps} />
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
}
