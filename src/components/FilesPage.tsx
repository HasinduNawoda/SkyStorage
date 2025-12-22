import FileTable from "./FileTable";
import back from "../assets/icons/back-button.png";



type Props = {
  files: any[]
  onBack: () => void
  title: string
  onToggleFavorite: (file: any) => void
  favorites: any[]
}


export default function FilesPage({ files,onBack,favorites,onToggleFavorite,title }: Props) {
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
  {files.map((file, idx) => (
    <FileTable
      key={idx}
      {...file}
      isFavorite={favorites.some(f => f.name === file.name)}
      onToggleFavorite={() => onToggleFavorite(file)}
    />
  ))}
</tbody>

      </table>
    </>
  );
}
