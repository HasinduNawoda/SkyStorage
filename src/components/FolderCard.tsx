import { useEffect, useRef, useState } from "react";
import folder from "../assets/icons/folder.png";
import fav from "../assets/icons/fav.png";
import FolderMenu from "./FolderMenu";

type FolderCardProps = {
  id: string;
  /** Stable DOM id used by SelectionOverlay for bounding-box hit-testing. */
  domId?: string;
  name: string;
  files: number;
  size: string;
  isEditing?: boolean;
  onRename?: (id: string, newName: string) => void;
  onCancelEdit?: (id: string) => void;
  onOpen?: () => void;

  isFavorite?: boolean;
  isDeleted?: boolean;
  onToggleFavorite?: () => void;
  onToggleDelete?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onProperties?: () => void;

  // Clipboard
  onCut?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  canPaste?: boolean;

  // Select mode
  selectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;

  /**
   * When the user right-clicks this card while it's selected, call this instead
   * of opening the per-folder menu so the parent can show the bulk menu.
   */
  onBulkRightClick?: (x: number, y: number) => void;
  /** Total items selected – used to decide whether to invoke bulk right-click. */
  selectedCount?: number;
};

export default function FolderCard({
  id,
  domId,
  name,
  files,
  size,
  isEditing = false,
  onRename,
  onCancelEdit,
  onOpen,
  isFavorite = false,
  isDeleted = false,
  onToggleFavorite,
  onToggleDelete,
  onDownload,
  onShare,
  onProperties,
  onCut,
  onCopy,
  onPaste,
  canPaste = false,
  selectMode = false,
  isSelected = false,
  onToggleSelect,
  onBulkRightClick,
  selectedCount = 0,
}: FolderCardProps) {
  const [value, setValue] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);
  const [rightClickAt, setRightClickAt] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (isEditing) {
      setValue(name);
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [isEditing, name]);

  const commit = () => onRename?.(id, value);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancelEdit?.(id);
    }
  };

  const handleCardClick = () => {
    if (selectMode) {
      onToggleSelect?.();
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isEditing) return;

    // If we're in select mode and this card is selected (and there's a bulk handler), show bulk menu
    if (selectMode && isSelected && selectedCount > 0 && onBulkRightClick) {
      onBulkRightClick(e.clientX, e.clientY);
      return;
    }

    if (selectMode) return; // unselected card in select mode – do nothing
    setRightClickAt({ x: e.clientX, y: e.clientY });
  };

  const menuActionProps = {
    isFavorite,
    isDeleted,
    onDownload: () => onDownload?.(),
    onDelete: () => onToggleDelete?.(),
    onShare: () => onShare?.(),
    onToggleFavorite: () => onToggleFavorite?.(),
    onProperties: () => onProperties?.(),
    onCut: () => onCut?.(),
    onCopy: () => onCopy?.(),
    onPaste: () => onPaste?.(),
    canPaste,
  };

  return (
    <div
      id={domId}
      // data-selectable tells SelectionOverlay this is a real item, not empty space
      data-selectable="true"
      onClick={handleCardClick}
      onDoubleClick={() => !isEditing && !selectMode && onOpen?.()}
      onContextMenu={handleContextMenu}
      className={`relative bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition flex flex-col gap-3 cursor-pointer select-none ${
        isSelected ? "ring-2 ring-blue-500" : ""
      }`}
    >
      {/* Select-mode checkbox */}
      {selectMode && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect?.()}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-3 left-3 w-4 h-4 accent-blue-500 cursor-pointer"
        />
      )}

      <div className="flex items-center justify-between">
        <img src={folder} alt="Folder Icon" className="w-15 h-15" />

        {!isEditing && (
          <div className="flex items-center gap-2">
            {isFavorite && (
              <img src={fav} alt="Favorited" className="w-4 h-4" />
            )}
            {!selectMode && (
              <FolderMenu {...menuActionProps}>
                <span
                  className="text-gray-400 cursor-pointer px-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  •••
                </span>
              </FolderMenu>
            )}
          </div>
        )}
      </div>

      <div>
        {isEditing ? (
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={commit}
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            className="font-semibold text-sm w-full border border-blue-500 rounded px-1 py-0.5 focus:outline-none selection:bg-blue-200 selection:text-black"
          />
        ) : (
          <div className="font-semibold text-sm">{name}</div>
        )}
        <div className="text-xs text-gray-500">{files} files</div>
        <div className="text-xs text-gray-500">{size}</div>
      </div>

      {/* Right-click menu (individual, not in select mode) */}
      <FolderMenu
        {...menuActionProps}
        openAt={rightClickAt}
        onClosePositioned={() => setRightClickAt(null)}
      />
    </div>
  );
}
