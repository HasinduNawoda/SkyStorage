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


type FileRowProps = {
  name: string
  size: string
  lastModified: string
  members?: string
  isFavorite: boolean
  onToggleFavorite: () => void
  isDeleted?: boolean
  onToggleDelete:()=>void
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
  members,
  isFavorite,
  onToggleFavorite,
  isDeleted,
  onToggleDelete,
}: FileRowProps) {

const icon = getIconByType(getFileType(name))


  return (
    <tr className="group hover:bg-gray-100 cursor-pointer">
      {/* NAME COLUMN */}
      <td className="px-4 py-2 w-[420px]">
        <div className="relative flex items-center gap-3">
          <img src={icon} className="w-6 h-6 shrink-0" />

          {/* File name */}
          <span className="truncate max-w-[220px]">{name}</span>

          {/* Actions */}
          <div className="absolute right-0 hidden group-hover:flex items-center gap-3 bg-gray-100 pl-3">
<button>
              <img src={download} className="w-4 h-4 opacity-70 hover:opacity-100" />
            </button>
            <button onClick={onToggleDelete}>
              <img src={isDeleted ? deleted : trash} className="w-4 h-4 opacity-70 hover:opacity-100" />
            </button>
            <button>
              <img src={share} className="w-4 h-4 opacity-70 hover:opacity-100" />
            </button>
            <button>
              <img src={more} className="w-4 h-4 opacity-70 hover:opacity-100" />
            </button>

            <button onClick={onToggleFavorite}>
  <img
    src={isFavorite ? fav : star}
    className="w-4 h-4"
  />
</button>

          </div>
        </div>
      </td>

      <td className="px-4 py-2 w-[120px]">{size}</td>
      <td className="px-4 py-2 w-[160px]">{lastModified}</td>
      <td className="px-4 py-2 w-[120px]">{members || "-"}</td>
    </tr>
  )
}
