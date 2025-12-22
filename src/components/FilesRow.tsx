import doc from "../assets/icons/doc.png"
import image from "../assets/icons/image.png"
import video from "../assets/icons/mp4.png"
import music from "../assets/icons/mp3.png"
import other from "../assets/icons/other.png"
import { useState } from "react"
import { getFileType } from "../utils/FileType"

type FileItem = {
  name: string
}

type Props = {
  files: FileItem[]
}

export default function FilesRow({ files }: Props) {
  const [active, setActive] = useState<string | null>(null)

  const counts = {
    document: 0,
    image: 0,
    video: 0,
    audio: 0,
    other: 0,
  }

  files.forEach(file => {
    const type = getFileType(file.name)
    counts[type]++
  })

    const items = [
    { label: "Documents", icon: doc, count: counts.document },
    { label: "Images", icon: image, count: counts.image },
    { label: "Videos", icon: video, count: counts.video },
    { label: "Music", icon: music, count: counts.audio },
    { label: "Other", icon: other, count: counts.other },
  ]

    return (
        <div className="flex gap-6 mt-14 mb-8">
            {items.map((item, idx) => {
        const isActive = active === item.label
        const opacityClass = active
          ? isActive
            ? "opacity-100"
            : "opacity-80"
          : "opacity-100"

                return (
                    <button
                        key={idx}
                        onClick={() => setActive(item.label)}
                        className={`flex-1 flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-200
              border border-gray-200 hover:bg-gray-300 hover:scale-110
                                   ${opacityClass} ${isActive ? "scale-110" : ""} hover:opacity-100`}
                    >
                        <img src={item.icon} className="w-6 h-6" />
                        <span className="text-sm font-medium text-gray-700">
                            {item.count} files
                        </span>
                    </button>
        )
            })}
        </div>
  )
}
