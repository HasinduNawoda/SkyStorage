import { useState } from "react";
import FolderCard from "./FolderCard";
import FileTable from "./FileTable";
import back from "../assets/icons/back-button.png"

type FolderItem = {
  id: string;
  name: string;
  files: number;
  size: string;
};

type FileItem = {
  id?: string;
  name: string;
  size: string;
  lastModified: string;
  dateShared?: string;
  people?: { email: string }[];
  message?: string;
};

type Props = {
  title: string;
  folders: FolderItem[];
  files: FileItem[];
  onBack: () => void;

  editingFolderId?: string | null;
  onRenameFolder?: (id: string, newName: string) => void;
  onCancelFolderEdit?: (id: string) => void;
  onRequestRenameFolder?: (id: string) => void;

  editingFileName?: string | null;
  onRenameFile?: (oldName: string, newName: string) => void;
  onCancelFileEdit?: () => void;
  onRequestRenameFile?: (name: string) => void;
  onCutFile?: (file: any) => void;
  onCopyFile?: (file: any) => void;

  favorites: any[];
  onToggleFavorite: (item: any) => void;
  favoriteFolderIds?: string[];
  onToggleFavoriteFolder?: (folder: FolderItem) => void;

  deletedFiles: any[];
  onToggleDelete: (item: any) => void;
  deletedFolderIds?: string[];
  onToggleDeleteFolder?: (folder: FolderItem) => void;

  onShare?: (payload: any) => void;
  onShareFolder?: (folder: FolderItem) => void;
  onDownloadFile?: (file: any) => void;

  onCutFolder?: (folder: FolderItem) => void;
  onCopyFolder?: (folder: FolderItem) => void;
  onPasteIntoFolder?: (folderId: string) => void;
  isPasteValidForFolder?: (folderId: string) => boolean;

  onOpenFolder?: (folder: FolderItem) => void;
  onFolderDownload?: (folder: FolderItem) => void;
  onFolderProperties?: (folder: FolderItem) => void;

  isShared?: boolean;

  // Select mode
  selectMode?: boolean;
  selectedFolderIds?: string[];
  selectedFileIds?: string[];
  onToggleSelectFolder?: (id: string) => void;
  onToggleSelectFile?: (id: string) => void;
  onBulkRightClick?: (x: number, y: number) => void;
  selectedCount?: number;
  onEmptyRecycleBin?: () => void;
};

export default function FolderAndFilesPage({
  title,
  folders,
  files,
  onBack,
  editingFolderId = null,
  onRenameFolder,
  onCancelFolderEdit,
  onRequestRenameFolder,
  editingFileName = null,
  onRenameFile,
  onCancelFileEdit,
  onRequestRenameFile,
  onCutFile,
  onCopyFile,
  favorites,
  onToggleFavorite,
  favoriteFolderIds = [],
  onToggleFavoriteFolder,
  deletedFiles,
  onToggleDelete,
  deletedFolderIds = [],
  onToggleDeleteFolder,
  onShare,
  onShareFolder,
  onDownloadFile,
  onCutFolder,
  onCopyFolder,
  onPasteIntoFolder,
  isPasteValidForFolder,
  onOpenFolder,
  onFolderDownload,
  onFolderProperties,
  isShared = false,
  selectMode = false,
  selectedFolderIds = [],
  selectedFileIds = [],
  onToggleSelectFolder,
  onToggleSelectFile,
  onBulkRightClick,
  selectedCount = 0,
  onEmptyRecycleBin,
}: Props) {
  const [showAllFolders, setShowAllFolders] = useState(false);
  const [showAllFiles, setShowAllFiles] = useState(false);

  const displayedFolders = showAllFolders ? folders : folders.slice(0, 4);
  const displayedFiles = showAllFiles ? files : files.slice(0, 4);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-blue-600 text-sm font-medium">
          <img src={back} alt="Back" className="w-12 h-12" />
        </button>
        <h2 className="text-xl font-bold flex-1">{title}</h2>
        {onEmptyRecycleBin && (
          <button
            onClick={(e) => { e.stopPropagation(); onEmptyRecycleBin(); }}
            className="text-sm px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 font-medium transition"
          >
            Empty Recycle Bin
          </button>
        )}
      </div>

      {folders.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Folders</h3>
            <button
              className={`text-sm font-medium ${folders.length <= 4 ? "text-gray-400" : "text-blue-600"}`}
              onClick={() => setShowAllFolders(!showAllFolders)}
              disabled={folders.length <= 4}
            >
              {showAllFolders ? "View Less" : "View All"}
            </button>
          </div>
          <div className="grid grid-cols-4 gap-6 mb-10">
            {displayedFolders.map((f) => (
              <FolderCard
                key={f.id}
                id={f.id}
                domId={`folder-card-${f.id}`}
                name={f.name}
                files={f.files}
                size={f.size}
                isEditing={editingFolderId === f.id}
                onRename={onRenameFolder}
                onCancelEdit={onCancelFolderEdit}
                onRequestRename={() => onRequestRenameFolder?.(f.id)}
                onOpen={() => onOpenFolder?.(f)}
                isFavorite={favoriteFolderIds.includes(f.id)}
                isDeleted={deletedFolderIds.includes(f.id)}
                onToggleFavorite={() => onToggleFavoriteFolder?.(f)}
                onToggleDelete={() => onToggleDeleteFolder?.(f)}
                onDownload={() => onFolderDownload?.(f)}
                onShare={() => onShareFolder?.(f)}
                onProperties={() => onFolderProperties?.(f)}
                onCut={() => onCutFolder?.(f)}
                onCopy={() => onCopyFolder?.(f)}
                onPaste={() => onPasteIntoFolder?.(f.id)}
                canPaste={isPasteValidForFolder ? isPasteValidForFolder(f.id) : false}
                selectMode={selectMode}
                isSelected={selectedFolderIds.includes(f.id)}
                onToggleSelect={() => onToggleSelectFolder?.(f.id)}
                onBulkRightClick={onBulkRightClick}
                selectedCount={selectedCount}
              />
            ))}
          </div>
        </>
      )}

      {files.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Files</h3>
            <button
              className={`text-sm font-medium ${files.length <= 4 ? "text-gray-400" : "text-blue-600"}`}
              onClick={() => setShowAllFiles(!showAllFiles)}
              disabled={files.length <= 4}
            >
              {showAllFiles ? "View Less" : "View All"}
            </button>
          </div>
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-700 text-white">
              <tr>
                {selectMode && <th className="px-2 py-2 w-[36px]" />}
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Size</th>
                <th className="px-4 py-2">{isShared ? "Date Shared" : "Last Modified"}</th>
                <th className="px-4 py-2 text-center">Members</th>
                {isShared && <th className="px-4 py-2">Message</th>}
              </tr>
            </thead>
            <tbody>
              {displayedFiles.map((file) => (
                <FileTable
                  key={file.id ?? file.name}
                  {...file}
                  domId={`file-row-${file.id ?? file.name}`}
                  isFavorite={favorites.some((fv) => fv.name === file.name)}
                  onToggleFavorite={() => onToggleFavorite(file)}
                  isDeleted={deletedFiles.some((d) => d.name === file.name)}
                  onToggleDelete={() => onToggleDelete(file)}
                  onShare={onShare}
                  onDownload={() => onDownloadFile?.(file)}
                  isShared={isShared}
                  isEditing={editingFileName === file.name}
                  onRename={(newName) => onRenameFile?.(file.name, newName)}
                  onCancelEdit={onCancelFileEdit}
                  onRequestRename={() => onRequestRenameFile?.(file.name)}
                  onCut={() => onCutFile?.(file)}
                  onCopy={() => onCopyFile?.(file)}
                  selectMode={selectMode}
                  isSelected={selectedFileIds.includes(file.id ?? file.name)}
                  onToggleSelect={() => onToggleSelectFile?.(file.id ?? file.name)}
                  onBulkRightClick={onBulkRightClick}
                  selectedCount={selectedCount}
                />
              ))}
            </tbody>
          </table>
        </>
      )}

      {folders.length === 0 && files.length === 0 && (
        <div className="text-gray-400 text-sm">Nothing here yet.</div>
      )}
    </div>
  );
}
