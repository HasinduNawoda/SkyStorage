import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import FolderCard from "./components/FolderCard";
import FileTable from "./components/FileTable";
import StorageSummary from "./components/StorageSummary";
import FilesRow from "./components/FilesRow";

export default function App() {
  const folders = [
    { name: "Behance Posts", files: 29, size:"1000 MB" },
    { name: "Illustrations", files: 36, size:"800 MB" },
    { name: "Icons", files: 123, size:"1300 MB" },
    { name: "Mockups", files: 7343, size:"3000 MB" },
  ];

  const files = [
    { name: "Proposal.docx", size: "2.9 MB", lastModified: "Sep 25, 2021", icon: "📄" },
    { name: "Background.jpg", size: "3.5 MB", lastModified: "Sep 24, 2021", icon: "🖼️" },
    { name: "E-Wallet App.fig", size: "23.2 MB", lastModified: "Sep 20, 2021", icon: "🎨" },
  ];

  return (
    <div className="flex h-screen">
      <Sidebar />

      <div className="flex-1 p-6 bg-[#FAFAFA]" >
        <TopBar />
        <FilesRow />

<div className="flex items-center justify-between mb-4">
  <h2 className="text-xl font-bold">Folders</h2>
  <button className="text-sm text-blue-600 font-medium">View All</button>
</div>

<div className="grid grid-cols-4 gap-6 mb-16">


          {folders.map((f, idx) => (
            <FolderCard key={idx} name={f.name} files={f.files} size={f.size} />
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
  <h2 className="text-xl font-bold">Files</h2>
  <button className="text-sm text-blue-600 font-medium">View All</button>
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
              <FileTable key={idx} {...file} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="w-1/4 p-6 bg-white flex flex-col gap-6">
        <StorageSummary />
      </div>
    </div>
  );
}
