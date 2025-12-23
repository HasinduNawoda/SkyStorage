import { useState } from "react"
import dashboard from "../assets/icons/dashboard.png"
import favorites from "../assets/icons/star.png"
import shared from "../assets/icons/share.png"
import recycleBin from "../assets/icons/bin.png"
import deepClean from "../assets/icons/brush.png"
import settings from "../assets/icons/setting.png"

type Props = {
  activeView: "dashboard" | "favorites" |"deletedFiles" |"folders"| "files"
  onNavigate: (view: "dashboard" | "favorites"|"deletedFiles" |"folders" | "files") => void
}


export default function Sidebar({ activeView, onNavigate }: Props) {

 
const menuItems: {
  label: string
  view: "dashboard" | "favorites" | "files"|"deletedFiles"
  icon: string
}[] = [
  { label: "Dashboard", view: "dashboard", icon: dashboard },
  { label: "Favorites", view: "favorites", icon: favorites },
    /*{ label: "Shared", icon: shared },*/
    { label: "Recycle Bin", view:"deletedFiles", icon: recycleBin },
    /*{ label: "Deep Clean", icon: deepClean },
    { label: "Settings", icon: settings },*/
]
  return (
    <div className="w-1/5 h-screen bg-white text-gray-800 p-4 flex flex-col shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">SkyStorage</h1>

      <nav className="flex flex-col gap-3">
        {menuItems.map((item) => {
const isActive =
  (item.label === "Dashboard" && activeView === "dashboard") ||
  (item.label === "Favorites" && activeView === "favorites") ||
  (item.label === "Recycle Bin" && activeView === "deletedFiles");


          return (
            <button
              key={item.label}
              onClick={() => onNavigate(item.view)}

              className={`relative flex items-center gap-3 px-3 py-2 rounded transition
                ${isActive ? "opacity-100 scale-110" : "opacity-50 hover:opacity-80"}
              `}
            >
              {/* Icon */}
              <img src={item.icon} alt={item.label} className="w-8 h-8" />

              {/* Label */}
              <span className="font-medium">{item.label}</span>

              {/* Blue active marker */}
              {isActive && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-l " />
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
