/**
 * downloadUtils.ts
 *
 * Download handling — fetches real bytes from the backend when available.
 *
 * When a file has an `id` (i.e. it exists in the database / Oracle Storage),
 * we fetch its bytes through our backend proxy route (GET /files/:id/download).
 * If a file still has a local `blob` reference (just-uploaded in this session),
 * we use that directly. The placeholder fallback only fires for files that
 * have neither (e.g. seed/demo data).
 */

import JSZip from "jszip"
import { downloadFileBlob } from "./api"

export type DownloadableFile = {
  id?: string
  name: string
  size?: string
  lastModified?: string
  /** The real File/Blob captured at upload time, if available. */
  blob?: Blob
  folderId?: string | null
}

export type DownloadableFolder = {
  id: string
  name: string
}

/** Triggers a browser save dialog for an in-memory Blob. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // Give the browser a tick to start the download before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Returns a real Blob for the file — from backend if it has an id,
 *  from the local reference if just-uploaded, or a placeholder as last resort. */
async function getFileBlob(file: DownloadableFile): Promise<Blob> {
  if (file.blob) return file.blob
  if (file.id) {
    try {
      return await downloadFileBlob(file.id)
    } catch (err) {
      console.error("download from backend failed, using placeholder:", err)
    }
  }
  const placeholder =
    `This is a placeholder for "${file.name}".\n` +
    `No file content was captured for this item.\n\n` +
    `Size: ${file.size ?? "unknown"}\n` +
    `Last modified: ${file.lastModified ?? "unknown"}\n`
  return new Blob([placeholder], { type: "text/plain" })
}

/** Download a single file using its real content when available. */
export async function downloadSingleFile(file: DownloadableFile) {
  const blob = await getFileBlob(file)
  downloadBlob(blob, file.name)
}

/**
 * Download many files as one .zip, preserving folder structure.
 * `entries` is a flat list of { file, relativePath } where relativePath is the
 * folder path the file should appear under inside the zip (empty string = root).
 */
export async function downloadFilesAsZip(
  entries: { file: DownloadableFile; relativePath: string }[],
  zipName: string
) {
  const zip = new JSZip()

  for (const { file, relativePath } of entries) {
    const blob = await getFileBlob(file)
    const folder = relativePath ? zip.folder(relativePath) ?? zip : zip
    folder.file(file.name, blob)
  }

  const zipBlob = await zip.generateAsync({ type: "blob" })
  downloadBlob(zipBlob, zipName.endsWith(".zip") ? zipName : `${zipName}.zip`)
}
