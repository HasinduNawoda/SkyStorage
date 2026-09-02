import { useEffect, useRef, useState } from "react"
import { AbsoluteCenter, ProgressCircle } from "@chakra-ui/react"
import { formatMB, type CategoryBreakdown } from "../utils/storageStats"
import docIcon from "../assets/icons/doc.png"
import photoIcon from "../assets/icons/image.png"
import videoIcon from "../assets/icons/mp4.png"
import musicIcon from "../assets/icons/mp3.png"
import otherIcon from "../assets/icons/other.png"
import userIcon from "../assets/icons/user icon.png"
import upload from "../assets/icons/upload.png"
import NotificationBell from "./NotificationBell"

interface RightSidebarProps {
  user?: any;
  onUploadFile: () => void;
  totalUsedMB: number;
  categories: CategoryBreakdown[];
  capMB?: number;
  onNavigateSettings?: (page: string, section?: string, label?: string) => void;
  onSignOut?: () => void;
}

const ICON_BY_TYPE: Record<CategoryBreakdown["type"], string> = {
  document: docIcon,
  image: photoIcon,
  video: videoIcon,
  audio: musicIcon,
  other: otherIcon,
}

const USER_MENU_ITEMS = [
  { key: "account", label: "Account Settings" },
  { key: "activity", label: "Activity Log" },
  { key: "devices", label: "Devices" },
  { key: "feedback", label: "Feedback" },
] as const;

export default function RightSidebar({
  user,
  onUploadFile,
  totalUsedMB,
  categories,
  capMB = 100,
  onNavigateSettings,
  onSignOut,
}: RightSidebarProps) {

  const percentUsed = capMB > 0 ? Math.min(100, Math.round((totalUsedMB / capMB) * 100)) : 0;

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setUserMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [userMenuOpen]);

  const handleMenuItemClick = (key: (typeof USER_MENU_ITEMS)[number]["key"]) => {
    setUserMenuOpen(false);
    switch (key) {
      case "account":
        // No section/label needed — Account is already the default page.
        onNavigateSettings?.("Account");
        break;
      case "activity":
        onNavigateSettings?.("Privacy & Security", "Activity Log", "Activity Log");
        break;
      case "devices":
        // "Devices" surfaces via the Login Alerts section (new-device sign-in notifications).
        onNavigateSettings?.("Privacy & Security", "Login Alerts", "Login Alerts");
        break;
      case "feedback":
        // Placeholder — no feedback page exists yet.
        break;
    }
  };

  const handleSignOut = () => {
    setUserMenuOpen(false);
    onSignOut?.();
  };

  const Demo = () => {
    return (
      <div className="flex justify-center my-8">
        <div className="flex flex-col items-center scale-[2] gap-2">
          <ProgressCircle.Root size="xl" value={percentUsed}>
            <ProgressCircle.Circle>
              <ProgressCircle.Track />
              <ProgressCircle.Range stroke="blue.500" />
            </ProgressCircle.Circle>

            <AbsoluteCenter>
              <ProgressCircle.ValueText color="blue.500" />
            </AbsoluteCenter>
          </ProgressCircle.Root>

          <div className="text-sm text-gray-600 scale-100">
            {formatMB(totalUsedMB)} / {formatMB(capMB)} used
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex justify-between items-center mb-4">
        <span className="flex justify-between items-center mb-4">
          <NotificationBell />
        </span>
        <span className="text-3xl font-bold text-blue-500">Storage</span>
          <div className="relative" ref={userMenuRef}>
            <button 
              onClick={() => setUserMenuOpen((open) => !open)}
              className="text-2xl cursor-pointer rounded-full transition-shadow hover:ring-2 hover:ring-blue-100 flex items-center justify-center overflow-hidden w-12 h-12"
              aria-haspopup="menu"
              aria-expanded={userMenuOpen}
            >
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt="user profile" className="w-full h-full object-cover" />
              ) : user?.name ? (
                <div className="w-full h-full bg-blue-600 flex items-center justify-center font-bold text-white text-base">
                  {user.name.substring(0, 2).toUpperCase()}
                </div>
              ) : (
                <img src={userIcon} alt="user icon" className="w-full h-full" />
              )}
            </button>

          {userMenuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-20"
            >
              {USER_MENU_ITEMS.map((item) => (
                <button
                  key={item.key}
                  role="menuitem"
                  onClick={() => handleMenuItemClick(item.key)}
                  className="w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                >
                  {item.label}
                </button>
              ))}
              <div className="border-t border-gray-100" />
              <button
                role="menuitem"
                onClick={handleSignOut}
                className="w-full px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors text-left"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow flex flex-col gap-8">
        <Demo />

        {categories.map((cat) => (
          <div key={cat.type} className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <img src={ICON_BY_TYPE[cat.type]} alt={cat.label} className="w-10 h-10" />
              <span></span>
              {cat.label}
            </div>
            <div className="text-black px-2 py-1 rounded">
              {formatMB(cat.sizeMB)}
            </div>
          </div>
        ))}
      </div>

      <button
      onClick={() => {
        onUploadFile();
      }}        
      className="mt-1 w-full bg-blue-500 text-xl text-white py-3 rounded hover:bg-blue-600 transition flex items-center justify-center gap-2"
      >
        <img src={upload} alt="Upload" className="w-8 h-8" />
        Upload Files
      </button>
    </div>
  )
}