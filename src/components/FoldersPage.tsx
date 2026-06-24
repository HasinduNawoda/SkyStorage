import FolderCard from "./FolderCard";
import back from "../assets/icons/back-button.png";

type Props = {
  folders: any[];
  onBack: () => void;
  editingFolderId: string | null;
  onRename: (id: string, newName: string) => void;
  onCancelEdit: (id: string) => void;
  onOpenFolder: (folder: any) => void;
};

export default function FoldersPage({
  folders,
  onBack,
  editingFolderId,
  onRename,
  onCancelEdit,
  onOpenFolder,
}: Props) {
  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <button onClick={onBack} className="text-sm text-blue-600 font-medium">
          <img src={back} alt="Back" className="w-12 h-12" />
        </button>
        <h2 className="text-xl font-bold">Folders</h2>
      </div>
      <div className="grid grid-cols-4 gap-6">
        {folders.map((f) => (
          <FolderCard
            key={f.id}
            id={f.id}
            domId={`folder-card-${f.id}`}
            name={f.name}
            files={f.files}
            size={f.size}
            isEditing={editingFolderId === f.id}
            onRename={onRename}
            onCancelEdit={onCancelEdit}
            onOpen={() => onOpenFolder(f)}
          />
        ))}
      </div>
    </>
  );
}