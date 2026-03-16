import { useState } from "react";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import FolderCard from "./components/FolderCard";
import FileTable from "./components/FileTable";
import StorageSummary from "./components/StorageSummary";
import FilesRow from "./components/FilesRow";
import FoldersPage from "./components/FoldersPage";
import FilesPage from "./components/FilesPage";
import DeepClean from "./components/DeepClean";
import Settings from "./components/SettingsPage/index";
import { formatDate } from "./utils/formatDate"; 

/*type ShareInfo = {
  people: { email: string; role: string }[]
  message?: string
  dateShared: string
}*/

export default function App() {

const [view, setView] = useState<"dashboard"|"deep_clean" | "settings"|"shared"|"favorites"|"deletedFiles"| "folders" | "files">("dashboard")
//const [sharedMap, setSharedMap] = useState<Record<string, ShareInfo>>({})
const [sharedFiles, setSharedFiles] = useState<any[]>([])
  const [favorites, setFavorites] = useState<any[]>([])
  const [deletedFiles, deleteFiles]=useState<any[]>([])

const toggleFavorite = (file: any) => {
  setFavorites(prev =>
    prev.some(f => f.name === file.name)
      ? prev.filter(f => f.name !== file.name)
      : [...prev, file]
  )
}

const toggleDelete =(file :any)=>{
  deleteFiles(prev =>
    prev.some(f => f.name === file.name)
    ?prev.filter(f => f.name !== file.name)
    : [...prev,file]
  )

}

const handleShare = (payload: any) => {
  const originalFile = files.find(f => f.name === payload.name)
  if (!originalFile) return

  const sharedFile = {
    ...originalFile,     // size + lastModified
    ...payload,          // people, message, dateShared
    dateShared: formatDate(payload.dateShared) // Format the ISO string
  }

  setSharedFiles(prev => {
    const exists = prev.some(f => f.name === payload.name)

  setSharedFiles(prev => {
    const exists = prev.some(f => f.name === payload.name)
    return exists
      ? prev.map(f => f.name === payload.name ? sharedFile : f)
      : [...prev, sharedFile]
  })

    return exists
      ? prev.map(f => f.name === payload.name ? sharedFile : f)
      : [...prev, sharedFile]
  })
  
  // Also update the original file in favorites if it exists there
  setFavorites(prev => 
    prev.map(f => f.name === payload.name 
      ? { ...f, ...payload }
      : f
    )
  )
}

const getMergedFile = (file: any) => {
  // Find if this file exists in sharedFiles
  const sharedFile = sharedFiles.find(sf => sf.name === file.name);
  // If found, merge the shared data with the original file
  return sharedFile ? { ...file, ...sharedFile } : file;
};



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
    <div className="flex h-screen overflow-hidden">
<Sidebar activeView={view} onNavigate={(v) => setView(v)} />


      <div className="flex-1 overflow-y-auto p-6 bg-[#FAFAFA]">
        {view !== "settings" && (<TopBar />)}
{view !== "settings" && (
  <FilesRow
    files={
      view === "favorites"
        ? favorites.map(f => getMergedFile(f))
        : view === "deletedFiles"
        ? deletedFiles
        : view === "shared"
        ? sharedFiles
        : files.map(f => getMergedFile(f))
    }
  />
)}


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
              <th className="px-4 py-2 text-center ">Members</th>
            </tr>
          </thead>
{/* Dashboard files section */}

<tbody>
  {files
    .filter(f => !deletedFiles.some(d => d.name === f.name))
    .slice(0, 4)
    .map((file) => {
      const mergedFile = getMergedFile(file);
      return (
        <FileTable
          key={mergedFile.name}
          {...mergedFile} // Pass the merged file data
          isFavorite={favorites.some(f => f.name === mergedFile.name)}
          onToggleFavorite={() => toggleFavorite(mergedFile)}
          isDeleted={deletedFiles.some(f => f.name === mergedFile.name)}
          onToggleDelete={() => toggleDelete(mergedFile)}
          onShare={handleShare}
        />
      );
    })}
</tbody>


        </table>
          </>
        )}

        
{view === "folders" && (
  <FoldersPage folders={folders} onBack={() => setView("dashboard")} />
)}

{view === "files" && (
  <FilesPage
    files={files.map(file => getMergedFile(file))} // Use merged files
    onBack={() => setView("dashboard")}
    onToggleFavorite={toggleFavorite}
    favorites={favorites}
    onToggleDelete={toggleDelete}
    deletedFiles={deletedFiles}
    title="Files"
    onShare={handleShare}
  />
)}

{view === "favorites" && (
  <FilesPage
    files={favorites.map(file => getMergedFile(file))} // Use merged favorites
    onBack={() => setView("dashboard")}
    onToggleFavorite={toggleFavorite}
    favorites={favorites}
    onToggleDelete={toggleDelete}
    deletedFiles={deletedFiles}
    title="Favorites"
    onShare={handleShare}
  />
)}
{view === "shared" && (
  <FilesPage
    files={sharedFiles.filter(f => !deletedFiles.some(d => d.name === f.name))}
    onBack={() => setView("dashboard")}
    onToggleFavorite={toggleFavorite}
    favorites={favorites}
    onToggleDelete={toggleDelete}
    deletedFiles={deletedFiles}
    onShare={handleShare}
    title="Shared"
  />
)}

{view === "deletedFiles" && (
  <FilesPage
    files={deletedFiles}
    onBack={() => setView("dashboard")}
    onToggleFavorite={toggleFavorite}
    favorites={favorites.filter(f => !deletedFiles.some(d => d.name === f.name))}
    onToggleDelete={toggleDelete}
    deletedFiles={deletedFiles}
    title="Deleted Files"
  />
)}

{view === "settings" && (
  <Settings onBack={() => setView("dashboard")} />
)} 

{view === "deep_clean" && (
  <DeepClean 
  onBack={() => setView("dashboard")} 
  />
)}





      </div>

      {view !== "settings" && (
  <div className="w-1/4 p-6 bg-white flex flex-col gap-6 overflow-y-auto flex-shrink-0">
    <StorageSummary />
  </div>
)}
    </div>
  );
}
