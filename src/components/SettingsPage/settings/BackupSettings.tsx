import { useState, useRef, useEffect } from "react";
import { toSectionId, toSettingId } from "../settingsUtils";

interface Device { id: number; name: string; icon: string; lastSync: string; storage: string; current: boolean; }
interface LogEntry { type: "ok" | "err" | "warn"; text: string; time: string; }

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

function Row({ id, children, last = false, column = false }: { id?: string; children: React.ReactNode; last?: boolean; column?: boolean }) {
  return (
    <div id={id} className={`px-8 py-4 flex gap-4 ${column ? "flex-col items-start" : "items-center justify-between"} ${!last ? "border-b border-gray-100" : ""}`}>
      {children}
    </div>
  );
}

function RowLabel({ label, desc }: { label: string; desc?: string }) {
  return (
    <div className="min-w-0">
      <div className="text-sm font-medium text-gray-700">{label}</div>
      {desc && <div className="text-xs text-gray-400 mt-0.5">{desc}</div>}
    </div>
  );
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button role="switch" aria-checked={enabled} onClick={onToggle}
      className={`relative inline-flex h-5 w-9 items-center rounded-full shrink-0 transition-colors duration-200 focus:outline-none ${enabled ? "bg-blue-600" : "bg-gray-200"}`}>
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200`}
        style={{ transform: enabled ? "translateX(18px)" : "translateX(2px)" }} />
    </button>
  );
}

function Badge({ label, color }: { label: string; color: "blue" | "green" | "yellow" | "red" }) {
  const map = { blue: "bg-blue-50 text-blue-600 border-blue-100", green: "bg-green-50 text-green-600 border-green-100", yellow: "bg-amber-50 text-amber-600 border-amber-100", red: "bg-red-50 text-red-500 border-red-100" };
  return <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${map[color]}`}>{label}</span>;
}

function CustomSelect({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative shrink-0">
      <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
        {value}
        <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg overflow-hidden z-50 min-w-[160px]">
          {options.map((opt) => (
            <button key={opt} onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${opt === value ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700 hover:bg-gray-50"}`}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FolderList({ folders, onRemove, onAdd }: { folders: string[]; onRemove: (i: number) => void; onAdd: () => void }) {
  return (
    <div className="mt-3 w-full">
      <div className="flex flex-col gap-1.5">
        {folders.map((f, i) => (
          <div key={i} className="flex items-center justify-between px-3 py-2 bg-white border border-gray-100 rounded-lg text-sm text-gray-700">
            <span className="font-mono text-xs text-gray-600">{f}</span>
            <button onClick={() => onRemove(i)} className="text-xs text-red-400 hover:text-red-600 transition-colors ml-3 shrink-0">Remove</button>
          </div>
        ))}
      </div>
      <button onClick={onAdd} className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-400 px-3 py-1.5 rounded-lg transition-all">
        <span className="text-base leading-none">+</span> Add folder
      </button>
    </div>
  );
}

export default function BackupAndSync() {
  const [backupEnabled, setBackupEnabled] = useState(true);
  const [backupFreq, setBackupFreq] = useState("daily");
  const [backupFreqCustomVal, setBackupFreqCustomVal] = useState(1);
  const [backupFreqUnit, setBackupFreqUnit] = useState("days");
  const [backupType, setBackupType] = useState<"full" | "folders">("full");
  const [backupFolders, setBackupFolders] = useState(["~/Documents", "~/Photos", "~/Desktop"]);
  const [backupWifi, setBackupWifi] = useState(true);
  const backupProgress = 72;

  const [syncEnabled, setSyncEnabled] = useState(true);
  const [syncDirection, setSyncDirection] = useState<"two-way" | "one-way">("two-way");
  const [oneWayDir, setOneWayDir] = useState<"device-to-cloud" | "cloud-to-device">("device-to-cloud");
  const [syncFolders, setSyncFolders] = useState(["~/Projects", "~/Shared"]);
  const [conflictMode, setConflictMode] = useState<"both" | "ask">("both");
  const [syncPaused, setSyncPaused] = useState(false);
  const [syncWifi, setSyncWifi] = useState(false);

  const [devices, setDevices] = useState<Device[]>([
    { id: 1, name: 'MacBook Pro 16"', icon: "💻", lastSync: "Active now", storage: "18.4 GB", current: true },
    { id: 2, name: "iPhone 15 Pro",   icon: "📱", lastSync: "2 hours ago", storage: "5.1 GB",  current: false },
    { id: 3, name: "Windows PC",      icon: "🖥️", lastSync: "3 days ago",  storage: "34.7 GB", current: false },
    { id: 4, name: "iPad Air",        icon: "📟", lastSync: "1 week ago",  storage: "2.3 GB",  current: false },
  ]);

  const [logs] = useState<LogEntry[]>([
    { type: "ok",   text: "Backup completed successfully — 1,204 files",          time: "Today, 09:14"    },
    { type: "ok",   text: "Sync completed — Projects folder",                      time: "Today, 08:30"    },
    { type: "err",  text: "Failed to upload report_final.pdf — connection lost",   time: "Yesterday, 22:51" },
    { type: "warn", text: "Conflict detected in ~/Shared/notes.txt",               time: "Yesterday, 18:03" },
    { type: "ok",   text: "Backup completed successfully — 980 files",             time: "Yesterday, 09:00" },
  ]);
  const [retried, setRetried] = useState(false);

  const [excludeTypes, setExcludeTypes] = useState([".tmp", ".cache", ".DS_Store"]);
  const [ignoreLargeFiles, setIgnoreLargeFiles] = useState(true);
  const [largeSizeMB, setLargeSizeMB] = useState(500);
  const [syncHidden, setSyncHidden] = useState(false);
  const [backupHidden, setBackupHidden] = useState(false);

  const [versionEnabled, setVersionEnabled] = useState(true);
  const [versionsToKeep, setVersionsToKeep] = useState(10);
  const [autoDeleteVersions, setAutoDeleteVersions] = useState(true);

  const addFolder = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    const name = window.prompt("Enter folder path:");
    if (name?.trim()) setter((prev) => [...prev, name.trim()]);
  };
  const removeFolder = (setter: React.Dispatch<React.SetStateAction<string[]>>, idx: number) => {
    setter((prev) => prev.filter((_, i) => i !== idx));
  };
  const addExclude = () => {
    const val = window.prompt("Enter file type (e.g. .tmp):");
    if (val?.trim()) setExcludeTypes((prev) => [...prev, val.trim()]);
  };

  const logDot: Record<string, string> = { ok: "bg-green-400", err: "bg-red-400", warn: "bg-amber-400" };

  return (
    <div className="max-w-[90%]">
      <div className="mb-7">
        <h3 className="text-2xl font-semibold text-gray-800">Backup &amp; Sync</h3>
        <p className="text-sm text-gray-400 mt-1">Manage how your data is backed up and kept in sync across all your devices</p>
      </div>

      {/* Backup Settings */}
      <SectionCard title="Backup Settings">
        <Row id={toSettingId("Automatic backup")}>
          <RowLabel label="Automatic backup" desc="Schedule device backups to cloud storage" />
          <Toggle enabled={backupEnabled} onToggle={() => setBackupEnabled((v) => !v)} />
        </Row>
        {backupEnabled ? (
          <>
            <Row id={toSettingId("Backup frequency")}>
              <RowLabel label="Backup frequency" desc="How often automatic backups run" />
              <div className="flex items-center gap-2 shrink-0">
                {backupFreq === "custom" && <input type="number" min={1} max={999} value={backupFreqCustomVal} onChange={(e) => setBackupFreqCustomVal(Number(e.target.value))} className="w-16 text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 text-center focus:outline-none focus:ring-2 focus:ring-blue-100" />}
                {backupFreq === "custom" && <CustomSelect options={["hrs", "days", "months", "years"]} value={backupFreqUnit} onChange={setBackupFreqUnit} />}
                <CustomSelect options={["hourly", "daily", "weekly", "custom"]} value={backupFreq} onChange={setBackupFreq} />
              </div>
            </Row>
            <Row id={toSettingId("What to backup")} column>
              <RowLabel label="What to backup" />
              <div className="flex flex-col gap-2.5 mt-1">
                <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer"><input type="radio" name="backupType" value="full" checked={backupType === "full"} onChange={() => setBackupType("full")} className="accent-blue-600 w-4 h-4" />Full system backup</label>
                <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer"><input type="radio" name="backupType" value="folders" checked={backupType === "folders"} onChange={() => setBackupType("folders")} className="accent-blue-600 w-4 h-4" />Select folders to backup</label>
              </div>
              {backupType === "folders" && <FolderList folders={backupFolders} onRemove={(i) => removeFolder(setBackupFolders, i)} onAdd={() => addFolder(setBackupFolders)} />}
            </Row>
            <Row id={toSettingId("Backup status")} column>
              <RowLabel label="Backup status" />
              <div className="flex flex-wrap gap-6 mt-1">
                <div><div className="text-xs text-gray-400">Last backup</div><div className="text-sm font-medium text-gray-700 mt-0.5">Today, 09:14</div></div>
                <div><div className="text-xs text-gray-400">Status</div><div className="mt-0.5"><Badge label="Complete" color="green" /></div></div>
                <div><div className="text-xs text-gray-400">Files backed up</div><div className="text-sm font-medium text-gray-700 mt-0.5">1,204 / 1,204</div></div>
              </div>
              <div className="w-full mt-2">
                <div className="flex justify-between text-xs text-gray-400 mb-1"><span>Storage used</span><span>{backupProgress}%</span></div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${backupProgress}%` }} /></div>
              </div>
            </Row>
            <Row id={toSettingId("Backup over WiFi only")} last>
              <RowLabel label="Backup over WiFi only" desc="Prevent backup on mobile data" />
              <Toggle enabled={backupWifi} onToggle={() => setBackupWifi((v) => !v)} />
            </Row>
          </>
        ) : (
          <Row last><p className="text-sm text-gray-400 italic">Automatic backup is disabled. Enable it to configure options.</p></Row>
        )}
      </SectionCard>

      {/* Sync Settings */}
      <SectionCard title="Sync Settings">
        <Row id={toSettingId("Enable sync")}>
          <RowLabel label="Enable sync" desc="Sync files across your devices" />
          <Toggle enabled={syncEnabled} onToggle={() => setSyncEnabled((v) => !v)} />
        </Row>
        {syncEnabled ? (
          <>
            <Row id={toSettingId("Sync direction")} column>
              <RowLabel label="Sync direction" />
              <div className="flex flex-col gap-2.5 mt-1">
                <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer"><input type="radio" name="syncDir" value="two-way" checked={syncDirection === "two-way"} onChange={() => setSyncDirection("two-way")} className="accent-blue-600 w-4 h-4" />Two-way sync</label>
                <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer"><input type="radio" name="syncDir" value="one-way" checked={syncDirection === "one-way"} onChange={() => setSyncDirection("one-way")} className="accent-blue-600 w-4 h-4" />One-way sync</label>
              </div>
              {syncDirection === "one-way" && (
                <div className="mt-2 w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3">
                  <p className="text-xs text-gray-400 mb-2">Select direction:</p>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer"><input type="radio" name="oneWayDir" value="device-to-cloud" checked={oneWayDir === "device-to-cloud"} onChange={() => setOneWayDir("device-to-cloud")} className="accent-blue-600 w-4 h-4" />Device → Cloud</label>
                    <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer"><input type="radio" name="oneWayDir" value="cloud-to-device" checked={oneWayDir === "cloud-to-device"} onChange={() => setOneWayDir("cloud-to-device")} className="accent-blue-600 w-4 h-4" />Cloud → Device</label>
                  </div>
                </div>
              )}
            </Row>
            <Row id={toSettingId("Folders to sync")} column>
              <RowLabel label="Folders to sync" />
              <FolderList folders={syncFolders} onRemove={(i) => removeFolder(setSyncFolders, i)} onAdd={() => addFolder(setSyncFolders)} />
            </Row>
            <Row id={toSettingId("Sync conflict resolution")} column>
              <RowLabel label="Sync conflict resolution" desc="What to do when the same file changes on two devices" />
              <div className="flex gap-2 mt-2">
                {([{ key: "both", label: "Keep both files" }, { key: "ask", label: "Ask before replacing" }] as { key: "both" | "ask"; label: string }[]).map(({ key, label }) => (
                  <button key={key} onClick={() => setConflictMode(key)}
                    className={`text-sm px-4 py-1.5 rounded-full border transition-all ${conflictMode === key ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </Row>
            <Row id={toSettingId("Pause sync")}>
              <RowLabel label={syncPaused ? "Resume sync" : "Pause sync"} desc={syncPaused ? "Sync is currently paused" : "Temporarily stop syncing"} />
              <button onClick={() => setSyncPaused((v) => !v)} className="text-sm px-3 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg transition-colors shrink-0">
                {syncPaused ? "Resume" : "Pause"}
              </button>
            </Row>
            <Row id={toSettingId("Sync only on WiFi")} last>
              <RowLabel label="Sync only on WiFi" desc="Avoid syncing over mobile data" />
              <Toggle enabled={syncWifi} onToggle={() => setSyncWifi((v) => !v)} />
            </Row>
          </>
        ) : (
          <Row last><p className="text-sm text-gray-400 italic">Sync is disabled. Enable it to configure sync options.</p></Row>
        )}
      </SectionCard>

      {/* Device Sync Management */}
      <SectionCard title="Device Sync Management">
        <div id={toSettingId("Device Sync Management")} className="px-8 py-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {devices.map((d) => (
            <div key={d.id} className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-lg shrink-0">{d.icon}</div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-700 truncate">{d.name}</div>
                  <div className="text-xs text-gray-400">{d.lastSync}</div>
                </div>
                {d.current && <Badge label="This device" color="blue" />}
              </div>
              <div className="text-xs text-gray-500 border-t border-gray-100 pt-2.5">Storage used: <span className="font-medium text-gray-700">{d.storage}</span></div>
              <div className="flex gap-2">
                <button className="text-xs px-3 py-1.5 border border-gray-200 hover:bg-white text-gray-600 rounded-lg transition-colors">Force sync</button>
                {!d.current && <button onClick={() => setDevices((prev) => prev.filter((x) => x.id !== d.id))} className="text-xs px-3 py-1.5 border border-red-100 text-red-500 hover:bg-red-50 rounded-lg transition-colors">Remove</button>}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Sync Activity & Logs */}
      <SectionCard title="Sync Activity & Logs">
        <Row id={toSettingId("Recent activity")} column>
          <RowLabel label="Recent activity" />
          <div className="w-full mt-1 flex flex-col gap-0">
            {logs.map((l, i) => (
              <div key={i} className={`flex items-start gap-3 py-2.5 ${i < logs.length - 1 ? "border-b border-gray-50" : ""}`}>
                <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${logDot[l.type]}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-700">{l.text}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{l.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Row>
        <Row id={toSettingId("Failed uploads")} last>
          <div>
            <div className="text-sm font-medium text-gray-700">Failed uploads</div>
            <div className="text-xs text-gray-400 mt-0.5">1 file failed to upload</div>
          </div>
          <button onClick={() => setRetried(true)} disabled={retried}
            className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 ${retried ? "border border-gray-200 text-gray-400 cursor-default" : "bg-blue-600 hover:bg-blue-700 text-white"}`}>
            {retried ? "Retrying… ✓" : "Retry sync"}
          </button>
        </Row>
      </SectionCard>

      {/* Advanced Backup Controls */}
      <SectionCard title="Advanced Backup Controls">
        <Row id={toSettingId("Exclude file types")} column>
          <RowLabel label="Exclude file types" desc="Files matching these types will be skipped during backup and sync" />
          <div className="flex flex-wrap gap-2 mt-2">
            {excludeTypes.map((t, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-gray-600 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full">
                {t}
                <button onClick={() => setExcludeTypes((prev) => prev.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500 transition-colors leading-none">✕</button>
              </span>
            ))}
            <button onClick={addExclude} className="text-xs font-medium text-blue-600 border border-blue-200 hover:border-blue-400 px-2.5 py-1 rounded-full transition-all">+ Add type</button>
          </div>
        </Row>
        <Row id={toSettingId("Ignore large files")}>
          <div>
            <RowLabel label="Ignore large files" desc="Skip files above a certain size threshold" />
            {ignoreLargeFiles && (
              <div className="flex items-center gap-2 mt-2">
                <input type="number" value={largeSizeMB} min={10} max={10000} onChange={(e) => setLargeSizeMB(Number(e.target.value))}
                  className="w-20 text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 text-center focus:outline-none focus:ring-2 focus:ring-blue-100" />
                <span className="text-xs text-gray-400">MB and above</span>
              </div>
            )}
          </div>
          <Toggle enabled={ignoreLargeFiles} onToggle={() => setIgnoreLargeFiles((v) => !v)} />
        </Row>
        <Row id={toSettingId("Sync hidden files")}>
          <RowLabel label="Sync hidden files" desc="Include files and folders starting with a dot" />
          <Toggle enabled={syncHidden} onToggle={() => setSyncHidden((v) => !v)} />
        </Row>
        <Row id={toSettingId("Backup hidden files")} last>
          <RowLabel label="Backup hidden files" desc="Include hidden files in backup archives" />
          <Toggle enabled={backupHidden} onToggle={() => setBackupHidden((v) => !v)} />
        </Row>
      </SectionCard>

      {/* Backup Versioning */}
      <SectionCard title="Backup Versioning">
        <Row id={toSettingId("File version history")}>
          <RowLabel label="File version history" desc="Keep previous versions of changed files" />
          <Toggle enabled={versionEnabled} onToggle={() => setVersionEnabled((v) => !v)} />
        </Row>
        {versionEnabled ? (
          <>
            <Row id={toSettingId("Versions to keep")}>
              <RowLabel label="Versions to keep" desc="Maximum number of saved versions per file" />
              <input type="number" value={versionsToKeep} min={1} max={100} onChange={(e) => setVersionsToKeep(Number(e.target.value))}
                className="w-20 text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 text-center focus:outline-none focus:ring-2 focus:ring-blue-100 shrink-0" />
            </Row>
            <Row id={toSettingId("Auto-delete old versions")}>
              <RowLabel label="Auto-delete old versions" desc="Remove oldest versions when the limit is reached" />
              <Toggle enabled={autoDeleteVersions} onToggle={() => setAutoDeleteVersions((v) => !v)} />
            </Row>
            <Row id={toSettingId("Restore previous version")} last>
              <div>
                <div className="text-sm font-medium text-gray-700">Restore previous version</div>
                <div className="text-xs text-gray-400 mt-0.5">Browse and restore files from version history</div>
              </div>
              <button className="text-sm px-3 py-1.5 border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shrink-0 font-medium">Browse history</button>
            </Row>
          </>
        ) : (
          <Row last><p className="text-sm text-gray-400 italic">Version history is disabled.</p></Row>
        )}
      </SectionCard>
    </div>
  );
}
