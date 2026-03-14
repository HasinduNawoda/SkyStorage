import { useState } from "react";
import { toSectionId, toSettingId } from "../settingsUtils";

const initialSessions = [
  { id: 1, device: 'MacBook Pro 16"', browser: "Chrome 122", location: "Colombo, LK", time: "Active now", current: true, icon: "💻" },
  { id: 2, device: "iPhone 15 Pro", browser: "Safari", location: "Colombo, LK", time: "2 hours ago", current: false, icon: "📱" },
  { id: 3, device: "Windows PC", browser: "Edge 121", location: "Kandy, LK", time: "3 days ago", current: false, icon: "🖥️" },
];

const initialConnected = [
  { id: "google", name: "Google", email: "hasindunawoda78@gmail.com", icon: "G", connected: true },
  { id: "apple", name: "Apple", email: null, icon: "⌘", connected: false },
  { id: "github", name: "GitHub", email: null, icon: "⌥", connected: false },
];

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

function Row({
  id,
  children,
  last = false,
}: {
  id?: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      id={id}
      className={`px-8 py-4 flex items-center justify-between gap-4 ${!last ? "border-b border-gray-100" : ""}`}
    >
      {children}
    </div>
  );
}

function EditableField({ label, value, type = "text" }: { label: string; value: string; type?: string }) {
  const [val, setVal] = useState(value);
  const [editing, setEditing] = useState(false);

  return (
    <Row id={toSettingId(label)}>
      <div className="min-w-0">
        <div className="text-xs text-gray-400 mb-0.5">{label}</div>
        {editing ? (
          <input
            autoFocus
            type={type}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="border border-blue-400 text-gray-800 text-sm rounded-lg px-3 py-1.5 outline-none w-64 focus:ring-2 focus:ring-blue-100"
          />
        ) : (
          <div className="text-sm text-gray-800">{val}</div>
        )}
      </div>
      <button
        onClick={() => setEditing(!editing)}
        className="text-sm text-blue-600 hover:text-blue-700 font-medium shrink-0 transition-colors"
      >
        {editing ? "Save" : "Edit"}
      </button>
    </Row>
  );
}

export default function AccountSettings() {
  const [sessions, setSessions] = useState(initialSessions);
  const [accounts, setAccounts] = useState(initialConnected);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [exportRequested, setExportRequested] = useState(false);

  const revokeSession = (id: number) => setSessions((s) => s.filter((s) => s.id !== id));
  const revokeAll = () => setSessions((s) => s.filter((s) => s.current));
  const toggleAccount = (id: string) =>
    setAccounts((a) => a.map((a) => (a.id === id ? { ...a, connected: !a.connected } : a)));

  return (
    <div className="max-w-[90%]">
      <div className="mb-7">
        <h3 className="text-2xl font-semibold text-gray-800">Account Settings</h3>
        <p className="text-sm text-gray-400 mt-1">Manage your profile, sessions, and account data</p>
      </div>

      {/* Profile */}
      <SectionCard title="Profile">
        <Row id={toSettingId("Profile Photo")}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-base shrink-0">
              HN
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Profile Photo</div>
              <div className="text-xs text-gray-400 mt-0.5">JPG, PNG or GIF · Max 5MB</div>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button className="text-sm px-3 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg transition-colors">
              Upload
            </button>
            <button className="text-sm text-red-500 hover:text-red-600 transition-colors">
              Remove
            </button>
          </div>
        </Row>
        <EditableField label="Full Name" value="Hasindu Nawoda" />
        <EditableField label="Display Name" value="hasindunawoda" />
        <EditableField label="Email Address" value="hasindunawoda78@gmail.com" type="email" />
        <Row id={toSettingId("Phone Number")} last>
          <div>
            <div className="text-xs text-gray-400 mb-0.5">Phone Number</div>
            <div className="text-sm text-gray-400 italic">Not set</div>
          </div>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium shrink-0 transition-colors">
            Add
          </button>
        </Row>
      </SectionCard>

      {/* Connected Accounts */}
      <SectionCard title="Connected Accounts">
        {accounts.map((acc, i) => (
          <Row key={acc.id} id={toSettingId(acc.name)} last={i === accounts.length - 1}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 text-sm font-bold shrink-0">
                {acc.icon}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">{acc.name}</div>
                <div className="text-xs text-gray-400">
                  {acc.connected ? acc.email : "Not connected"}
                </div>
              </div>
            </div>
            <button
              onClick={() => toggleAccount(acc.id)}
              className={`text-sm font-medium shrink-0 transition-colors ${
                acc.connected ? "text-red-500 hover:text-red-600" : "text-blue-600 hover:text-blue-700"
              }`}
            >
              {acc.connected ? "Disconnect" : "Connect"}
            </button>
          </Row>
        ))}
      </SectionCard>

      {/* Active Sessions */}
      <SectionCard title="Active Sessions">
        {sessions.map((s, i) => (
          <Row
            key={s.id}
            id={i === 0 ? toSettingId("Active Sessions") : undefined}
            last={i === sessions.length - 1 && sessions.filter((s) => !s.current).length === 0}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="text-xl shrink-0">{s.icon}</div>
              <div className="min-w-0">
                <div className="text-sm text-gray-700 flex items-center gap-2">
                  {s.device}
                  {s.current && (
                    <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-md">
                      This device
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {s.browser} · {s.location} · {s.time}
                </div>
              </div>
            </div>
            {!s.current && (
              <button
                onClick={() => revokeSession(s.id)}
                className="text-sm text-red-500 hover:text-red-600 shrink-0 transition-colors"
              >
                Revoke
              </button>
            )}
          </Row>
        ))}
        {sessions.filter((s) => !s.current).length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100">
            <button
              onClick={revokeAll}
              className="text-sm text-gray-400 hover:text-red-500 transition-colors"
            >
              Sign out of all other devices
            </button>
          </div>
        )}
      </SectionCard>

      {/* Danger Zone */}
      <div id={toSectionId("Danger Zone")} className="mb-8">
        <h2 className="text-base font-semibold text-gray-700 mb-3">Danger Zone</h2>
        <div className="border border-red-100 rounded-xl overflow-hidden bg-red-50/40">
          <div id={toSettingId("Export Account Data")} className="px-5 py-4 flex items-center justify-between gap-4 border-b border-red-100">
            <div>
              <div className="text-sm font-medium text-gray-700">Export Account Data</div>
              <div className="text-xs text-gray-400 mt-0.5">
                Download all your files and settings as a ZIP archive
              </div>
            </div>
            <button
              onClick={() => setExportRequested(true)}
              disabled={exportRequested}
              className={`text-sm px-3 py-1.5 rounded-lg border font-medium shrink-0 transition-all ${
                exportRequested
                  ? "border-gray-200 text-gray-400 cursor-default"
                  : "border-amber-300 text-amber-600 hover:bg-amber-50"
              }`}
            >
              {exportRequested ? "Requested ✓" : "Request Export"}
            </button>
          </div>
          <div id={toSettingId("Delete Account")} className="px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-red-500">Delete Account</div>
              <div className="text-xs text-gray-400 mt-0.5">
                Permanently delete your account and all associated data
              </div>
            </div>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-sm px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 font-medium shrink-0 transition-all"
              >
                Delete Account
              </button>
            ) : (
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button className="text-sm px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors">
                  Confirm Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
