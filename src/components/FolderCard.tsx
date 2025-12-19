import folder from "../assets/icons/folder.png";

type FolderCardProps = {
  name: string;
  files: number;
  size: string;
};

export default function FolderCard({ name, files, size }: FolderCardProps) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition flex flex-col gap-3">
      
      {/* Icon + menu */}
      <div className="flex items-center justify-between">
          <img src={folder} alt="Folder Icon" className="w-15 h-15" />
        <span className="text-gray-400 cursor-pointer">•••</span>
      </div>

      {/* Text */}
      <div>
        <div className="font-semibold text-sm">{name}</div>
        <div className="text-xs text-gray-500">{files} files</div>
        <div className="text-xs text-gray-500">{size}</div>
      </div>

    </div>
  );
}
