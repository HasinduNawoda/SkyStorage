// AddressBar.tsx
import home from "../assets/icons/dashboard.png";

type ViewKey =
  | "dashboard"
  | "deep_clean"
  | "settings"
  | "shared"
  | "favorites"
  | "deletedFiles"
  | "folders"
  | "files";

type FolderCrumb = { id: string; name: string };

type Props = {
  activeView: ViewKey;
  folderStack: FolderCrumb[];
  /** Jump back to the root of the current section (clears the folder stack). */
  onNavigateToRoot: () => void;
  /**
   * Jump to a specific depth in the folder stack.
   * `index` is the index within `folderStack` of the crumb that was clicked —
   * everything after it gets dropped.
   */
  onNavigateToFolder: (index: number) => void;
};

const SECTION_LABELS: Record<ViewKey, string> = {
  dashboard: "Dashboard",
  favorites: "Favorites",
  shared: "Shared",
  deletedFiles: "Recycle Bin",
  folders: "Folders",
  files: "Files",
  settings: "Settings",
  deep_clean: "DeepClean",
};

export default function AddressBar({
  activeView,
  folderStack,
  onNavigateToRoot,
  onNavigateToFolder,
}: Props) {
  const rootLabel = SECTION_LABELS[activeView] ?? "Dashboard";
  const isAtRoot = folderStack.length === 0;

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 mb-4 text-sm text-gray-500 select-none overflow-x-auto whitespace-nowrap"
    >

      {/* Root / section crumb */}
      <button
        type="button"
        onClick={onNavigateToRoot}
        disabled={isAtRoot}
        aria-current={isAtRoot ? "page" : undefined}
        className={
          isAtRoot
            ? "font-semibold text-gray-800 cursor-default"
            : "font-medium text-blue-600 hover:text-blue-800 hover:underline"
        }
      >
        {rootLabel}
      </button>

      {folderStack.map((folder, idx) => {
        const isLast = idx === folderStack.length - 1;
        return (
          <span key={folder.id} className="flex items-center gap-1.5 min-w-0">
            <span className="text-gray-400">/</span>
            <button
              type="button"
              onClick={() => onNavigateToFolder(idx)}
              disabled={isLast}
              aria-current={isLast ? "page" : undefined}
              title={folder.name}
              className={
                isLast
                  ? "font-semibold text-gray-800 cursor-default truncate max-w-[220px]"
                  : "font-medium text-blue-600 hover:text-blue-800 hover:underline truncate max-w-[220px]"
              }
            >
              {folder.name}
            </button>
          </span>
        );
      })}
    </nav>
  );
}
