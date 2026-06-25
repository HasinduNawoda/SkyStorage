import { getFileType } from "./FileType";

/** Parses a display size string like "2.34 MB" or "1.2 GB" into raw megabytes. */
export function parseSizeToMB(size: string | undefined | null): number {
  if (!size) return 0;
  const match = String(size).match(/([\d.]+)\s*(GB|MB|KB)?/i);
  if (!match) return 0;
  const value = parseFloat(match[1]);
  const unit = (match[2] || "MB").toUpperCase();
  if (unit === "GB") return value * 1024;
  if (unit === "KB") return value / 1024;
  return value; // MB
}

/** Formats a raw MB number back into a friendly display string. */
export function formatMB(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
  return `${mb.toFixed(1)} MB`;
}

export type CategoryBreakdown = {
  label: string;
  type: "document" | "image" | "video" | "audio" | "other";
  sizeMB: number;
};

export function computeStorageStats(files: { name: string; size?: string }[]) {
  const totals: Record<CategoryBreakdown["type"], number> = {
    document: 0,
    image: 0,
    video: 0,
    audio: 0,
    other: 0,
  };

  let totalMB = 0;

  for (const file of files) {
    const mb = parseSizeToMB(file.size);
    const type = getFileType(file.name);
    totals[type] += mb;
    totalMB += mb;
  }

  const categories: CategoryBreakdown[] = [
    { label: "Documents", type: "document", sizeMB: totals.document },
    { label: "Photos", type: "image", sizeMB: totals.image },
    { label: "Videos", type: "video", sizeMB: totals.video },
    { label: "Musics", type: "audio", sizeMB: totals.audio },
    { label: "Other Files", type: "other", sizeMB: totals.other },
  ];

  return { totalMB, categories };
}