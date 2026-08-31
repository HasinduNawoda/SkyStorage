import { useState, useEffect, useRef, useCallback } from "react";
import { computeStorageStats } from "./utils/storageStats";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import AddressBar from "./components/AddressBar";
import FolderCard from "./components/FolderCard";
import FileTable from "./components/FileTable";
import StorageSummary from "./components/StorageSummary";
import UploadModal from "./components/UploadModal";
import FilesRow from "./components/FilesRow";
import FoldersPage from "./components/FoldersPage";
import FilesPage from "./components/FilesPage";
import FolderAndFilesPage from "./components/FolderAndFilesPage";
import FolderView from "./components/FolderView";
import DeepClean from "./components/DeepClean";
import Settings from "./components/SettingsPage/index";
import ShareModal from "./components/ShareModal";
import ContextMenu from "./components/ContextMenu";
import BulkMenu from "./components/BulkMenu";
import SelectionOverlay from "./components/SelectionOverlay";
import AuthPage, { type LoginPayload, type SignUpPayload } from "./components/Auth/AuthPage";
import { formatDate } from "./utils/formatDate";
import {
  getSession,
  login,
  signUp,
  logout,
  getAllFolders,
  createFolder,
  updateFolder,
  deleteFolder,
  getAllFiles,
  createFile,
  updateFile,
  deleteFile,
  uploadFileBytes,
  createShare,
  getSharesWithMe,
  getMyShares,
} from "./utils/api";
import { downloadSingleFile, downloadFilesAsZip, type DownloadableFile } from "./utils/downloadUtils";
import { type FileSearchItem } from "./components/FileSearchBar";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ClipboardState = {
  folderIds: string[];
  fileIds: string[];
  mode: "cut" | "copy";
} | null;

export default function App() {
  // ----- Auth -----
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    getSession().then((session) => {
      setIsAuthenticated(!!session);
      setAuthChecked(true);
    });
  }, []);

  const handleLogin = async (payload: LoginPayload) => {
    await login(payload.email, payload.password);
    setIsAuthenticated(true);
  };

  const handleSignUp = async (payload: SignUpPayload) => {
    await signUp(payload.name, payload.email, payload.password);
    setIsAuthenticated(true);
  };

  const handleSignOut = async () => {
    await logout().catch(console.error);
    setIsAuthenticated(false);
    setFolderStack([]);
    setFolders([]);
    setFiles([]);
    setSharedFiles([]);
    setSharedFolders([]);
    setFavorites([]);
    setFavoriteFolderIds([]);
    deleteFiles([]);
    setDeletedFolderIds([]);
  };

  // Load folders & files from Postgres when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    Promise.all([getAllFolders(), getAllFiles(), getSharesWithMe(), getMyShares()]).then(([apiFolders, apiFiles, apiSharesWithMe, apiMyShares]) => {
      setFolders(
        apiFolders.map((f) => ({
          id: f.id,
          name: f.name,
          parentId: f.parentId,
          files: 0,
          size: "0 MB",
        }))
      );
      setFavoriteFolderIds(apiFolders.filter((f) => f.isFavorite).map((f) => f.id));
      setDeletedFolderIds(apiFolders.filter((f) => f.deletedAt).map((f) => f.id));

      setFiles(
        apiFiles.map((f) => ({
          id: f.id,
          name: f.name,
          size: `${(f.sizeBytes / (1024 * 1024)).toFixed(2)} MB`,
          lastModified: new Date(f.createdAt).toLocaleDateString(),
          folderId: f.folderId,
        }))
      );

      setFavorites(
        apiFiles.filter((f) => f.isFavorite && !f.deletedAt).map((f) => ({
          id: f.id,
          name: f.name,
          size: `${(f.sizeBytes / (1024 * 1024)).toFixed(2)} MB`,
          lastModified: new Date(f.createdAt).toLocaleDateString(),
          folderId: f.folderId,
        }))
      );

      deleteFiles(
        apiFiles.filter((f) => f.deletedAt).map((f) => ({
          id: f.id,
          name: f.name,
          size: `${(f.sizeBytes / (1024 * 1024)).toFixed(2)} MB`,
          lastModified: new Date(f.createdAt).toLocaleDateString(),
          folderId: f.folderId,
          wasFavorite: f.isFavorite,
        }))
      );

      // --- Process Shares ---
      // Group my shares by file
      const mySharedFilesMap = new Map<string, any>();
      apiMyShares.filter(s => s.file).forEach(s => {
        if (!mySharedFilesMap.has(s.file!.id)) {
          mySharedFilesMap.set(s.file!.id, {
            id: s.file!.id,
            name: s.file!.name,
            size: `${(s.file!.sizeBytes / (1024 * 1024)).toFixed(2)} MB`,
            lastModified: new Date(s.file!.createdAt).toLocaleDateString(),
            folderId: s.file!.folderId,
            dateShared: new Date(s.createdAt).toLocaleDateString(),
            ownerName: "Me",
            ownerEmail: "",
            message: s.message || undefined,
            people: [],
          });
        }
        const fileObj = mySharedFilesMap.get(s.file!.id);
        fileObj.people.push({ email: s.sharedWith, role: s.role });
      });

      // Group my shares by folder
      const mySharedFoldersMap = new Map<string, any>();
      apiMyShares.filter(s => s.folder).forEach(s => {
        if (!mySharedFoldersMap.has(s.folder!.id)) {
          mySharedFoldersMap.set(s.folder!.id, {
            id: s.folder!.id,
            name: s.folder!.name,
            parentId: s.folder!.parentId,
            files: 0,
            size: "0 MB",
            dateShared: new Date(s.createdAt).toLocaleDateString(),
            ownerName: "Me",
            ownerEmail: "",
            message: s.message || undefined,
            people: [],
          });
        }
        const folderObj = mySharedFoldersMap.get(s.folder!.id);
        folderObj.people.push({ email: s.sharedWith, role: s.role });
      });

      // Populate sharedFiles with files shared WITH this user AND BY this user
      setSharedFiles([
        ...apiSharesWithMe.filter(s => s.file).map(s => ({
          id: s.file!.id,
          name: s.file!.name,
          size: `${(s.file!.sizeBytes / (1024 * 1024)).toFixed(2)} MB`,
          lastModified: new Date(s.file!.createdAt).toLocaleDateString(),
          folderId: s.file!.folderId,
          dateShared: new Date(s.createdAt).toLocaleDateString(),
          ownerName: s.owner?.name,
          ownerEmail: s.owner?.email,
          shareId: s.id,
          message: s.message || undefined,
          people: s.owner ? [{ email: s.owner.email, role: "Owner" }] : [],
        })),
        ...Array.from(mySharedFilesMap.values())
      ]);

      // Populate sharedFolders with folders shared WITH this user AND BY this user
      setSharedFolders([
        ...apiSharesWithMe.filter(s => s.folder).map(s => ({
          id: s.folder!.id,
          name: s.folder!.name,
          parentId: s.folder!.parentId,
          files: 0,
          size: "0 MB",
          dateShared: new Date(s.createdAt).toLocaleDateString(),
          ownerName: s.owner?.name,
          ownerEmail: s.owner?.email,
          shareId: s.id,
          message: s.message || undefined,
          people: s.owner ? [{ email: s.owner.email, role: "Owner" }] : [],
        })),
        ...Array.from(mySharedFoldersMap.values())
      ]);

    }).catch((err) => console.error("Data load error:", err));
  }, [isAuthenticated]);

  const [view, setView] = useState<
    "dashboard" | "deep_clean" | "settings" | "shared" | "favorites" | "deletedFiles" | "folders" | "files"
  >("dashboard");

  const [settingsTarget, setSettingsTarget] = useState<
    { page: string; section: string; label: string } | null
  >(null);

  /** Navigate into Settings, optionally deep-linking to a specific page/section (used by the user menu). */
  const openSettings = (page: string, section = "", label = "") => {
    setSettingsTarget({ page, section, label });
    setView("settings");
  };

  const [sharedFiles, setSharedFiles] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [deletedFiles, deleteFiles] = useState<any[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  // Tracks a folder that was just created (still blank / unnamed) so that
  // cancelling its rename discards it, instead of discarding an existing
  // folder whose name the user is merely editing via "Rename".
  const [newFolderId, setNewFolderId] = useState<string | null>(null);
  const [editingFileName, setEditingFileName] = useState<string | null>(null);

  // ----- Folder-level favorite/delete/share state -----
  const [favoriteFolderIds, setFavoriteFolderIds] = useState<string[]>([]);
  const [deletedFolderIds, setDeletedFolderIds] = useState<string[]>([]);
  const [sharedFolders, setSharedFolders] = useState<any[]>([]);

  // ----- Select mode -----
  const [selectMode, setSelectMode] = useState(false);
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([]);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);

  // ----- Folder share modal -----
  const [folderShareTarget, setFolderShareTarget] = useState<{ id: string; name: string } | null>(null);

  // ----- Clipboard (now handles both folders and files) -----
  const [clipboard, setClipboard] = useState<ClipboardState>(null);

  // ----- Right-click context menu (mid-section empty space) -----
  const [contextMenu, setContextMenu] = useState<{ open: boolean; x: number; y: number }>({
    open: false,
    x: 0,
    y: 0,
  });

  // ----- Bulk right-click menu (right-click on a selected item) -----
  const [bulkMenu, setBulkMenu] = useState<{ x: number; y: number } | null>(null);

  // ----- Marquee drag: suppress context menu if the right-click involved movement -----
  const dragOccurred = useRef(false);

  // ----- Folder navigation -----
  const [folderStack, setFolderStack] = useState<{ id: string; name: string }[]>([]);
  const currentFolderId = folderStack.length
    ? folderStack[folderStack.length - 1].id
    : null;

  const openFolder = (folder: any) => {
    setFolderStack((prev) => [...prev, { id: folder.id, name: folder.name }]);
  };

  const goBackOneFolder = () => {
    setFolderStack((prev) => prev.slice(0, -1));
  };

  /** AddressBar: jump back to the top of the current section (e.g. "Recycle Bin"). */
  const navigateToSectionRoot = () => {
    setFolderStack([]);
  };

  /** AddressBar: jump to a specific depth in the folder trail, dropping everything after it. */
  const navigateToFolderDepth = (index: number) => {
    setFolderStack((prev) => prev.slice(0, index + 1));
  };

  const handleNavigate = (v: typeof view) => {
    setFolderStack([]);
    setView(v);
    exitSelectMode();
  };

  // ---------------------------------------------------------------------------
  // Folders & Files state
  // ---------------------------------------------------------------------------

  const [folders, setFolders] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);

  // ---------------------------------------------------------------------------
  // Cascade helpers
  // ---------------------------------------------------------------------------

  const getDescendantFolderIds = (rootId: string): string[] => {
    const result: string[] = [];
    const walk = (parentId: string) => {
      folders
        .filter((f) => f.parentId === parentId)
        .forEach((child) => {
          result.push(child.id);
          walk(child.id);
        });
    };
    walk(rootId);
    return result;
  };

  const getDescendantFiles = (rootId: string) => {
    const folderIds = new Set([rootId, ...getDescendantFolderIds(rootId)]);
    return files.filter((f) => f.folderId && folderIds.has(f.folderId));
  };

  // ---------------------------------------------------------------------------
  // Downloads (single file / folder-as-zip / bulk selection-as-zip)
  // ---------------------------------------------------------------------------

  /** Builds the folder-path prefix (relative to `rootId`) a descendant file should sit under inside a zip. */
  const getRelativePathInsideFolder = (rootId: string, fileFolderId: string | null): string => {
    if (fileFolderId === rootId || fileFolderId === null) return "";
    const segments: string[] = [];
    let current: string | null = fileFolderId;
    while (current && current !== rootId) {
      const f = folders.find((fo) => fo.id === current);
      if (!f) break;
      segments.unshift(f.name);
      current = f.parentId;
    }
    return segments.join("/");
  };

  const downloadFile = (file: DownloadableFile) => {
    downloadSingleFile(file);
  };

  const downloadFolder = (folder: { id: string; name: string }) => {
    const descFiles = getDescendantFiles(folder.id);
    if (descFiles.length === 0) {
      // Nothing inside — still give the user something rather than doing nothing.
      downloadFilesAsZip([], folder.name);
      return;
    }
    const entries = descFiles.map((f) => ({
      file: f as DownloadableFile,
      relativePath: getRelativePathInsideFolder(folder.id, f.folderId),
    }));
    downloadFilesAsZip(entries, folder.name);
  };

  /** Bulk download for whatever is currently selected (BulkMenu → Download). */
  const downloadSelection = () => {
    const entries: { file: DownloadableFile; relativePath: string }[] = [];

    selectedFolderIds.forEach((folderId) => {
      const folder = folders.find((f) => f.id === folderId);
      if (!folder) return;
      const descFiles = getDescendantFiles(folderId);
      descFiles.forEach((f) => {
        entries.push({
          file: f as DownloadableFile,
          relativePath: [folder.name, getRelativePathInsideFolder(folderId, f.folderId)]
            .filter(Boolean)
            .join("/"),
        });
      });
    });

    selectedFileIds.forEach((fileId) => {
      const f = files.find((fi) => fi.id === fileId);
      if (f) entries.push({ file: f as DownloadableFile, relativePath: "" });
    });

    if (entries.length === 0) return;

    // Single loose file selected, nothing else → just download it directly instead of zipping.
    if (entries.length === 1 && selectedFolderIds.length === 0) {
      downloadFile(entries[0].file);
      return;
    }

    downloadFilesAsZip(entries, "Download");
  };

  // ---------------------------------------------------------------------------
  // Clipboard: cut / copy / paste (bulk)
  // ---------------------------------------------------------------------------

  /** Build the full set of folder+file ids implied by a selection (includes descendants). */
  const expandSelection = (folderIds: string[], fileIds: string[]) => {
    const allFolderIds = new Set<string>(folderIds);
    folderIds.forEach((id) => getDescendantFolderIds(id).forEach((d) => allFolderIds.add(d)));
    return { folderIds: [...allFolderIds], fileIds };
  };

  const cutFolder = (folder: { id: string; name: string }) => {
    setClipboard({ folderIds: [folder.id], fileIds: [], mode: "cut" });
  };

  const copyFolder = (folder: { id: string; name: string }) => {
    setClipboard({ folderIds: [folder.id], fileIds: [], mode: "copy" });
  };

  const cutFile = (file: { id: string; name: string }) => {
    setClipboard({ folderIds: [], fileIds: [file.id], mode: "cut" });
  };

  const copyFile = (file: { id: string; name: string }) => {
    setClipboard({ folderIds: [], fileIds: [file.id], mode: "copy" });
  };

  const cutSelection = () => {
    if (selectedFolderIds.length === 0 && selectedFileIds.length === 0) return;
    setClipboard({ folderIds: selectedFolderIds, fileIds: selectedFileIds, mode: "cut" });
  };

  const copySelection = () => {
    if (selectedFolderIds.length === 0 && selectedFileIds.length === 0) return;
    setClipboard({ folderIds: selectedFolderIds, fileIds: selectedFileIds, mode: "copy" });
  };

  /**
   * A paste target is invalid if ANY clipboard folder is the target itself or an ancestor
   * of itself (would create a cycle).
   */
  const isPasteTargetValid = (targetFolderId: string | null) => {
    if (!clipboard) return false;
    if (!clipboard.folderIds.length && !clipboard.fileIds.length) return false;
    for (const fid of clipboard.folderIds) {
      if (targetFolderId === fid) return false;
      const descendantIds = getDescendantFolderIds(fid);
      if (targetFolderId !== null && descendantIds.includes(targetFolderId)) return false;
    }
    return true;
  };

  /**
   * pasteSelection: moves or deep-clones all clipboard folders (with their nested
   * subtrees) and all clipboard files into targetFolderId.
   */
  const pasteSelection = async (targetFolderId: string | null) => {
    if (!clipboard || !isPasteTargetValid(targetFolderId)) return;

    if (clipboard.mode === "cut") {
      // Move folders: repoint their parentId (persist to DB)
      const folderIdSet = new Set(clipboard.folderIds);
      for (const fId of clipboard.folderIds) {
        try { await updateFolder(fId, { parentId: targetFolderId }); } catch (e) { console.error("move folder err:", e); }
      }
      setFolders((prev) =>
        prev.map((f) =>
          folderIdSet.has(f.id) ? { ...f, parentId: targetFolderId } : f
        )
      );
      // Move files: repoint their folderId (persist to DB)
      const fileIdSet = new Set(clipboard.fileIds);
      for (const fId of clipboard.fileIds) {
        try { await updateFile(fId, { folderId: targetFolderId }); } catch (e) { console.error("move file err:", e); }
      }
      setFiles((prev) =>
        prev.map((f) => (fileIdSet.has(f.id) ? { ...f, folderId: targetFolderId } : f))
      );
    } else {
      // Copy – deep-clone each folder tree + files
      const newFolders: any[] = [];
      const newFiles: any[] = [];

      for (const rootId of clipboard.folderIds) {
        const sourceFolder = folders.find((f) => f.id === rootId);
        if (!sourceFolder) continue;

        const descendantFolderIds = getDescendantFolderIds(rootId);
        const oldToNewFolderId = new Map<string, string>();
        oldToNewFolderId.set(rootId, crypto.randomUUID());
        descendantFolderIds.forEach((id) => oldToNewFolderId.set(id, crypto.randomUUID()));

        const cloned = [rootId, ...descendantFolderIds].map((oldId) => {
          const original = folders.find((f) => f.id === oldId)!;
          const newParentId =
            oldId === rootId
              ? targetFolderId
              : oldToNewFolderId.get(original.parentId) ?? original.parentId;
          return { ...original, id: oldToNewFolderId.get(oldId)!, parentId: newParentId };
        });
        newFolders.push(...cloned);

        const descFiles = getDescendantFiles(rootId);
        newFiles.push(
          ...descFiles.map((f) => ({
            ...f,
            id: crypto.randomUUID(),
            folderId: oldToNewFolderId.get(f.folderId) ?? f.folderId,
          }))
        );
      }

      // Copy loose files
      for (const fileId of clipboard.fileIds) {
        const f = files.find((fi) => fi.id === fileId);
        if (f) newFiles.push({ ...f, id: crypto.randomUUID(), folderId: targetFolderId });
      }

      setFolders((prev) => [...newFolders, ...prev]);
      setFiles((prev) => [...newFiles, ...prev]);
    }

    setClipboard(null);
  };

  // Legacy single-folder paste alias used by FolderCard / FolderAndFilesPage
  const pasteFolder = (targetFolderId: string | null) => pasteSelection(targetFolderId);

  // ---------------------------------------------------------------------------
  // Folder operations
  // ---------------------------------------------------------------------------

  const createNewFolder = async () => {
    try {
      const siblings = folders.filter((f) => f.parentId === currentFolderId);
      const existingNames = siblings.map((f) => f.name);
      let base = "New folder";
      let name = base;
      let counter = 1;
      while (existingNames.includes(name)) {
        name = `${base} (${counter})`;
        counter++;
      }
      const created = await createFolder(name, currentFolderId);
      const newFolder = {
        id: created.id,
        name: created.name,
        files: 0,
        size: "0 MB",
        parentId: created.parentId,
      };
      setFolders((prev) => [newFolder, ...prev]);
      setEditingFolderId(newFolder.id);
      setNewFolderId(newFolder.id);
    } catch (err) {
      console.error("Failed to create folder:", err);
    }
  };

  const renameFolder = async (id: string, newName: string) => {
    const trimmed = newName.trim();
    const isBlankNewFolder = !trimmed && id === newFolderId;
    if (trimmed) {
      try { await updateFolder(id, { name: trimmed }); } catch (e) { console.error("rename folder err:", e); }
    } else if (isBlankNewFolder) {
      try { await deleteFolder(id); } catch (e) { console.error("delete blank folder err:", e); }
    }
    setFolders((prev) =>
      trimmed
        ? prev.map((f) => (f.id === id ? { ...f, name: trimmed } : f))
        : isBlankNewFolder
        ? prev.filter((f) => f.id !== id)
        : prev
    );
    setEditingFolderId(null);
    setNewFolderId(null);
  };

  const cancelFolderEdit = async (id: string) => {
    // Escaping out of a brand-new, still-unnamed folder discards it. Escaping
    // out of renaming an existing folder just leaves its name untouched.
    if (id === newFolderId) {
      try { await deleteFolder(id); } catch (e) { console.error("cancel folder err:", e); }
      setFolders((prev) => prev.filter((f) => f.id !== id));
    }
    setEditingFolderId(null);
    setNewFolderId(null);
  };

  // Enter rename mode for an existing folder (triggered from the "Rename" menu item).
  const requestRenameFolder = (id: string) => setEditingFolderId(id);

  // ---------------------------------------------------------------------------
  // File rename
  // ---------------------------------------------------------------------------

  // Enter rename mode for an existing file (triggered from the "Rename" menu item).
  const requestRenameFile = (name: string) => setEditingFileName(name);

  const renameFile = async (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    setEditingFileName(null);
    if (!trimmed || trimmed === oldName) return;

    // Find the file's DB id and persist the rename
    const target = files.find((f) => f.name === oldName);
    if (target?.id) {
      try { await updateFile(target.id, { name: trimmed }); } catch (e) { console.error("rename file err:", e); }
    }

    setFiles((prev) => prev.map((f) => (f.name === oldName ? { ...f, name: trimmed } : f)));
    setFavorites((prev) => prev.map((f) => (f.name === oldName ? { ...f, name: trimmed } : f)));
    deleteFiles((prev) => prev.map((f) => (f.name === oldName ? { ...f, name: trimmed } : f)));
    setSharedFiles((prev) => prev.map((f) => (f.name === oldName ? { ...f, name: trimmed } : f)));
  };

  const cancelFileEdit = () => setEditingFileName(null);

  const getFolderDisplayStats = (folder: any) => {
    const folderFiles = files.filter((f) => f.folderId === folder.id);
    if (folderFiles.length === 0) {
      return { files: folder.files, size: folder.size };
    }
    const totalMB = folderFiles.reduce((sum: number, f: any) => {
      const match = String(f.size).match(/([\d.]+)/);
      return sum + (match ? parseFloat(match[1]) : 0);
    }, 0);
    return {
      files: folderFiles.length,
      size: totalMB >= 1024 ? `${(totalMB / 1024).toFixed(2)} GB` : `${totalMB.toFixed(1)} MB`,
    };
  };

  // ---------------------------------------------------------------------------
  // File uploads
  // ---------------------------------------------------------------------------

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (folderInputRef.current) {
      folderInputRef.current.setAttribute("webkitdirectory", "true");
      folderInputRef.current.setAttribute("directory", "true");
    }
  }, []);

  const handleFileUploadClick = () => fileInputRef.current?.click();
  const handleFolderUploadClick = () => folderInputRef.current?.click();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    let fileId = crypto.randomUUID();
    try {
      const created = await createFile({
        name: file.name,
        sizeBytes: file.size,
        mimeType: file.type || "application/octet-stream",
        folderId: currentFolderId,
      });
      fileId = created.id;
      // Upload the actual file bytes through our backend proxy → Oracle
      await uploadFileBytes(fileId, file);
    } catch (err) {
      console.error("create/upload file err:", err);
    }
    const newFile = {
      id: fileId,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      lastModified: new Date().toDateString(),
      folderId: currentFolderId,
      blob: file,
    };
    setFiles((prev) => [newFile, ...prev]);
    e.target.value = "";
  };

  const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    const pathToFolderId = new Map<string, string>();
    const newFolders: any[] = [];
    const newFiles: any[] = [];

    for (const file of Array.from(fileList)) {
      const relPath = (file as any).webkitRelativePath as string;
      const parts = relPath.split("/");
      const fileName = parts.pop()!;
      let parentId = currentFolderId;
      let pathSoFar = "";

      for (const segment of parts) {
        pathSoFar = pathSoFar ? `${pathSoFar}/${segment}` : segment;
        if (!pathToFolderId.has(pathSoFar)) {
          let folderId = crypto.randomUUID();
          try {
            const createdFolder = await createFolder(segment, parentId);
            folderId = createdFolder.id;
          } catch (err) {
            console.error("create folder upload err:", err);
          }
          pathToFolderId.set(pathSoFar, folderId);
          newFolders.push({ id: folderId, name: segment, files: 0, size: "0 MB", parentId });
          parentId = folderId;
        } else {
          parentId = pathToFolderId.get(pathSoFar)!;
        }
      }

      let fileId = crypto.randomUUID();
      try {
        const createdFile = await createFile({
          name: fileName,
          sizeBytes: file.size,
          mimeType: file.type || "application/octet-stream",
          folderId: parentId,
        });
        fileId = createdFile.id;
        // Upload the actual file bytes through our backend proxy → Oracle
        await uploadFileBytes(fileId, file);
      } catch (err) {
        console.error("create/upload file err:", err);
      }

      newFiles.push({
        id: fileId,
        name: fileName,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        lastModified: new Date().toDateString(),
        folderId: parentId,
        blob: file,
      });
    }

    setFolders((prev) => [...newFolders, ...prev]);
    setFiles((prev) => [...newFiles, ...prev]);
    e.target.value = "";
  };

  // ---------------------------------------------------------------------------
  // Share
  // ---------------------------------------------------------------------------

  const handleShare = async (payload: any) => {
    const originalFile = files.find((f) => f.name === payload.name);
    if (!originalFile) return;

    try {
      // Loop over the people array and create a share for each
      for (const person of payload.people) {
        await createShare({
          fileId: originalFile.id,
          sharedWith: person.email,
          role: person.role.toLowerCase() === "editor" ? "editor" : "viewer",
          message: payload.message
        });
      }

      // Optimistically update the UI to show the user that their share succeeded
      const sharedFile = {
        ...originalFile,
        ...payload,
        dateShared: formatDate(payload.dateShared || new Date()),
      };
      setSharedFiles((prev) => {
        const exists = prev.some((f) => f.name === payload.name);
        return exists
          ? prev.map((f) => (f.name === payload.name ? sharedFile : f))
          : [...prev, sharedFile];
      });
      setFavorites((prev) =>
        prev.map((f) => (f.name === payload.name ? { ...f, ...payload } : f))
      );
    } catch (err: any) {
      console.error("share error:", err);
      alert("Failed to share file: " + (err.message || "Unknown error"));
    }
  };

  const getMergedFile = (file: any) => {
    const sharedFile = sharedFiles.find((sf) => sf.name === file.name);
    return sharedFile ? { ...file, ...sharedFile } : file;
  };

  const toggleFavorite = async (file: any) => {
    const isCurrentlyFav = favorites.some((f) => f.name === file.name);
    if (file.id) {
      try { await updateFile(file.id, { isFavorite: !isCurrentlyFav }); } catch (e) { console.error("toggle fav err:", e); }
    }
    setFavorites((prev) =>
      isCurrentlyFav
        ? prev.filter((f) => f.name !== file.name)
        : [...prev, { ...file, isFavorite: true }]
    );
  };

  const toggleDelete = async (file: any) => {
    const isCurrentlyDeleted = deletedFiles.some((f) => f.name === file.name);

    if (file.id) {
      try {
        await updateFile(file.id, { deletedAt: isCurrentlyDeleted ? null : new Date().toISOString() });
      } catch (e) { console.error("toggle delete err:", e); }
    }

    if (isCurrentlyDeleted) {
      deleteFiles((prev) => prev.filter((f) => f.name !== file.name));
      if (file.wasFavorite) {
        const { wasFavorite: _, ...cleanFile } = file;
        setFavorites((prev) =>
          prev.some((f) => f.name === cleanFile.name) ? prev : [...prev, cleanFile]
        );
      }
    } else {
      const isFav = favorites.some((f) => f.name === file.name);
      setFavorites((prev) => prev.filter((f) => f.name !== file.name));
      deleteFiles((prev) => [...prev, { ...file, wasFavorite: isFav }]);
    }
  };

  // ----- Folder-level favorite/delete/share -----

  const toggleFavoriteFolder = async (folder: { id: string; name: string }) => {
    const isCurrentlyFavorite = favoriteFolderIds.includes(folder.id);
    const newVal = !isCurrentlyFavorite;
    try { await updateFolder(folder.id, { isFavorite: newVal }); } catch (e) { console.error("toggle fav folder err:", e); }
    const descFolderIds = getDescendantFolderIds(folder.id);
    const descFiles = getDescendantFiles(folder.id);
    if (isCurrentlyFavorite) {
      setFavoriteFolderIds((prev) =>
        prev.filter((id) => id !== folder.id && !descFolderIds.includes(id))
      );
      setFavorites((prev) => prev.filter((f) => !descFiles.some((df) => df.name === f.name)));
    } else {
      setFavoriteFolderIds((prev) => [...new Set([...prev, folder.id, ...descFolderIds])]);
      setFavorites((prev) => {
        const namesAlready = new Set(prev.map((f) => f.name));
        const toAdd = descFiles.filter((f) => !namesAlready.has(f.name));
        return [...prev, ...toAdd];
      });
    }
  };

  const toggleDeleteFolder = async (folder: { id: string; name: string }) => {
    const isCurrentlyDeleted = deletedFolderIds.includes(folder.id);
    const newDeletedAt = isCurrentlyDeleted ? null : new Date().toISOString();
    try { await updateFolder(folder.id, { deletedAt: newDeletedAt }); } catch (e) { console.error("toggle delete folder err:", e); }
    const descFolderIds = getDescendantFolderIds(folder.id);
    const descFiles = getDescendantFiles(folder.id);
    if (isCurrentlyDeleted) {
      setDeletedFolderIds((prev) =>
        prev.filter((id) => id !== folder.id && !descFolderIds.includes(id))
      );
      deleteFiles((prev) => prev.filter((f) => !descFiles.some((df) => df.name === f.name)));
    } else {
      setDeletedFolderIds((prev) => [...new Set([...prev, folder.id, ...descFolderIds])]);
      deleteFiles((prev) => {
        const namesAlready = new Set(prev.map((f) => f.name));
        const toAdd = descFiles.filter((f) => !namesAlready.has(f.name));
        return [...prev, ...toAdd];
      });
    }
  };

  const handleShareFolder = (folder: { id: string; name: string }) => {
    setFolderShareTarget(folder);
  };

  const handleFolderShareSubmit = async (payload: any) => {
    if (!folderShareTarget) return;
    const folderMeta = folders.find((f) => f.id === folderShareTarget.id);
    if (!folderMeta) return;

    try {
      for (const person of payload.people) {
        await createShare({
          folderId: folderMeta.id,
          sharedWith: person.email,
          role: person.role.toLowerCase() === "editor" ? "editor" : "viewer",
          message: payload.message
        });
      }

      const folderStats = getFolderDisplayStats(folderMeta);
      const sharedFolder = {
        id: folderShareTarget.id,
        name: folderShareTarget.name,
        files: folderStats.files,
        size: folderStats.size,
        ...payload,
        dateShared: formatDate(payload.dateShared || new Date()),
      };
      setSharedFolders((prev) => {
        const exists = prev.some((f) => f.id === folderShareTarget.id);
        return exists
          ? prev.map((f) => (f.id === folderShareTarget.id ? sharedFolder : f))
          : [...prev, sharedFolder];
      });
      const descFiles = getDescendantFiles(folderShareTarget.id);
      descFiles.forEach((f) => handleShare({ ...payload, name: f.name }));
      setFolderShareTarget(null);
    } catch (err: any) {
      console.error("share folder error:", err);
      alert("Failed to share folder: " + (err.message || "Unknown error"));
    }
  };

  // ---------------------------------------------------------------------------
  // Select mode helpers
  // ---------------------------------------------------------------------------

  const enterSelectMode = useCallback(() => {
    setSelectMode(true);
    setSelectedFolderIds([]);
    setSelectedFileIds([]);
  }, []);

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedFolderIds([]);
    setSelectedFileIds([]);
  };

  const toggleSelectFolder = (id: string) => {
    setSelectedFolderIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectFile = (id: string) => {
    setSelectedFileIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const totalSelected = selectedFolderIds.length + selectedFileIds.length;

  // ---------------------------------------------------------------------------
  // Bulk actions (from BulkMenu)
  // ---------------------------------------------------------------------------

  const handleBulkDelete = () => {
    selectedFolderIds.forEach((id) => {
      const f = folders.find((fo) => fo.id === id);
      if (f) toggleDeleteFolder(f);
    });
    selectedFileIds.forEach((id) => {
      const f = files.find((fi) => fi.id === id);
      if (f) toggleDelete(f);
    });
    exitSelectMode();
  };

  const handleBulkFavorite = () => {
    selectedFolderIds.forEach((id) => {
      const f = folders.find((fo) => fo.id === id);
      if (f) toggleFavoriteFolder(f);
    });
    selectedFileIds.forEach((id) => {
      const f = files.find((fi) => fi.id === id);
      if (f) toggleFavorite(f);
    });
    exitSelectMode();
  };

  const handleBulkShare = () => {
    // Share the first selected folder or file as the representative target
    if (selectedFolderIds.length > 0) {
      const f = folders.find((fo) => fo.id === selectedFolderIds[0]);
      if (f) handleShareFolder(f);
    } else if (selectedFileIds.length > 0) {
      // FileShare is triggered by opening ShareModal with the file name
      // – handled by existing per-file flow; no-op here for now
    }
    exitSelectMode();
  };

  // ---------------------------------------------------------------------------
  // Right-click context menu + bulk menu
  // ---------------------------------------------------------------------------

  // When a right-click starts a drag, note it so we suppress the context menu on mouseup
  const handleDragStarted = useCallback(() => {
    dragOccurred.current = true;
  }, []);

  const handleMidSectionContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (dragOccurred.current) {
      dragOccurred.current = false;
      return;
    }
    setContextMenu({ open: true, x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => setContextMenu((prev) => ({ ...prev, open: false }));

  /**
   * Called by FolderCard / FileTable when the user right-clicks an already-selected
   * item in select mode – open the BulkMenu instead of the individual item menu.
   */
  const handleBulkRightClick = (x: number, y: number) => {
    setBulkMenu({ x, y });
  };

  // ---------------------------------------------------------------------------
  // Marquee selection overlay items descriptor
  // ---------------------------------------------------------------------------

  const rootFolders = folders.filter(
    (f) => f.parentId === null && !deletedFolderIds.includes(f.id)
  );
  const rootFiles = files.filter((f) => f.folderId === null);
  const activeRootFiles = rootFiles.filter(
    (f) => !deletedFiles.some((d) => d.name === f.name)
  );
  const { totalMB, categories } = computeStorageStats([...files, ...deletedFiles]);


  // Build the item list for SelectionOverlay (only used in dashboard main grid for now)
  const overlayItems = [
    ...rootFolders.map((f) => ({ domId: `folder-card-${f.id}`, folderId: f.id })),
    ...activeRootFiles.map((f) => ({
      domId: `file-row-${f.id ?? f.name}`,
      fileId: f.id ?? f.name,
    })),
  ];

  const midSectionRef = useRef<HTMLDivElement>(null);

  const handleOverlaySelectionChange = useCallback(
    (folderIds: string[], fileIds: string[]) => {
      setSelectedFolderIds(folderIds);
      setSelectedFileIds(fileIds);
    },
    []
  );

  // ---------------------------------------------------------------------------
  // Derived data for pages
  // ---------------------------------------------------------------------------

  const favoriteFolders = folders
    .filter((f) => favoriteFolderIds.includes(f.id))
    .map((f) => ({ ...f, ...getFolderDisplayStats(f) }));

  const deletedFolders = folders
    .filter((f) => deletedFolderIds.includes(f.id))
    .map((f) => ({ ...f, ...getFolderDisplayStats(f) }));

  // ---------------------------------------------------------------------------
  // Whether the currently visible view has any files or folders that could be
  // selected. Used to disable "Select items" in the right-click menu when the
  // view is empty.
  // ---------------------------------------------------------------------------
  const hasSelectableItems = currentFolderId
    ? folders.some((f) => f.parentId === currentFolderId) ||
      files
        .filter((f) => f.folderId === currentFolderId)
        .some((f) => !deletedFiles.some((d) => d.name === f.name))
    : view === "dashboard"
    ? rootFolders.length > 0 || activeRootFiles.length > 0
    : view === "folders"
    ? rootFolders.length > 0
    : view === "files"
    ? files.length > 0
    : view === "favorites"
    ? favoriteFolders.length > 0 ||
      favorites.some((f) => !deletedFiles.some((d) => d.name === f.name))
    : view === "shared"
    ? sharedFolders.length > 0 ||
      sharedFiles.some((f) => !deletedFiles.some((d) => d.name === f.name))
    : view === "deletedFiles"
    ? deletedFolders.some(
        (f) => f.parentId === null || !deletedFolderIds.includes(f.parentId)
      ) ||
      deletedFiles.some(
        (f) => f.folderId === null || !deletedFolderIds.includes(f.folderId)
      )
    : true;

  // ---------------------------------------------------------------------------
  // Search: build a flat, searchable index of every folder + file
  // ---------------------------------------------------------------------------

  /** Ancestor chain (excluding the folder itself) from root down to `folderId`. */
  const getFolderPath = (folderId: string | null): { id: string; name: string }[] => {
    const path: { id: string; name: string }[] = [];
    let current = folderId;
    while (current) {
      const f = folders.find((fo) => fo.id === current);
      if (!f) break;
      path.unshift({ id: f.id, name: f.name });
      current = f.parentId;
    }
    return path;
  };

  const getLocationLabel = (folderId: string | null, isDeleted: boolean): string => {
    const names = getFolderPath(folderId).map((p) => p.name);
    if (isDeleted) return ["Recycle Bin", ...names].join(" / ");
    return names.length ? names.join(" / ") : "Home";
  };

  const searchIndex: (FileSearchItem & { folderPath: { id: string; name: string }[] })[] = [
    ...folders.map((f) => {
      const isDeleted = deletedFolderIds.includes(f.id);
      return {
        id: f.id,
        name: f.name,
        kind: "folder" as const,
        domId: `folder-card-${f.id}`,
        locationLabel: getLocationLabel(f.parentId, isDeleted),
        isDeleted,
        isFavorite: favoriteFolderIds.includes(f.id),
        isShared: sharedFolders.some((sf) => sf.id === f.id),
        folderPath: getFolderPath(f.parentId),
      };
    }),
    ...files.map((file) => {
      const isDeleted = deletedFiles.some((d) => d.name === file.name);
      return {
        id: file.id ?? file.name,
        name: file.name,
        kind: "file" as const,
        domId: `file-row-${file.id ?? file.name}`,
        locationLabel: getLocationLabel(file.folderId, isDeleted),
        isDeleted,
        isFavorite: favorites.some((fv) => fv.name === file.name),
        isShared: sharedFiles.some((sf) => sf.name === file.name),
        folderPath: getFolderPath(file.folderId),
      };
    }),
  ] as any;

  /** Scope the index to what should be searchable from the current page. */
  const scopedSearchItems = (() => {
    if (view === "favorites") return searchIndex.filter((i: any) => i.isFavorite && !i.isDeleted);
    if (view === "shared") return searchIndex.filter((i: any) => i.isShared && !i.isDeleted);
    if (view === "deletedFiles") return searchIndex.filter((i: any) => i.isDeleted);
    // dashboard / folders / files "view all" pages → global search, everything is fair game
    return searchIndex;
  })();

  /** Scroll to + flash a blue ring around a rendered card/row, once it's on screen. */
  const highlightSearchResult = (domId: string) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.getElementById(domId);
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-blue-400", "ring-offset-2", "rounded-xl", "transition-all");
        setTimeout(() => {
          el.classList.remove("ring-2", "ring-blue-400", "ring-offset-2", "rounded-xl", "transition-all");
        }, 1500);
      });
    });
  };

  const handleSearchSelect = (item: FileSearchItem) => {
    const indexed = searchIndex.find((i: any) => i.domId === item.domId) as any;
    const isGlobalScope = view === "dashboard" || view === "folders" || view === "files";

    if (isGlobalScope && indexed) {
      const ancestorsPlusSelf =
        indexed.kind === "folder"
          ? [...indexed.folderPath, { id: indexed.id, name: indexed.name }]
          : indexed.folderPath;
      setFolderStack(ancestorsPlusSelf);
      setView(indexed.isDeleted ? "deletedFiles" : "dashboard");
    }
    // In Favorites / Shared / Deleted, the item is already visible on the current
    // page — no navigation needed, just scroll to it and highlight it.

    highlightSearchResult(item.domId);
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!authChecked) {
    return null;
  }

  if (!isAuthenticated) {
    return <AuthPage onLogin={handleLogin} onSignUp={handleSignUp} />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        activeView={view}
        onNavigate={handleNavigate}
        onSignOut={handleSignOut}
      />

      <div
        ref={midSectionRef as React.RefObject<HTMLDivElement>}
        className="flex-1 overflow-y-auto scrollbar-hide p-6 bg-[#FAFAFA]"
        onContextMenu={view !== "settings" ? handleMidSectionContextMenu : undefined}
      >
        {view !== "settings" && (
          <TopBar
            activeView={view}
            onCreateFolder={createNewFolder}
            onUploadFile={handleFileUploadClick}
            onUploadFolder={handleFolderUploadClick}
            searchItems={scopedSearchItems}
            onSearchSelect={handleSearchSelect}
          />
        )}

        {view !== "settings" && (
          <AddressBar
            activeView={view}
            folderStack={folderStack}
            onNavigateToRoot={navigateToSectionRoot}
            onNavigateToFolder={navigateToFolderDepth}
          />
        )}

        {/* ── Select-mode exit banner ────────────────────────────────────── */}
        {selectMode && (
          <div className="flex items-center gap-3 mb-4 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-xl">
            <span className="text-sm font-medium text-blue-700">
              {totalSelected === 0
                ? "Select mode on — click items to select them"
                : `${totalSelected} item${totalSelected !== 1 ? "s" : ""} selected`}
            </span>
            <button
              onClick={exitSelectMode}
              className="ml-auto flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 bg-white border border-blue-300 rounded-lg px-3 py-1 hover:bg-blue-100 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3.5 h-3.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Exit selection
            </button>
          </div>
        )}

        {view !== "settings" && (
  <FilesRow
    files={
      view === "favorites"
        ? favorites.map((f) => getMergedFile(f))
        : view === "deletedFiles"
        ? deletedFiles
        : view === "shared"
        ? sharedFiles
        : [...files, ...deletedFiles].map((f) => getMergedFile(f))
    }
  />
)}

        {/* Inside a folder */}
        {currentFolderId ? (
          <FolderView
            folderName={folderStack[folderStack.length - 1].name}
            folders={folders
              .filter((f) => f.parentId === currentFolderId && !deletedFolderIds.includes(f.id))
              .map((f) => ({ ...f, ...getFolderDisplayStats(f) }))}
            files={files
              .filter((f) => f.folderId === currentFolderId)
              .filter((f) => !deletedFiles.some((d) => d.name === f.name))
              .map((f) => getMergedFile(f))}
            onBack={goBackOneFolder}
            onOpenFolder={openFolder}
            editingFolderId={editingFolderId}
            onRenameFolder={renameFolder}
            onCancelFolderEdit={cancelFolderEdit}
            onRequestRenameFolder={requestRenameFolder}
            onCutFolder={cutFolder}
            onCopyFolder={copyFolder}
            onPasteIntoFolder={pasteFolder}
            isPasteValidForFolder={isPasteTargetValid}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            deletedFiles={deletedFiles}
            onToggleDelete={toggleDelete}
            onShare={handleShare}
            editingFileName={editingFileName}
            onRenameFile={renameFile}
            onCancelFileEdit={cancelFileEdit}
            onRequestRenameFile={requestRenameFile}
            onCutFile={cutFile}
            onCopyFile={copyFile} onDownloadFile={downloadSingleFile} isFavoriteFolder={(id) => favoriteFolderIds.includes(id)} isDeletedFolder={(id) => deletedFolderIds.includes(id)} onToggleFavoriteFolder={toggleFavoriteFolder} onToggleDeleteFolder={toggleDeleteFolder} onShareFolder={handleShareFolder} onDownloadFolder={downloadFolder} /> ) : (
          <>
            {view === "dashboard" && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Folders</h2>
                  <button
                    className={`text-sm font-medium ${
                      rootFolders.length === 0
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-blue-600"
                    }`}
                    onClick={() => rootFolders.length > 0 && setView("folders")}
                    disabled={rootFolders.length === 0}
                  >
                    View All
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-6 mb-16">
                  {rootFolders.map((f) => {
                    const stats = getFolderDisplayStats(f);
                    return (
                      <FolderCard
                        key={f.id}
                        id={f.id}
                        // Attach a stable DOM id so the overlay can hit-test it
                        domId={`folder-card-${f.id}`}
                        name={f.name}
                        files={stats.files}
                        size={stats.size}
                        isEditing={editingFolderId === f.id}
                        onRename={renameFolder}
                        onCancelEdit={cancelFolderEdit}
                        onRequestRename={() => requestRenameFolder(f.id)}
                        onOpen={() => openFolder(f)}
                        isFavorite={favoriteFolderIds.includes(f.id)}
                        isDeleted={false}
                        onToggleFavorite={() => toggleFavoriteFolder(f)}
                        onToggleDelete={() => toggleDeleteFolder(f)}
                        onShare={() => handleShareFolder(f)}
                        onDownload={() => downloadFolder(f)}
                        onCut={() => cutFolder(f)}
                        onCopy={() => copyFolder(f)}
                        onPaste={() => pasteFolder(f.id)}
                        canPaste={isPasteTargetValid(f.id)}
                        selectMode={selectMode}
                        isSelected={selectedFolderIds.includes(f.id)}
                        onToggleSelect={() => toggleSelectFolder(f.id)}
                        onBulkRightClick={handleBulkRightClick}
                        selectedCount={totalSelected}
                      />
                    );
                  })}
                </div>

                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Files</h2>
                  <button
                    className={`text-sm font-medium ${
                      rootFiles.length === 0
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-blue-600"
                    }`}
                    onClick={() => {
                      if (rootFiles.length === 0) return;
                      if (activeRootFiles.length === 0) return setView("deletedFiles");
                      setView("files");
                    }}
                    disabled={rootFiles.length === 0}
                  >
                    View All
                  </button>
                </div>

                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-700 text-white">
                    <tr>
                      {selectMode && <th className="px-2 py-2 w-[36px]" />}
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Size</th>
                      <th className="px-4 py-2">Last Modified</th>
                      <th className="px-4 py-2 text-center">Members</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeRootFiles.slice(0, 4).map((file) => {
                      const mergedFile = getMergedFile(file);
                      return (
                        <FileTable
                          key={mergedFile.id ?? mergedFile.name}
                          {...mergedFile}
                          // Attach DOM id for marquee hit-testing
                          domId={`file-row-${mergedFile.id ?? mergedFile.name}`}
                          isFavorite={favorites.some((f) => f.name === mergedFile.name)}
                          onToggleFavorite={() => toggleFavorite(mergedFile)}
                          isDeleted={deletedFiles.some((f) => f.name === mergedFile.name)}
                          onToggleDelete={() => toggleDelete(mergedFile)}
                          onShare={handleShare}
                          onDownload={() => downloadFile(mergedFile)}
                          isEditing={editingFileName === mergedFile.name}
                          onRename={(newName) => renameFile(mergedFile.name, newName)}
                          onCancelEdit={cancelFileEdit}
                          onRequestRename={() => requestRenameFile(mergedFile.name)}
                          onCut={() => cutFile(mergedFile)}
                          onCopy={() => copyFile(mergedFile)}
                          selectMode={selectMode}
                          isSelected={selectedFileIds.includes(mergedFile.id ?? mergedFile.name)}
                          onToggleSelect={() =>
                            toggleSelectFile(mergedFile.id ?? mergedFile.name)
                          }
                          onBulkRightClick={handleBulkRightClick}
                          selectedCount={totalSelected}
                        />
                      );
                    })}
                  </tbody>
                </table>
              </>
            )}

            {view === "folders" && (
              <FoldersPage
                folders={rootFolders.map((f) => ({ ...f, ...getFolderDisplayStats(f) }))}
                onBack={() => setView("dashboard")}
                editingFolderId={editingFolderId}
                onRename={renameFolder}
                onCancelEdit={cancelFolderEdit}
                onRequestRename={requestRenameFolder}
                onOpenFolder={openFolder}
                onCutFolder={cutFolder}
                onCopyFolder={copyFolder}
                onPasteIntoFolder={pasteFolder}
                isPasteValidForFolder={isPasteTargetValid}
              />
            )}

            {view === "files" && (
              <FilesPage
                files={files.map((file) => getMergedFile(file))}
                onBack={() => setView("dashboard")}
                onToggleFavorite={toggleFavorite}
                favorites={favorites}
                onToggleDelete={toggleDelete}
                deletedFiles={deletedFiles}
                title="Files"
                onShare={handleShare}
                onDownload={downloadFile}
                editingFileName={editingFileName}
                onRenameFile={renameFile}
                onCancelFileEdit={cancelFileEdit}
                onRequestRenameFile={requestRenameFile}
                onCutFile={cutFile}
                onCopyFile={copyFile}
              />
            )}

            {view === "favorites" && (
              <FolderAndFilesPage
                title="Favorites"
                folders={favoriteFolders}
                files={favorites
                  .filter((f) => !deletedFiles.some((d) => d.name === f.name))
                  .map((file) => getMergedFile(file))}
                onBack={() => setView("dashboard")}
                editingFolderId={editingFolderId}
                onRenameFolder={renameFolder}
                onCancelFolderEdit={cancelFolderEdit}
                onRequestRenameFolder={requestRenameFolder}
                editingFileName={editingFileName}
                onRenameFile={renameFile}
                onCancelFileEdit={cancelFileEdit}
                onRequestRenameFile={requestRenameFile}
                onCutFile={cutFile}
                onCopyFile={copyFile}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                favoriteFolderIds={favoriteFolderIds}
                onToggleFavoriteFolder={toggleFavoriteFolder}
                deletedFiles={deletedFiles}
                onToggleDelete={toggleDelete}
                deletedFolderIds={deletedFolderIds}
                onToggleDeleteFolder={toggleDeleteFolder}
                onShare={handleShare}
                onShareFolder={handleShareFolder}
                onDownloadFile={downloadFile}
                onFolderDownload={downloadFolder}
                onCutFolder={cutFolder}
                onCopyFolder={copyFolder}
                onPasteIntoFolder={pasteFolder}
                isPasteValidForFolder={isPasteTargetValid}
                onOpenFolder={openFolder}
                selectMode={selectMode}
                selectedFolderIds={selectedFolderIds}
                selectedFileIds={selectedFileIds}
                onToggleSelectFolder={toggleSelectFolder}
                onToggleSelectFile={toggleSelectFile}
              />
            )}

            {view === "shared" && (
              <FolderAndFilesPage
                title="Shared"
                folders={sharedFolders}
                files={sharedFiles.filter(
                  (f) => !deletedFiles.some((d) => d.name === f.name)
                )}
                onBack={() => setView("dashboard")}
                editingFolderId={editingFolderId}
                onRenameFolder={renameFolder}
                onCancelFolderEdit={cancelFolderEdit}
                onRequestRenameFolder={requestRenameFolder}
                editingFileName={editingFileName}
                onRenameFile={renameFile}
                onCancelFileEdit={cancelFileEdit}
                onRequestRenameFile={requestRenameFile}
                onCutFile={cutFile}
                onCopyFile={copyFile}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                favoriteFolderIds={favoriteFolderIds}
                onToggleFavoriteFolder={toggleFavoriteFolder}
                deletedFiles={deletedFiles}
                onToggleDelete={toggleDelete}
                deletedFolderIds={deletedFolderIds}
                onToggleDeleteFolder={toggleDeleteFolder}
                onShare={handleShare}
                onShareFolder={handleShareFolder}
                onDownloadFile={downloadFile}
                onFolderDownload={downloadFolder}
                onCutFolder={cutFolder}
                onCopyFolder={copyFolder}
                onPasteIntoFolder={pasteFolder}
                isPasteValidForFolder={isPasteTargetValid}
                onOpenFolder={openFolder}
                isShared
                selectMode={selectMode}
                selectedFolderIds={selectedFolderIds}
                selectedFileIds={selectedFileIds}
                onToggleSelectFolder={toggleSelectFolder}
                onToggleSelectFile={toggleSelectFile}
              />
            )}

            {view === "deletedFiles" && (
              <FolderAndFilesPage
                title="Deleted Files"
                folders={deletedFolders.filter(
                  (f) =>
                    f.parentId === null || !deletedFolderIds.includes(f.parentId)
                )}
                files={deletedFiles.filter(
                  (f) => f.folderId === null || !deletedFolderIds.includes(f.folderId)
                )}
                onBack={() => setView("dashboard")}
                editingFolderId={editingFolderId}
                onRenameFolder={renameFolder}
                onCancelFolderEdit={cancelFolderEdit}
                onRequestRenameFolder={requestRenameFolder}
                editingFileName={editingFileName}
                onRenameFile={renameFile}
                onCancelFileEdit={cancelFileEdit}
                onRequestRenameFile={requestRenameFile}
                favorites={favorites.filter(
                  (f) => !deletedFiles.some((d) => d.name === f.name)
                )}
                onToggleFavorite={toggleFavorite}
                favoriteFolderIds={favoriteFolderIds}
                onToggleFavoriteFolder={toggleFavoriteFolder}
                deletedFiles={deletedFiles}
                onToggleDelete={toggleDelete}
                deletedFolderIds={deletedFolderIds}
                onToggleDeleteFolder={toggleDeleteFolder}
                onDownloadFile={downloadFile}
                onFolderDownload={downloadFolder}
                onOpenFolder={openFolder}
                selectMode={selectMode}
                selectedFolderIds={selectedFolderIds}
                selectedFileIds={selectedFileIds}
                onToggleSelectFolder={toggleSelectFolder}
                onToggleSelectFile={toggleSelectFile}
              />
            )}

            {view === "settings" && (
              <Settings
                onBack={() => setView("dashboard")}
                externalTarget={settingsTarget}
                onConsumeExternalTarget={() => setSettingsTarget(null)}
              />
            )}
            {view === "deep_clean" && <DeepClean onBack={() => setView("dashboard")} />}
          </>
        )}
      </div>

      {view !== "settings" && (
  <div className="w-1/4 p-6 bg-white flex flex-col gap-6 overflow-y-auto scrollbar-hide flex-shrink-0">
    <StorageSummary
      onUploadFile={handleFileUploadClick}
      totalUsedMB={totalMB}
      categories={categories}
      capMB={100}
      onNavigateSettings={openSettings}
      onSignOut={handleSignOut}
    />
  </div>
)}

      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFolderUpload}
      />

      {/* Folder share modal */}
      {folderShareTarget && (
        <ShareModal
          open={!!folderShareTarget}
          onClose={() => setFolderShareTarget(null)}
          fileName={folderShareTarget.name}
          onShare={handleFolderShareSubmit}
        />
      )}

      {/* Empty-space right-click context menu */}
      <ContextMenu
        open={contextMenu.open}
        x={contextMenu.x}
        y={contextMenu.y}
        onClose={closeContextMenu}
        onPaste={() => {
          closeContextMenu();
          pasteSelection(currentFolderId);
        }}
        onUploadFile={() => {
          closeContextMenu();
          handleFileUploadClick();
        }}
        onUploadFolder={() => {
          closeContextMenu();
          handleFolderUploadClick();
        }}
        onSelectItems={() => {
          closeContextMenu();
          enterSelectMode();
          // No longer auto-checks all items – user manually picks
        }}
        onCreateNewFolder={() => {
          closeContextMenu();
          createNewFolder();
        }}
        isSelectModeActive={selectMode}
        canPaste={isPasteTargetValid(currentFolderId)}
        hasSelectableItems={hasSelectableItems}
      />

      {/* Bulk right-click menu (right-click on a selected item) */}
      <BulkMenu
        openAt={bulkMenu}
        onClose={() => setBulkMenu(null)}
        selectionCount={totalSelected}
        onDownload={() => {
          setBulkMenu(null);
          downloadSelection();
        }}
        onDelete={() => {
          setBulkMenu(null);
          handleBulkDelete();
        }}
        onFavorite={() => {
          setBulkMenu(null);
          handleBulkFavorite();
        }}
        onCopy={() => {
          setBulkMenu(null);
          copySelection();
        }}
        onCut={() => {
          setBulkMenu(null);
          cutSelection();
        }}
        onShare={() => {
          setBulkMenu(null);
          handleBulkShare();
        }}
      />

      {/* Marquee selection overlay – only active in dashboard, non-folder view */}
      {view === "dashboard" && !currentFolderId && (
        <SelectionOverlay
          containerRef={midSectionRef as React.RefObject<HTMLElement>}
          items={overlayItems}
          onSelectionChange={handleOverlaySelectionChange}
          onEnterSelectMode={enterSelectMode}
          selectMode={selectMode}
          onDragStarted={handleDragStarted}
        />
      )}
    </div>
  );
}



