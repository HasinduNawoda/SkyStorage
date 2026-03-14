import React, { useState } from "react";
import back from "../../assets/icons/back-button.png";
import Sidebar from "./components/Sidebar";
import SearchBar from "./components/SearchBar";
import { toSettingId, toSectionId } from "./settingsUtils";

// Import all setting components
import AccountSettings from "./settings/AccountSettings";
import PrivacySecurity from "./settings/Privacy&SecuritySettings";
import Appearance from "./settings/AppearanceSettings";
import Notifications from "./settings/NotificationsSettings";
import Storage from "./settings/StorageSettings";
import BackupSync from "./settings/BackupSettings";
import SystemPerformance from "./settings/SystemSettings";
import ResetSettings from "./settings/ResetSettings";

type Props = { onBack: () => void };

const menuItems = [
  "Account",
  "Privacy & Security",
  "Appearance",
  "Notifications",
  "Storage",
  "Backup & Sync",
  "System Performance",
  "Reset Settings",
];

const settingsComponents: Record<string, React.ReactNode> = {
  "Account":            <AccountSettings />,
  "Privacy & Security": <PrivacySecurity />,
  "Appearance":         <Appearance />,
  "Notifications":      <Notifications />,
  "Storage":            <Storage />,
  "Backup & Sync":      <BackupSync />,
  "System Performance": <SystemPerformance />,
  "Reset Settings":     <ResetSettings />,
};

export default function SettingsPage({ onBack }: Props) {
  const [active, setActive] = useState("Account");

  /**
   * handleNavigate
   * ─────────────
   * Called by SearchBar when the user picks a result.
   *
   * 1. Switch to the target page.
   * 2. Wait for React to commit the new component to the DOM (two rAF ticks).
   * 3. Find the element by its setting ID, falling back to the section ID.
   * 4. Scroll it to the center of the viewport.
   * 5. Flash a blue ring for 1.5 s so the row is unmissable.
   */
  const handleNavigate = (page: string, scrollTarget: { section: string; label: string }) => {
    setActive(page);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el =
          document.getElementById(toSettingId(scrollTarget.label)) ??
          document.getElementById(toSectionId(scrollTarget.section));

        if (!el) return;

        el.scrollIntoView({ behavior: "smooth", block: "center" });

        el.classList.add("ring-2", "ring-blue-400", "ring-offset-2", "rounded-xl", "transition-all");
        setTimeout(() => {
          el.classList.remove("ring-2", "ring-blue-400", "ring-offset-2", "rounded-xl", "transition-all");
        }, 1500);
      });
    });
  };

  return (
    <div className="h-screen flex bg-gray-50 text-gray-900 overflow-hidden">
      <aside className="w-64 flex flex-col h-screen">
        <div className="flex items-center gap-4 px-6 py-5 border-b bg-white">
          <button onClick={onBack}>
            <img src={back} alt="Back" className="w-10 h-10" />
          </button>
          <h2 className="text-2xl font-semibold">Settings</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <Sidebar menuItems={menuItems} active={active} setActive={setActive} />
        </div>
      </aside>

      <main className="flex-1 h-screen bg-white flex flex-col overflow-hidden">
        <SearchBar onNavigate={handleNavigate} />
        <div className="flex-1 overflow-y-auto px-10 py-8 space-y-6">
          {settingsComponents[active]}
        </div>
      </main>
    </div>
  );
}
