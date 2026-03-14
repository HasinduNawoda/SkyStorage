import { useState } from "react";
import { toSectionId, toSettingId } from "../settingsUtils";

interface ToggleRowProps { label: string; desc: string; checked: boolean; onChange: (val: boolean) => void; last?: boolean; }
interface CheckRowProps  { label: string; checked: boolean; onChange: (val: boolean) => void; last?: boolean; }
interface ThresholdLevel { label: string; active: boolean; }
type NotifCategory = "file" | "security" | "storage";
interface NotifEntry { id: number; category: NotifCategory; title: string; meta: string; time: string; icon: string; iconBg: string; badge: string; badgeColor: string; }

const ALL_NOTIFICATIONS: NotifEntry[] = [
  { id: 1,  category: "file",     title: "File shared with you",        meta: "design_assets.zip shared by alex@company.com",          time: "2 min ago",   icon: "🔗", iconBg: "bg-orange-50", badge: "Share",    badgeColor: "bg-orange-50 text-orange-600 border border-orange-200" },
  { id: 2,  category: "security", title: "New device login",             meta: "Chrome · Kandy, LK",                                    time: "18 min ago",  icon: "🔒", iconBg: "bg-red-50",    badge: "Security", badgeColor: "bg-red-50 text-red-500 border border-red-200" },
  { id: 3,  category: "storage",  title: "Storage at 80%",               meta: "You've used 8.0 GB of your 10 GB quota",                 time: "1 hr ago",    icon: "💾", iconBg: "bg-yellow-50", badge: "Storage",  badgeColor: "bg-yellow-50 text-yellow-600 border border-yellow-200" },
  { id: 4,  category: "file",     title: "File edited",                  meta: "Q4_Report_Final.pdf was edited by nina@company.com",     time: "3 hrs ago",   icon: "✏️", iconBg: "bg-blue-50",   badge: "Edit",     badgeColor: "bg-blue-50 text-blue-600 border border-blue-200" },
  { id: 5,  category: "security", title: "Password changed",             meta: "Your account password was updated",                      time: "Yesterday",   icon: "🔑", iconBg: "bg-red-50",    badge: "Security", badgeColor: "bg-red-50 text-red-500 border border-red-200" },
  { id: 6,  category: "file",     title: "Comment on your file",         meta: "contracts/NDA_2025.pdf",                                 time: "Yesterday",   icon: "💬", iconBg: "bg-purple-50", badge: "Comment",  badgeColor: "bg-purple-50 text-purple-600 border border-purple-200" },
  { id: 7,  category: "storage",  title: "Upload completed",             meta: "backup_march2025.zip · 112 MB",                          time: "2 days ago",  icon: "📤", iconBg: "bg-green-50",  badge: "Upload",   badgeColor: "bg-green-50 text-green-600 border border-green-200" },
  { id: 8,  category: "file",     title: "Folder invitation",            meta: "You were invited to /team/projects by admin@company.com",time: "2 days ago",  icon: "📁", iconBg: "bg-blue-50",   badge: "Folder",   badgeColor: "bg-blue-50 text-blue-600 border border-blue-200" },
  { id: 9,  category: "security", title: "Suspicious activity detected", meta: "Multiple failed login attempts from 192.168.4.21",        time: "3 days ago",  icon: "⚠️", iconBg: "bg-red-50",    badge: "Security", badgeColor: "bg-red-50 text-red-500 border border-red-200" },
  { id: 10, category: "storage",  title: "Storage at 95%",               meta: "You've used 9.5 GB of your 10 GB quota",                 time: "4 days ago",  icon: "💾", iconBg: "bg-yellow-50", badge: "Storage",  badgeColor: "bg-yellow-50 text-yellow-600 border border-yellow-200" },
];

const TABS = [
  { label: "All",      value: "all"      },
  { label: "File",     value: "file"     },
  { label: "Security", value: "security" },
  { label: "Storage",  value: "storage"  },
] as const;

type TabValue = typeof TABS[number]["value"];
const PAGE_SIZE = 5;

function NotificationHistory() {
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [showAll, setShowAll]     = useState(false);

  const filtered = activeTab === "all" ? ALL_NOTIFICATIONS : ALL_NOTIFICATIONS.filter((n) => n.category === activeTab);
  const visible   = showAll ? filtered : filtered.slice(0, PAGE_SIZE);
  const remaining = filtered.length - PAGE_SIZE;

  const handleTab = (v: TabValue) => { setActiveTab(v); setShowAll(false); };

  return (
    <div id={toSectionId("Notification History")} className="mb-8">
      <h2 className="text-base font-semibold text-gray-700 mb-3">Notification History</h2>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div id={toSettingId("Notification History")} className="px-6 pt-4 pb-3 flex items-center gap-2 border-b border-gray-100">
          {TABS.map((tab) => (
            <button key={tab.value} onClick={() => handleTab(tab.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.value ? "bg-gray-800 text-white" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 border border-gray-200"}`}>
              {tab.label}
            </button>
          ))}
        </div>
        {visible.length === 0 ? (
          <div className="px-8 py-8 text-sm text-gray-400 text-center">No notifications in this category.</div>
        ) : (
          visible.map((n, i) => (
            <div key={n.id} className={`px-6 py-4 flex items-center justify-between gap-4 ${i < visible.length - 1 || (!showAll && remaining > 0) ? "border-b border-gray-100" : ""}`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-xl ${n.iconBg} flex items-center justify-center text-base shrink-0`}>{n.icon}</div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-gray-800 font-medium">{n.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${n.badgeColor}`}>{n.badge}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5 truncate">{n.meta}</div>
                </div>
              </div>
              <span className="text-xs text-gray-400 shrink-0 whitespace-nowrap">{n.time}</span>
            </div>
          ))
        )}
        {!showAll && remaining > 0 && (
          <div className="px-6 py-3">
            <button onClick={() => setShowAll(true)} className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
              Show {remaining} more {remaining === 1 ? "notification" : "notifications"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className={`relative inline-flex h-[22px] w-[40px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${checked ? "bg-blue-500" : "bg-gray-200"}`}>
      <span className={`pointer-events-none inline-block h-[18px] w-[18px] rounded-full bg-white shadow transform transition duration-200 ${checked ? "translate-x-[18px]" : "translate-x-0"}`} />
    </button>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div id={toSectionId(title)} className="mb-8">
      <h2 className="text-base font-semibold text-gray-700 mb-3">{title}</h2>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function Row({ id, children, last = false }: { id?: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div id={id} className={`px-8 py-4 flex items-center justify-between gap-4 ${!last ? "border-b border-gray-100" : ""}`}>
      {children}
    </div>
  );
}

function ToggleRow({ label, desc, checked, onChange, last = false }: ToggleRowProps) {
  return (
    <Row id={toSettingId(label)} last={last}>
      <div className="min-w-0">
        <div className="text-sm text-gray-800">{label}</div>
        <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </Row>
  );
}

function CheckRow({ label, checked, onChange, last = false }: CheckRowProps) {
  const id = `chk-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div id={toSettingId(label)} className={`px-8 py-3.5 flex items-center gap-3 ${!last ? "border-b border-gray-100" : ""}`}>
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        className="w-[15px] h-[15px] accent-blue-500 cursor-pointer shrink-0" />
      <label htmlFor={id} className="text-sm text-gray-800 cursor-pointer select-none">{label}</label>
    </div>
  );
}

const DND_PRESETS = [
  { label: "1 hr",   value: 1   },
  { label: "5 hrs",  value: 5   },
  { label: "12 hrs", value: 12  },
  { label: "1 day",  value: 24  },
  { label: "3 days", value: 72  },
  { label: "1 week", value: 168 },
];

function DndPicker() {
  const [selected, setSelected] = useState<number | null>(null);
  const [manual, setManual]     = useState("");

  const selectPreset = (val: number) => { setSelected(val); setManual(""); };
  const handleManual = (v: string)   => { setManual(v); setSelected(null); };

  const activeHrs = selected ?? (manual ? parseInt(manual) : null);
  const hint = activeHrs && activeHrs > 0
    ? `DND active for ${activeHrs < 24 ? `${activeHrs} hr${activeHrs > 1 ? "s" : ""}` : `${activeHrs / 24} day${activeHrs >= 48 ? "s" : ""}`}. Security alerts will still be delivered.`
    : "Security alerts will still be delivered during DND.";

  return (
    <div className="px-8 pb-5 pt-3 border-t border-gray-100">
      <div className="text-xs text-gray-400 mb-2">Quick select duration</div>
      <div className="flex flex-wrap gap-2 mb-4">
        {DND_PRESETS.map((p) => (
          <button key={p.value} onClick={() => selectPreset(p.value)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${selected === p.value ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"}`}>
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400 shrink-0">Or enter manually</span>
        <input type="number" min={1} value={manual} onChange={(e) => handleManual(e.target.value)} placeholder="e.g. 6"
          className="w-20 text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-gray-800" />
        <span className="text-xs text-gray-400">hrs</span>
      </div>
      <p className="text-xs text-gray-400 mt-3 italic">{hint}</p>
    </div>
  );
}

export default function NotificationSettings() {
  const [fileActivity, setFileActivity] = useState({
    sharedWithMe: true, filesEdited: true, comments: true, downloads: false, folderInvitations: true,
  });
  const setFA = (key: keyof typeof fileActivity) => (val: boolean) => setFileActivity((s) => ({ ...s, [key]: val }));

  const [security, setSecurity] = useState({ newDevice: true, passwordChange: true, suspiciousActivity: true });
  const setSec = (key: keyof typeof security) => (val: boolean) => setSecurity((s) => ({ ...s, [key]: val }));

  const [storage, setStorage] = useState({ thresholdEnabled: true, uploadComplete: true });
  const setSto = (key: keyof typeof storage) => (val: boolean) => setStorage((s) => ({ ...s, [key]: val }));

  const [thresholds, setThresholds] = useState<ThresholdLevel[]>([
    { label: "80%", active: true }, { label: "90%", active: true }, { label: "95%", active: true }, { label: "100%", active: true },
  ]);
  const toggleThreshold = (i: number) => setThresholds((t) => t.map((x, idx) => (idx === i ? { ...x, active: !x.active } : x)));

  const [dndEnabled, setDndEnabled] = useState(false);

  return (
    <div className="max-w-[90%]">
      <div className="mb-7">
        <h3 className="text-2xl font-semibold text-gray-800">Notification Settings</h3>
        <p className="text-sm text-gray-400 mt-1">Manage how and when you receive alerts</p>
      </div>

      {/* File Activity */}
      <SectionCard title="File Activity">
        <CheckRow label="File shared with me"  checked={fileActivity.sharedWithMe}      onChange={setFA("sharedWithMe")} />
        <CheckRow label="File edits"           checked={fileActivity.filesEdited}        onChange={setFA("filesEdited")} />
        <CheckRow label="Comments"             checked={fileActivity.comments}           onChange={setFA("comments")} />
        <CheckRow label="Downloads"            checked={fileActivity.downloads}          onChange={setFA("downloads")} />
        <CheckRow label="Folder invitations"   checked={fileActivity.folderInvitations}  onChange={setFA("folderInvitations")} last />
      </SectionCard>

      {/* Security Alerts */}
      <SectionCard title="Security Alerts">
        <ToggleRow label="New device login"           desc="Alert when a new device signs into your account" checked={security.newDevice}          onChange={setSec("newDevice")} />
        <ToggleRow label="Password change alerts"     desc="Notify when your password is updated"            checked={security.passwordChange}     onChange={setSec("passwordChange")} />
        <ToggleRow label="Suspicious activity alerts" desc="Detect unusual access patterns or anomalies"     checked={security.suspiciousActivity} onChange={setSec("suspiciousActivity")} last />
      </SectionCard>

      {/* Storage & Quota */}
      <SectionCard title="Storage & Quota">
        <Row id={toSettingId("Storage usage threshold alerts")}>
          <div className="min-w-0">
            <div className="text-sm text-gray-800">Storage usage threshold alerts</div>
            <div className="text-xs text-gray-400 mt-0.5">Notify when usage reaches selected levels</div>
            {storage.thresholdEnabled && (
              <div className="flex flex-wrap gap-2 mt-3">
                {thresholds.map((t, i) => (
                  <button key={t.label} onClick={() => toggleThreshold(i)}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${t.active ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-gray-50 border-gray-200 text-gray-400"}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Toggle checked={storage.thresholdEnabled} onChange={setSto("thresholdEnabled")} />
        </Row>
        <ToggleRow label="Upload completed" desc="Confirm when a file upload finishes" checked={storage.uploadComplete} onChange={setSto("uploadComplete")} last />
      </SectionCard>

      {/* Do Not Disturb */}
      <SectionCard title="Do Not Disturb">
        <Row id={toSettingId("Do Not Disturb")} last={!dndEnabled}>
          <div className="min-w-0">
            <div className="text-sm text-gray-800">Enable Do Not Disturb</div>
            <div className="text-xs text-gray-400 mt-0.5">Pause non-critical notifications for a set period</div>
          </div>
          <Toggle checked={dndEnabled} onChange={setDndEnabled} />
        </Row>
        {dndEnabled && <DndPicker />}
      </SectionCard>

      {/* Notification History */}
      <NotificationHistory />
    </div>
  );
}
