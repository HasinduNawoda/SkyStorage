import FolderCard from "./FolderCard";
import FileTable from "./FileTable";
import back from "../assets/icons/back-button.png";

type Props = {
  folderName: string;
  folders: any[];
  files: any[];
  onBack: () => void;
  onOpenFolder: (folder: any) => void;
  editingFolderId: string | null;
  onRenameFolder: (id: string, newName: string) => void;
  onCancelFolderEdit: (id: string) => void;
  onRequestRenameFolder: (id: string) => void;
  onCutFolder?: (folder: any) => void;
  onCopyFolder?: (folder: any) => void;
  onPasteIntoFolder?: (folderId: string) => void;
  isPasteValidForFolder?: (folderId: string) => boolean;
  favorites: any[];
  onToggleFavorite: (file: any) => void;
  deletedFiles: any[];
  onToggleDelete: (file: any) => void;
  onShare: (payload: any) => void;
  editingFileName: string | null;
  onRenameFile: (oldName: string, newName: string) => void;
  onCancelFileEdit: () => void;
  onRequestRenameFile: (name: string) => void;
  onCutFile?: (file: any) => void;
  onCopyFile?: (file: any) => void;
};

export default function FolderView({
  folderName,
  folders,
  files,
  onBack,
  onOpenFolder,
  editingFolderId,
  onRenameFolder,
  onCancelFolderEdit,
  onRequestRenameFolder,
  onCutFolder,
  onCopyFolder,
  onPasteIntoFolder,
  isPasteValidForFolder,
  favorites,
  onToggleFavorite,
  deletedFiles,
  onToggleDelete,
  onShare,
  editingFileName,
  onRenameFile,
  onCancelFileEdit,
  onRequestRenameFile,
  onCutFile,
  onCopyFile,
}: Props) {
  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <button onClick={onBack} className="text-sm text-blue-600 font-medium">
          <img src={back} alt="Back" className="w-12 h-12" />
        </button>
        <h2 className="text-xl font-bold">{folderName}</h2>
      </div>

      {/* Subfolders */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Folders</h3>
      </div>
      {folders.length === 0 ? (
        <p className="text-sm text-gray-400 mb-10">No folders here yet.</p>
      ) : (
        <div className="grid grid-cols-4 gap-6 mb-10">
          {folders.map((f) => (
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
              onRequestRename={() => onRequestRenameFolder(f.id)}
              onOpen={() => onOpenFolder(f)}
              onCut={() => onCutFolder?.(f)}
              onCopy={() => onCopyFolder?.(f)}
              onPaste={() => onPasteIntoFolder?.(f.id)}
              canPaste={isPasteValidForFolder ? isPasteValidForFolder(f.id) : false}
            />
          ))}
        </div>
      )}

      {/* Files in this folder */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Files</h3>
      </div>
      {files.length === 0 ? (
        <p className="text-sm text-gray-400">No files here yet. Use "Create New" to upload one.</p>
      ) : (
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-700 text-white">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Size</th>
              <th className="px-4 py-2">Last Modified</th>
              <th className="px-4 py-2 text-center ">Members</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <FileTable
                key={file.id ?? file.name}
                {...file}
                domId={`file-row-${file.id ?? file.name}`}
                isFavorite={favorites.some(f => f.name === file.name)}
                onToggleFavorite={() => onToggleFavorite(file)}
                isDeleted={deletedFiles.some(f => f.name === file.name)}
                onToggleDelete={() => onToggleDelete(file)}
                onShare={onShare}
                isEditing={editingFileName === file.name}
                onRename={(newName) => onRenameFile(file.name, newName)}
                onCancelEdit={onCancelFileEdit}
                onRequestRename={() => onRequestRenameFile(file.name)}
                onCut={() => onCutFile?.(file)}
                onCopy={() => onCopyFile?.(file)}
              />
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}