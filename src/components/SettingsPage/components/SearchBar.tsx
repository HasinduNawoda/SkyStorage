import React, { useState, useRef, useEffect, useCallback } from "react";
import { toSettingId, toSectionId } from "../settingsUtils";
export type { ScrollTarget } from "../settingsUtils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SearchResult {
  page: string;
  section: string;
  label: string;
  desc?: string;
  keywords?: string[];
}

// ─── Full settings index ──────────────────────────────────────────────────────

const SETTINGS_INDEX: SearchResult[] = [
  // ── Account ──────────────────────────────────────────────────────────────
  { page: "Account", section: "Profile", label: "Profile Photo", desc: "Upload or remove your profile picture", keywords: ["avatar", "picture", "image"] },
  { page: "Account", section: "Profile", label: "Full Name", desc: "Edit your display name" },
  { page: "Account", section: "Profile", label: "Display Name", desc: "Change your username" },
  { page: "Account", section: "Profile", label: "Email Address", desc: "Update your login email" },
  { page: "Account", section: "Profile", label: "Phone Number", desc: "Add a phone number to your account" },
  { page: "Account", section: "Connected Accounts", label: "Google", desc: "Connect or disconnect Google account" },
  { page: "Account", section: "Connected Accounts", label: "Apple", desc: "Connect or disconnect Apple account" },
  { page: "Account", section: "Connected Accounts", label: "GitHub", desc: "Connect or disconnect GitHub account" },
  { page: "Account", section: "Active Sessions", label: "Active Sessions", desc: "View and revoke active login sessions", keywords: ["devices", "logout", "sign out"] },
  { page: "Account", section: "Danger Zone", label: "Export Account Data", desc: "Download all your files and settings as a ZIP archive" },
  { page: "Account", section: "Danger Zone", label: "Delete Account", desc: "Permanently delete your account and all associated data" },

  // ── Privacy & Security ───────────────────────────────────────────────────
  { page: "Privacy & Security", section: "Privacy Checkup", label: "Privacy Checkup", desc: "Security score and recommended steps", keywords: ["score", "checkup", "health"] },
  { page: "Privacy & Security", section: "Authentication", label: "Password", desc: "Change your account password", keywords: ["change password", "update password"] },
  { page: "Privacy & Security", section: "Authentication", label: "Passkeys", desc: "Add or remove biometric passkeys", keywords: ["biometric", "face id", "touch id", "fingerprint"] },
  { page: "Privacy & Security", section: "Two-Factor Authentication", label: "Two-Factor Authentication", desc: "Enable 2FA via authenticator app or SMS", keywords: ["2fa", "mfa", "otp", "two factor"] },
  { page: "Privacy & Security", section: "Data Encryption", label: "End-to-End Encryption", desc: "Encrypt messages and files in transit" },
  { page: "Privacy & Security", section: "Data Encryption", label: "Encryption at Rest", desc: "Stored data encrypted with AES-256" },
  { page: "Privacy & Security", section: "Login Alerts", label: "Notify on new device login", desc: "Get an email when a new device signs in", keywords: ["login alert", "device alert"] },
  { page: "Privacy & Security", section: "Activity Log", label: "Activity Log", desc: "Browse login, upload, download, share, and permission events", keywords: ["audit", "log", "history", "events"] },

  // ── Appearance ───────────────────────────────────────────────────────────
  { page: "Appearance", section: "Theme", label: "Theme Mode", desc: "Switch between Light, Dark, or System theme", keywords: ["dark mode", "light mode", "system theme"] },
  { page: "Appearance", section: "Theme", label: "Accent Color", desc: "Choose highlight color for buttons and links", keywords: ["color", "highlight", "brand color"] },
  { page: "Appearance", section: "Font Size", label: "Text Size", desc: "Set small, medium or large text across the interface", keywords: ["font", "text size", "typography"] },
  { page: "Appearance", section: "Zoom", label: "Page Zoom", desc: "Scale the entire interface", keywords: ["zoom", "scale", "magnify"] },
  { page: "Appearance", section: "Reset", label: "Restore Defaults", desc: "Reset theme, accent, font size and zoom to defaults" },

  // ── Notifications ────────────────────────────────────────────────────────
  { page: "Notifications", section: "File Activity", label: "File shared with me", desc: "Notify when someone shares a file with you" },
  { page: "Notifications", section: "File Activity", label: "File edits", desc: "Notify when your files are edited" },
  { page: "Notifications", section: "File Activity", label: "Comments", desc: "Notify when someone comments on your file" },
  { page: "Notifications", section: "File Activity", label: "Downloads", desc: "Notify when someone downloads your file" },
  { page: "Notifications", section: "File Activity", label: "Folder invitations", desc: "Notify when invited to a folder" },
  { page: "Notifications", section: "Security Alerts", label: "New device login", desc: "Alert when a new device signs into your account" },
  { page: "Notifications", section: "Security Alerts", label: "Password change alerts", desc: "Notify when your password is updated" },
  { page: "Notifications", section: "Security Alerts", label: "Suspicious activity alerts", desc: "Detect unusual access patterns or anomalies" },
  { page: "Notifications", section: "Storage & Quota", label: "Storage usage threshold alerts", desc: "Notify when storage reaches 80%, 90%, 95%, 100%", keywords: ["quota", "storage full"] },
  { page: "Notifications", section: "Storage & Quota", label: "Upload completed", desc: "Confirm when a file upload finishes" },
  { page: "Notifications", section: "Do Not Disturb", label: "Do Not Disturb", desc: "Pause non-critical notifications for a set period", keywords: ["dnd", "mute", "silence"] },
  { page: "Notifications", section: "Notification History", label: "Notification History", desc: "Browse past notifications filtered by type", keywords: ["history", "past alerts"] },

  // ── Storage ──────────────────────────────────────────────────────────────
  { page: "Storage", section: "Storage Overview", label: "Storage Overview", desc: "See how much storage you have used", keywords: ["disk usage", "quota", "storage plan"] },
  { page: "Storage", section: "Storage Overview", label: "Storage Plan", desc: "Upgrade your storage plan", keywords: ["upgrade", "pro", "plan"] },
  { page: "Storage", section: "Duplicate File Management", label: "Prevent Duplicate Uploads", desc: "Block re-uploading files that already exist" },
  { page: "Storage", section: "Duplicate File Management", label: "Scan for Duplicates", desc: "Analyse your storage and identify redundant files", keywords: ["find duplicates", "cleanup"] },
  { page: "Storage", section: "Automatic Trash Management", label: "Auto-Empty Trash", desc: "Permanently delete trashed files after a set period", keywords: ["trash", "recycle bin", "auto delete"] },
  { page: "Storage", section: "Automatic Trash Management", label: "Delete Trash After", desc: "Set how long trashed files are kept before permanent deletion" },
  { page: "Storage", section: "Archive & Cold Storage", label: "Auto-Archive Unused Files", desc: "Move files not accessed to cold storage", keywords: ["archive", "cold storage"] },
  { page: "Storage", section: "Archive & Cold Storage", label: "Archive Files Inactive For", desc: "Set inactivity period before files are archived" },
  { page: "Storage", section: "Archive & Cold Storage", label: "Restore Archived Files", desc: "Browse and restore files in cold storage" },
  { page: "Storage", section: "Upload Restrictions", label: "Limit Upload File Size", desc: "Reject files above a certain size threshold", keywords: ["file size", "upload limit"] },
  { page: "Storage", section: "Upload Restrictions", label: "Maximum File Size", desc: "Set per-file upload size limit in MB" },
  { page: "Storage", section: "Upload Restrictions", label: "Restrict File Types", desc: "Block specific file extensions from being uploaded", keywords: ["file types", "block extension"] },
  { page: "Storage", section: "Upload Restrictions", label: "Pause Uploads When Storage Is Nearly Full", desc: "Block uploads when storage exceeds a threshold" },

  // ── Backup & Sync ────────────────────────────────────────────────────────
  { page: "Backup & Sync", section: "Backup Settings", label: "Automatic backup", desc: "Schedule device backups to cloud storage", keywords: ["cloud backup", "schedule"] },
  { page: "Backup & Sync", section: "Backup Settings", label: "Backup frequency", desc: "How often automatic backups run — hourly, daily, weekly, or custom" },
  { page: "Backup & Sync", section: "Backup Settings", label: "What to backup", desc: "Choose full system backup or select specific folders" },
  { page: "Backup & Sync", section: "Backup Settings", label: "Backup status", desc: "View last backup time, status, and files backed up" },
  { page: "Backup & Sync", section: "Backup Settings", label: "Backup over WiFi only", desc: "Prevent backup on mobile data" },
  { page: "Backup & Sync", section: "Sync Settings", label: "Enable sync", desc: "Sync files across your devices", keywords: ["file sync"] },
  { page: "Backup & Sync", section: "Sync Settings", label: "Sync direction", desc: "Set two-way or one-way sync", keywords: ["two way", "one way"] },
  { page: "Backup & Sync", section: "Sync Settings", label: "Folders to sync", desc: "Choose which folders are synced" },
  { page: "Backup & Sync", section: "Sync Settings", label: "Sync conflict resolution", desc: "What to do when the same file changes on two devices", keywords: ["conflict", "merge"] },
  { page: "Backup & Sync", section: "Sync Settings", label: "Pause sync", desc: "Temporarily stop syncing" },
  { page: "Backup & Sync", section: "Sync Settings", label: "Sync only on WiFi", desc: "Avoid syncing over mobile data" },
  { page: "Backup & Sync", section: "Device Sync Management", label: "Device Sync Management", desc: "View, force sync, or remove connected devices", keywords: ["devices", "connected"] },
  { page: "Backup & Sync", section: "Sync Activity & Logs", label: "Recent activity", desc: "View backup and sync activity logs", keywords: ["logs", "history"] },
  { page: "Backup & Sync", section: "Sync Activity & Logs", label: "Failed uploads", desc: "Retry failed file uploads" },
  { page: "Backup & Sync", section: "Advanced Backup Controls", label: "Exclude file types", desc: "Skip certain file types during backup and sync" },
  { page: "Backup & Sync", section: "Advanced Backup Controls", label: "Ignore large files", desc: "Skip files above a size threshold", keywords: ["large file", "skip big files"] },
  { page: "Backup & Sync", section: "Advanced Backup Controls", label: "Sync hidden files", desc: "Include files and folders starting with a dot" },
  { page: "Backup & Sync", section: "Advanced Backup Controls", label: "Backup hidden files", desc: "Include hidden files in backup archives" },
  { page: "Backup & Sync", section: "Backup Versioning", label: "File version history", desc: "Keep previous versions of changed files", keywords: ["version", "history", "rollback"] },
  { page: "Backup & Sync", section: "Backup Versioning", label: "Versions to keep", desc: "Maximum number of saved versions per file" },
  { page: "Backup & Sync", section: "Backup Versioning", label: "Auto-delete old versions", desc: "Remove oldest versions when the limit is reached" },
  { page: "Backup & Sync", section: "Backup Versioning", label: "Restore previous version", desc: "Browse and restore files from version history" },

  // ── System Performance ───────────────────────────────────────────────────
  { page: "System Performance", section: "Resource Usage", label: "CPU usage limit", desc: "Cap processor usage to reduce heat and preserve battery", keywords: ["cpu", "processor"] },
  { page: "System Performance", section: "Resource Usage", label: "Memory (RAM) usage limit", desc: "Manage how much RAM the app can allocate", keywords: ["ram", "memory"] },
  { page: "System Performance", section: "Resource Usage", label: "Disk I/O priority", desc: "Set how aggressively the app reads and writes to disk", keywords: ["disk", "io", "storage speed"] },
  { page: "System Performance", section: "Network Performance", label: "Upload speed limit", desc: "Throttle outbound bandwidth", keywords: ["bandwidth", "throttle", "upload"] },
  { page: "System Performance", section: "Network Performance", label: "Download speed limit", desc: "Throttle inbound bandwidth", keywords: ["bandwidth", "throttle", "download"] },
  { page: "System Performance", section: "Network Performance", label: "Adaptive bandwidth", desc: "Automatically adjust transfer speeds based on network conditions" },
  { page: "System Performance", section: "Performance Mode", label: "Performance profile", desc: "Battery Saver, Balanced, or High Performance preset", keywords: ["battery saver", "high performance", "profile"] },
  { page: "System Performance", section: "Performance Mode", label: "Pause sync on low battery", desc: "Suspend file sync when battery drops below 20%" },
  { page: "System Performance", section: "Performance Mode", label: "Pause backup on low battery", desc: "Stop automatic backups until device is charging" },
  { page: "System Performance", section: "File Preview Behavior", label: "PDF files", desc: "How PDF documents open when clicked" },
  { page: "System Performance", section: "File Preview Behavior", label: "Images", desc: "How image files open when clicked", keywords: ["image preview", "lightbox"] },
  { page: "System Performance", section: "File Preview Behavior", label: "Documents (.docx, .xlsx)", desc: "How office documents open when clicked", keywords: ["word", "excel", "office"] },
  { page: "System Performance", section: "File Preview Behavior", label: "Videos & audio", desc: "How media files open when clicked", keywords: ["video", "audio", "media player"] },

  // ── Reset Settings ───────────────────────────────────────────────────────
  { page: "Reset Settings", section: "Reset all settings", label: "Reset All Settings", desc: "Restore every setting across all categories to default", keywords: ["factory reset", "restore defaults", "reset all"] },
  { page: "Reset Settings", section: "Reset individual settings", label: "Reset Privacy & Security", desc: "Restore privacy and security settings to default" },
  { page: "Reset Settings", section: "Reset individual settings", label: "Reset Appearance", desc: "Restore appearance settings to default" },
  { page: "Reset Settings", section: "Reset individual settings", label: "Reset Notifications", desc: "Restore notification settings to default" },
  { page: "Reset Settings", section: "Reset individual settings", label: "Reset Storage", desc: "Restore storage settings to default" },
  { page: "Reset Settings", section: "Reset individual settings", label: "Reset Backup & Sync", desc: "Restore backup and sync settings to default" },
  { page: "Reset Settings", section: "Reset individual settings", label: "Reset System Performance", desc: "Restore system performance settings to default" },
];

// ─── Page icons ───────────────────────────────────────────────────────────────

const PAGE_ICONS: Record<string, string> = {
  "Account": "👤",
  "Privacy & Security": "🔒",
  "Appearance": "🎨",
  "Notifications": "🔔",
  "Storage": "💾",
  "Backup & Sync": "☁️",
  "System Performance": "⚡",
  "Reset Settings": "↺",
};

// ─── Search logic ─────────────────────────────────────────────────────────────

function scoreResult(result: SearchResult, query: string): number {
  const q = query.toLowerCase().trim();
  if (!q) return 0;

  const labelL    = result.label.toLowerCase();
  const sectionL  = result.section.toLowerCase();
  const pageL     = result.page.toLowerCase();
  const descL     = (result.desc ?? "").toLowerCase();
  const keywordsL = (result.keywords ?? []).map((k) => k.toLowerCase());

  if (labelL === q)                                    return 100;
  if (labelL.startsWith(q))                            return 90;
  if (labelL.includes(q))                              return 80;
  if (keywordsL.some((k) => k === q))                  return 75;
  if (keywordsL.some((k) => k.startsWith(q)))          return 70;
  if (keywordsL.some((k) => k.includes(q)))            return 65;
  if (descL.includes(q))                               return 55;
  if (sectionL.includes(q))                            return 45;
  if (pageL.includes(q))                               return 35;

  const words = q.split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    const allMatch = words.every((w) => labelL.includes(w) || descL.includes(w) || keywordsL.some((k) => k.includes(w)) || sectionL.includes(w));
    if (allMatch) return 30;
    const anyMatch = words.some((w) => labelL.includes(w) || descL.includes(w) || keywordsL.some((k) => k.includes(w)));
    if (anyMatch) return 15;
  }

  return 0;
}

function search(query: string): SearchResult[] {
  if (!query.trim()) return [];
  return SETTINGS_INDEX
    .map((r) => ({ result: r, score: scoreResult(r, query) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ result }) => result);
}

// ─── Highlight matching text ──────────────────────────────────────────────────

function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-blue-100 text-blue-700 rounded-sm font-medium" style={{ padding: "0 1px" }}>{part}</mark>
    ) : part
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface SearchBarProps {
  onNavigate?: (page: string, scrollTarget: { section: string; label: string }) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SearchBar({ onNavigate }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef    = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef= useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length === 0) { setResults([]); setOpen(false); setActiveIndex(-1); return; }
    const found = search(trimmed);
    setResults(found);
    setOpen(found.length > 0);
    setActiveIndex(-1);
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) { setOpen(false); setActiveIndex(-1); }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (activeIndex >= 0 && dropdownRef.current) {
      const item = dropdownRef.current.querySelector(`[data-index="${activeIndex}"]`) as HTMLElement | null;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      onNavigate?.(result.page, { section: result.section, label: result.label });
      setQuery("");
      setOpen(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
    },
    [onNavigate]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); const target = activeIndex >= 0 ? results[activeIndex] : results[0]; if (target) handleSelect(target); }
    else if (e.key === "Escape") { setOpen(false); setActiveIndex(-1); inputRef.current?.blur(); }
  };

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.page]) acc[r.page] = [];
    acc[r.page].push(r);
    return acc;
  }, {});

  const flatResults = results;

  return (
    <div ref={containerRef} className="sticky top-0 z-20 bg-white px-10 pt-4 pb-4 border-b border-gray-100">
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
          </svg>
        </div>
        <input ref={inputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown} onFocus={() => { if (results.length > 0) setOpen(true); }}
          placeholder="Search settings…" autoComplete="off" spellCheck={false}
          className="w-full pl-10 pr-24 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-150" />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {query ? (
            <button onClick={() => { setQuery(""); setOpen(false); inputRef.current?.focus(); }}
              className="w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors">
              <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] text-gray-400 bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 font-mono">⌘K</kbd>
          )}
        </div>
      </div>

      {open && results.length > 0 && (
        <div ref={dropdownRef}
          className="absolute left-10 right-10 top-full mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-100/80 overflow-hidden z-50 max-h-[420px] overflow-y-auto"
          style={{ scrollbarWidth: "none" }}>
          {Object.entries(grouped).map(([page, pageResults]) => (
            <div key={page}>
              <div className="flex items-center gap-2 px-4 pt-3 pb-1.5">
                <span className="text-base leading-none">{PAGE_ICONS[page] ?? "⚙️"}</span>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{page}</span>
              </div>
              {pageResults.map((result) => {
                const flatIdx = flatResults.indexOf(result);
                const isActive = flatIdx === activeIndex;
                return (
                  <button key={`${result.page}-${result.section}-${result.label}`} data-index={flatIdx}
                    onClick={() => handleSelect(result)} onMouseEnter={() => setActiveIndex(flatIdx)}
                    className={`w-full text-left flex items-start gap-3 px-4 py-2.5 transition-colors ${isActive ? "bg-blue-50" : "hover:bg-gray-50"}`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${isActive ? "bg-blue-100" : "bg-gray-100"}`}>
                      <svg className={`w-3.5 h-3.5 ${isActive ? "text-blue-600" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 2v2m0 16v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M2 12h2m16 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium ${isActive ? "text-blue-700" : "text-gray-800"}`}>{highlight(result.label, query)}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-gray-400 truncate">{result.section}</span>
                        {result.desc && (<><span className="text-gray-300">·</span><span className="text-xs text-gray-400 truncate">{highlight(result.desc, query)}</span></>)}
                      </div>
                    </div>
                    <svg className={`w-4 h-4 shrink-0 mt-1.5 transition-opacity ${isActive ? "opacity-100 text-blue-400" : "opacity-0"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                );
              })}
            </div>
          ))}
          <div className="flex items-center gap-4 px-4 py-2.5 border-t border-gray-100 bg-gray-50/60">
            <span className="flex items-center gap-1.5 text-[11px] text-gray-400"><kbd className="bg-white border border-gray-200 rounded px-1 py-0.5 font-mono text-[10px]">↑↓</kbd>navigate</span>
            <span className="flex items-center gap-1.5 text-[11px] text-gray-400"><kbd className="bg-white border border-gray-200 rounded px-1 py-0.5 font-mono text-[10px]">↵</kbd>open</span>
            <span className="flex items-center gap-1.5 text-[11px] text-gray-400"><kbd className="bg-white border border-gray-200 rounded px-1 py-0.5 font-mono text-[10px]">esc</kbd>close</span>
          </div>
        </div>
      )}

      {open && query.trim() && results.length === 0 && (
        <div className="absolute left-10 right-10 top-full mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-100/80 z-50 px-4 py-6 text-center">
          <div className="text-2xl mb-2">🔍</div>
          <div className="text-sm font-medium text-gray-600">No results for "{query}"</div>
          <div className="text-xs text-gray-400 mt-1">Try searching for a setting name, section, or keyword</div>
        </div>
      )}
    </div>
  );
}
