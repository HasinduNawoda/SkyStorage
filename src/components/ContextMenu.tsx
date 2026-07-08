import { Group, Menu, Portal } from "@chakra-ui/react"
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
  const clipboardItems = [
    { label: "Cut", value: "cut", icon: cut, onClick: undefined, disabled: true },
    { label: "Copy", value: "copy", icon: copy, onClick: undefined, disabled: true },
    { label: "Paste", value: "paste", icon: paste, onClick: onPaste, disabled: !canPaste },
  ]

  return (
    <Menu.Root
      open={open}
      onOpenChange={(d) => {
        if (!d.open) onClose()
      }}
    >
      {/* Invisible anchor positioned at the click coordinates */}
      <Menu.Trigger asChild>
        <div
          style={{
            position: "fixed",
            top: y,
            left: x,
            width: 1,
            height: 1,
          }}
        />
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content minW="48">
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

            <Menu.Item value="upload-file" onClick={onUploadFile}>
              Upload file
            </Menu.Item>
            <Menu.Item value="upload-folder" onClick={onUploadFolder}>
              Upload folder
            </Menu.Item>

            <Menu.Separator />

            {/* Only show "Select items" when not already in select mode.
                Exiting select mode is handled by the dedicated banner button,
                not buried in this menu anymore. Disabled when the current
                view has no files or folders to select. */}
            {!isSelectModeActive && (
              <Menu.Item
                value="select-items"
                onClick={onSelectItems}
                disabled={!hasSelectableItems}
              >
                Select items
              </Menu.Item>
            )}
            <Menu.Item value="create-folder" onClick={onCreateNewFolder}>
              Create new folder
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
}
