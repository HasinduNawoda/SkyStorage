import docIcon from "../assets/icons/doc.png"
import imageIcon from "../assets/icons/image.png"
import videoIcon from "../assets/icons/mp4.png"
import audioIcon from "../assets/icons/mp3.png"
import otherIcon from "../assets/icons/other.png"
import share from "../assets/icons/shareicon.png"
import download from "../assets/icons/downloadicon.png"
import trash from "../assets/icons/bin.png"
import more from "../assets/icons/moreicon.png"
import star from "../assets/icons/star.png"
import fav from "../assets/icons/fav.png"
import { getFileType } from "../utils/FileType"
import deleted from "../assets/icons/deleted.png"
import { useState } from "react"
import ShareModal from "./ShareModal"
import MembersAvatars from "./MembersAvatars"
import FileMenu from "./FileMenu"

const formatDate = (dateString: string | Date): string => {
  const date = new Date(dateString)
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

type FileTable = {
  /** Stable DOM id used by SelectionOverlay for bounding-box hit-testing. */
  domId?: string
  name: string
  size: string
  lastModified: string
  dateShared?: string
  people?: { email: string }[]
  isFavorite: boolean
  onToggleFavorite: () => void
  isDeleted?: boolean
  onToggleDelete: () => void
  onShare?: (payload: any) => void
  isShared?: boolean
  message?: string
  /** The real File/Blob captured at upload time, if available — used for real downloads. */
  blob?: Blob
  /** Called when the user wants to download this file (hover icon or menu item). */
  onDownload?: () => void

  // Select mode
  selectMode?: boolean
  isSelected?: boolean
  onToggleSelect?: () => void

  /**
   * When the user right-clicks this row while it's selected, call this instead
   * of opening the per-file menu so the parent can show the bulk menu.
   */
  onBulkRightClick?: (x: number, y: number) => void
  /** Total items selected – used to decide whether to invoke bulk right-click. */
  selectedCount?: number
}

function getIconByType(type: string) {
  if (type === "document") return docIcon
  if (type === "image") return imageIcon
  if (type === "video") return videoIcon
  if (type === "audio") return audioIcon
  return otherIcon
}

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