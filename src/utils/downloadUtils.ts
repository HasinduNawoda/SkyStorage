/**
 * downloadUtils.ts
 *
 * Frontend-only download handling — no backend involved.
 *
 * Industry-standard approach for a frontend that doesn't yet have a backend:
 *   - When a file is uploaded, we keep a reference to the real browser `File`
 *     object (it's already in memory — the <input type="file"> gave it to us).
 *     We never need to re-fetch it; we just hand that Blob back to the browser
 *     via `URL.createObjectURL` when the user clicks Download.
 *   - If a file/folder somehow has no real Blob attached (e.g. seed/demo data
 *     that was never actually uploaded through the file input), we fall back
 *     to generating a small placeholder file from its metadata, so the button
 *     never just silently does nothing.
 *   - Multi-file / folder downloads are zipped client-side with JSZip and
 *     handed to the browser as a single .zip Blob.
 *
 * Once a real backend exists, swap `getFileBlob` to fetch from your file
 * storage endpoint instead (e.g. `await fetch(file.url).then(r => r.blob())`)
 * — every call site here stays the same.
 */

import JSZip from "jszip"

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

/** Returns a real Blob for the file, or a generated placeholder if none was captured. */
function getFileBlob(file: DownloadableFile): Blob {
  if (file.blob) return file.blob
  const placeholder =
    `This is a placeholder for "${file.name}".\n` +
    `No file content was captured for this item (it has no backend yet).\n\n` +
    `Size: ${file.size ?? "unknown"}\n` +
    `Last modified: ${file.lastModified ?? "unknown"}\n`
  return new Blob([placeholder], { type: "text/plain" })
}

/** Download a single file using its real content when available. */
export function downloadSingleFile(file: DownloadableFile) {
  const blob = getFileBlob(file)
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
    const blob = getFileBlob(file)
    const folder = relativePath ? zip.folder(relativePath) ?? zip : zip
    folder.file(file.name, blob)
  }

  const zipBlob = await zip.generateAsync({ type: "blob" })
  downloadBlob(zipBlob, zipName.endsWith(".zip") ? zipName : `${zipName}.zip`)
}
