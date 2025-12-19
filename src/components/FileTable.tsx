type FileRowProps = {
  name: string;
  size: string;
  lastModified: string;
  members?: string;
  icon: string;
};

export default function FilesTable({ name, size, lastModified, members, icon }: FileRowProps) {
  return (
    <tr className="hover:bg-gray-100 cursor-pointer">
      <td className="px-4 py-2 flex items-center gap-2">{icon} {name}</td>
      <td className="px-4 py-2">{size}</td>
      <td className="px-4 py-2">{lastModified}</td>
      <td className="px-4 py-2">{members || "-"}</td>
    </tr>
  );
}
