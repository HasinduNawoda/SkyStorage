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

// Add the formatDate function here if you don't want to create a separate file
const formatDate = (dateString: string | Date): string => {
  const date = new Date(dateString);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
};

type FileTable = {
  name: string
  size: string
  lastModified: string
  dateShared?: string  // Add this new prop
  people?: { email: string }[]
  isFavorite: boolean
  onToggleFavorite: () => void
  isDeleted?: boolean
  onToggleDelete:()=>void
  onShare?: (payload: any) => void
  isShared?: boolean
  message?: string
}

function getIconByType(type: string) {
  if (type === "document") return docIcon
  if (type === "image") return imageIcon
  if (type === "video") return videoIcon
  if (type === "audio") return audioIcon
  return otherIcon
}

export default function FilesTable({
  name,
  size,
  lastModified,
  dateShared,  // Destructure this new prop
  people,
  isFavorite,
  onToggleFavorite,
  isDeleted,
  onToggleDelete,
  onShare,
  message,
  isShared
}: FileTable) {

const icon = getIconByType(getFileType(name))
const [openMsg, setOpenMsg] = useState(false)
const [open, setOpen] = useState(false)

// Format the dateShared if it exists and is in ISO format
const formatDateIfNeeded = (dateString: string): string => {
  if (dateString && (dateString.includes('T') || dateString.includes('-'))) {
    // Looks like an ISO date, format it
    return formatDate(dateString);
  }
  return dateString;
};

// Determine which date to display
const displayDate = isShared && dateShared 
  ? formatDateIfNeeded(dateShared)  // Format the shared date
  : lastModified;  // Use lastModified as-is for other views

return (
  <tr className="group hover:bg-gray-100 cursor-pointer">
    <td className="px-4 py-2 w-[420px]">
      <div className="relative flex items-center gap-3">
        <img src={icon} className="w-6 h-6 shrink-0" />
        <span className="truncate max-w-[220px]">{name}</span>
        <div className="absolute right-0 hidden group-hover:flex items-center gap-3 bg-gray-100 pl-3">
          <button>
            <img src={download} className="w-4 h-4 opacity-70 hover:opacity-100" />
          </button>
          <button onClick={onToggleDelete}>
            <img src={isDeleted ? deleted : trash} className="w-4 h-4 opacity-70 hover:opacity-100" />
          </button>
          {!isDeleted && (
            <button onClick={() => setOpen(true)}>
              <img src={share} className="w-4 h-4 opacity-70 hover:opacity-100 " />
            </button>
          )}
          <ShareModal 
            open={open} 
            onClose={() => setOpen(false)} 
            fileName={name}
            onShare={(payload: any) => {
              onShare?.(payload)
              setOpen(false);
            }}
          />
          <button>
            <img src={more} className="w-4 h-4 opacity-70 hover:opacity-100" />
          </button>
          {!isDeleted && (
            <button onClick={onToggleFavorite}>
              <img
                src={isFavorite ? fav : star}
                className="w-4 h-4"
              />
            </button>
          )}
        </div>
      </div>
    </td>

    <td className="px-4 py-2 w-[120px]">{size}</td>
    {/* Updated: Show formatted shared date when in shared view */}
    <td className="px-4 py-2 w-[160px]">{displayDate}</td>
    <td className="px-4 py-2 w-[160px] text-center">
      {people && people.length > 0 ? (
        <MembersAvatars emails={people.map(p => p.email)} />
      ) : (
        <span className="text-gray-400 text-sm text-center">—</span>
      )}
    </td>

    {isShared && (
      <td className="px-4 py-2">
        <button
          disabled={!message}
          onClick={() => setOpenMsg(true)}
          className={`px-3 py-1 rounded text-sm
            ${message
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"}
          `}
        >
          View
        </button>

        {openMsg && (
          <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            onClick={() => setOpenMsg(false)}
          >
            <div
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-lg p-6 max-w-lg shadow-xl"
            >
              <h3 className="text-lg font-semibold mb-3">Message</h3>
              <p className="whitespace-pre-wrap text-gray-700">
                {message}
              </p>
              <button
                onClick={() => setOpenMsg(false)}
                className="mt-4 text-sm text-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </td>
    )}
  </tr>
)
}