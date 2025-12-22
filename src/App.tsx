import { useState } from "react";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import FolderCard from "./components/FolderCard";
import FileTable from "./components/FileTable";
import StorageSummary from "./components/StorageSummary";
import FilesRow from "./components/FilesRow";
import FoldersPage from "./components/FoldersPage";
import FilesPage from "./components/FilesPage";

export default function App() {
  const [view, setView] = useState<"dashboard" | "folders" | "files" | "favorites">("dashboard")

  const [favorites, setFavorites] = useState<any[]>([])

const toggleFavorite = (file: any) => {
  setFavorites(prev =>
    prev.some(f => f.name === file.name)
      ? prev.filter(f => f.name !== file.name)
      : [...prev, file]
  )
}


  const folders = [
    { name: "Behance Posts", files: 29, size:"1000 MB" },
    { name: "Illustrations", files: 36, size:"800 MB" },
    { name: "Icons", files: 123, size:"1300 MB" },
    { name: "Mockups", files: 7343, size:"3000 MB" },
  ];

  const files = [
    { name: "Proposal.docx", size: "2.9 MB", lastModified: "Sep 25, 2021"},
    { name: "Background.jpg", size: "3.5 MB", lastModified: "Sep 24, 2021" },
    { name: "E-Wallet App.fig", size: "23.2 MB", lastModified: "Sep 20, 2021"},
    { name: "Meeting Recording.mp4", size: "120 MB", lastModified: "Sep 18, 2021"},
    { name: "Podcast Episode.mp3", size: "45 MB", lastModified: "Sep 15, 2021"},
    { name: "Project Plan.pdf", size: "5.6 MB", lastModified: "Sep 10, 2021"},
    {name: "DesignMockup.psd", size: "15 MB", lastModified: "Sep 8, 2021"},
    {name: "TeamPhoto.png", size: "4.2 MB", lastModified: "Sep 5, 2021"},
    {name: "FinancialReport.xlsx", size: "8.3 MB", lastModified: "Sep 2, 2021"},
    {name: "ClientPresentation.pptx", size: "12.7 MB", lastModified: "Aug 30, 2021"},
    {name: "Wala Pojja.mp4", size:"400 MB", lastModified: "Aug 07 2025"}
  ];

  return (
    <div className="flex h-screen">
<Sidebar onNavigate={(v) => setView(v)} />

      <div className="flex-1 p-6 bg-[#FAFAFA]">
        <TopBar />
        <FilesRow files={view === "favorites" ? favorites : files} />


        {view === "dashboard" && (
          <>
            {/* Dashboard folders section */}
<div className="flex items-center justify-between mb-4">
  <h2 className="text-xl font-bold">Folders</h2>
              <button className="text-sm text-blue-600 font-medium" onClick={() => setView("folders")}>View All</button>
</div>
<div className="grid grid-cols-4 gap-6 mb-16">
          {folders.map((f, idx) => (
            <FolderCard key={idx} name={f.name} files={f.files} size={f.size} />
          ))}
        </div>

            {/* Dashboard files section */}
        <div className="flex items-center justify-between mb-4">
  <h2 className="text-xl font-bold">Files</h2>
              <button className="text-sm text-blue-600 font-medium" onClick={() => setView("files")}>View All</button>
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
  {files.slice(0, 4).map((file, idx) => (
    <FileTable
      key={idx}
      {...file}
      isFavorite={favorites.some(f => f.name === file.name)}
      onToggleFavorite={() => toggleFavorite(file)}
    />
            ))}
          </tbody>

        </table>
          </>
        )}

        
{view === "folders" && (
  <FoldersPage folders={folders} onBack={() => setView("dashboard")} />
)}

{view === "files" && (
  <FilesPage
    files={files}
    onBack={() => setView("dashboard")}
    onToggleFavorite={toggleFavorite}
    favorites={favorites}
    title="Files"
  />
)}

{view === "favorites" && (
  <FilesPage
    files={favorites}
    onBack={() => setView("dashboard")}
    onToggleFavorite={toggleFavorite}
    favorites={favorites}
    title="Favourites"
  />
)}



      </div>

      <div className="w-1/4 p-6 bg-white flex flex-col gap-6">
        <StorageSummary />
      </div>
    </div>
  );
}
