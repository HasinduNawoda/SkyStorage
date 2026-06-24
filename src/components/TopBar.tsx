// TopBar.tsx
import { useEffect, useRef, useState } from "react";
import plus from "../assets/icons/plus.png";
import FileSearchBar, { type FileSearchItem } from "./FileSearchBar";

type Props = {
  activeView:
    | "dashboard"
    | "deep_clean"
    | "settings"
    | "shared"
    | "favorites"
    | "deletedFiles"
    | "folders"
    | "files";

  onCreateFolder: () => void;
  onUploadFile: () => void;
  onUploadFolder: () => void;

  searchItems: FileSearchItem[];
  onSearchSelect: (item: FileSearchItem) => void;
};

export default function TopBar({
  activeView,
  onCreateFolder,
  onUploadFile,
  onUploadFolder,
  searchItems,
  onSearchSelect,
}: Props) {
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const showSearch = activeView !== "deep_clean";
  const showCreateNew =
    activeView !== "deep_clean" && activeView !== "deletedFiles";

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-10 mb-6 relative">
      {/* SEARCH – design passed entirely via inputClassName */}
      {showSearch && (
        <FileSearchBar
          items={searchItems}
          onSelect={onSearchSelect}
          placeholder="Search files and folders"
          className="flex-1"                 // outer wrapper: fill available space
          inputClassName="w-full pl-10 pr-4 py-2.5 rounded border border-gray-300 text-lg
                           focus:outline-none focus:ring-2 focus:ring-blue-500
                           bg-white placeholder-gray-400" // all visual design here
        />
      )}

      {/* CREATE NEW */}
      {showCreateNew && (
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpenMenu((prev) => !prev)}
            className="h-14 flex items-center bg-blue-500 text-white text-lg px-6
                       rounded hover:bg-blue-600 transition"
          >
            <img src={plus} className="w-8 h-8 mr-2" alt="Create new" />
            Create New
          </button>

          {openMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-lg border z-50">
              <button
                onClick={() => {
                  onCreateFolder();
                  setOpenMenu(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-gray-100"
              >
                New Folder
              </button>
              <hr className="border-gray-200" />
              <button
                onClick={() => {
                  onUploadFile();
                  setOpenMenu(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-gray-100"
              >
                File Upload
              </button>
              <button
                onClick={() => {
                  onUploadFolder();
                  setOpenMenu(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-gray-100"
              >
                Folder Upload
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}