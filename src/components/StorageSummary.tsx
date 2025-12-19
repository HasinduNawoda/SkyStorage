import { AbsoluteCenter, ProgressCircle } from "@chakra-ui/react"
import { Box, Circle, Float, VisuallyHidden } from "@chakra-ui/react"
import docIcon from "../assets/icons/doc.png"
import photoIcon from "../assets/icons/image.png"
import videoIcon from "../assets/icons/mp4.png"
import musicIcon from "../assets/icons/mp3.png"
import otherIcon from "../assets/icons/other.png"
import bell from "../assets/icons/bell.png"
import userIcon from "../assets/icons/user icon.png"
import upload from "../assets/icons/upload.png"


export default function RightSidebar() {

  const Demo = () => {
  return (
    <div className="flex justify-center my-8">
      <div className="flex flex-col items-center scale-[2] gap-2">
        <ProgressCircle.Root size="xl" value={75}>
          <ProgressCircle.Circle>
            <ProgressCircle.Track />
            <ProgressCircle.Range stroke="blue.500" />
          </ProgressCircle.Circle>

          <AbsoluteCenter>
            <ProgressCircle.ValueText color="blue.500" />
          </AbsoluteCenter>
        </ProgressCircle.Root>

        <div className="text-sm text-gray-600 scale-100" >
          75 / 100 GB used
        </div>
      </div>
    </div>
  )
}


  const categories = [
    { label: "Documents", size: "2.2 GB",  icon: docIcon },
    { label: "Photos", size: "13 GB",  icon: photoIcon },
    { label: "Videos", size: "42 GB",  icon: videoIcon },
    { label: "Musics", size: "1.8 GB",  icon: musicIcon },
    { label: "Other Files", size: "16 GB",  icon: otherIcon },
  ]

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex justify-between items-center mb-4">
      <span className="flex justify-between items-center mb-4">
  {/* Bell with badge */}
  <Box position="relative">
    <img
      src={bell}
      alt="Notifications"
      className="w-12 h-12 cursor-pointer"
    />

    <Float offset="2">
      <Circle size="5" bg="red.500" color="white" fontSize="xs">
        3
      </Circle>
    </Float>

    <VisuallyHidden>3 notifications</VisuallyHidden>
  </Box></span>
        <span className="text-3xl font-bold text-blue-500">Storage</span>
        <span className="text-2xl cursor-pointer"><img src={userIcon} alt="user icon" className="w-12 h-12" /></span>
      </div>

      <div className="bg-white p-4 rounded shadow flex flex-col gap-8">
        <Demo />

        {categories.map((cat, idx) => (
          <div key={idx} className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                    <img src={cat.icon} alt={cat.label} className="w-10 h-10" />
              <span></span>
              {cat.label}
            </div>
            <div className={`${cat} text-black px-2 py-1 rounded`}>
              {cat.size}
            </div>
          </div>
        ))}
      </div>

      <button className="mt-6 w-full bg-blue-500 text-xl text-white py-3 rounded hover:bg-blue-600 transition">
        <img src={upload} alt="Upload" className=" w-8 h-8 inline-block mr-2" />
        Upload Files
      </button>
    </div>
  )
}
