import { useState } from "react"
import dashboard from "../assets/icons/dashboard.png"
import favorites from "../assets/icons/star.png"
import shared from "../assets/icons/share.png"
import recycleBin from "../assets/icons/bin.png"
import deepClean from "../assets/icons/brush.png"
import settings from "../assets/icons/setting.png"

type Props = {
  onNavigate: (view: "dashboard" | "files" | "favorites") => void
}

export default function Sidebar({ onNavigate }: Props) {
  const [active, setActive] = useState("Dashboard")

  const menuItems = [
    { label: "Dashboard", icon: dashboard },
    { label: "Favorites", icon: favorites },
    { label: "Shared", icon: shared },
    { label: "Recycle Bin", icon: recycleBin },
    { label: "Deep Clean", icon: deepClean },
    { label: "Settings", icon: settings },
  ]

  return (
    <div className="w-1/5 h-screen bg-white text-gray-800 p-4 flex flex-col shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">SkyStorage</h1>

      <nav className="flex flex-col gap-3">
        {menuItems.map((item) => {
          const isActive = active === item.label

          return (
            <button
              key={item.label}
              onClick={() => {
  setActive(item.label)
  if (item.label === "Dashboard") onNavigate("dashboard")
  if (item.label === "Favorites") onNavigate("favorites")
}}
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
