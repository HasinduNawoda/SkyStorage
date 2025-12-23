import FileTable from "./FileTable";
import back from "../assets/icons/back-button.png";

type Props = {
  files: any[]
  onBack: () => void
  title: string
  onToggleFavorite: (file: any) => void
  favorites: any[]
  onToggleDelete: (file: any) => void
  deletedFiles: any[]
}

export default function FilesPage({ files, onBack, favorites, onToggleFavorite, deletedFiles, onToggleDelete, title }: Props) {
  // Filter out deleted files from active files/favorites
  const activeFiles = files.filter(file => !deletedFiles.some(f => f.name === file.name));
  const activeFavorites = favorites.filter(file => !deletedFiles.some(f => f.name === file.name));

  // Determine which list to render based on title
  const listToRender = title === "Deleted Files" ? deletedFiles : (title === "Favorites" ? activeFavorites : activeFiles);

  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={onBack}
          className="text-sm text-blue-600 font-medium"
        >
          <img src={back} alt="Back" className="w-12 h-12" />
        </button>
        <h2 className="text-xl font-bold">{title}</h2>
      </div>

      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-700 text-white">
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Size</th>
            <th className="px-4 py-2">Last Modified</th>
            <th className="px-4 py-2">Members</th>
          </tr>
        </thead>
        <tbody>
          {listToRender.map((file) => (
            <FileTable
              key={file.name} // Use name as unique key
              {...file}
              isFavorite={favorites.some(f => f.name === file.name)}
              onToggleFavorite={() => onToggleFavorite(file)}
              isDeleted={deletedFiles.some(f => f.name === file.name)}
              onToggleDelete={() => onToggleDelete(file)}
            />
          ))}
        </tbody>
      </table>
    </>
  );
}
