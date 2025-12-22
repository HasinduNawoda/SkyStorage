export type FileType = "document" | "image" | "video" | "audio" | "other"

export function getFileType(fileName: string): FileType {
  const ext = fileName.split(".").pop()?.toLowerCase()

  if (!ext) return "other"
  if (["pdf", "doc", "docx", "txt"].includes(ext)) return "document"
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image"
  if (["mp4", "avi", "mov", "mkv"].includes(ext)) return "video"
  if (["mp3", "wav", "aac", "flac"].includes(ext)) return "audio"

  return "other"
}
