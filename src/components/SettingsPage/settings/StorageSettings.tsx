import { useState } from "react";
import { toSectionId, toSettingId } from "../settingsUtils";

type DurationUnit = "hrs" | "days" | "months" | "years";
type Duration = { value: number; unit: DurationUnit };
type StorageThreshold = 80 | 85 | 90 | 95;

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

function Row({ id, children, last = false, subtle = false }: { id?: string; children: React.ReactNode; last?: boolean; subtle?: boolean }) {
  return (
    <div id={id} className={`px-8 py-4 flex items-center justify-between gap-4 ${!last ? "border-b border-gray-100" : ""} ${subtle ? "bg-gray-50/60" : ""}`}>
      {children}
    </div>
  );
}

function RowLabel({ label, sub, badge }: { label: string; sub: string; badge?: { text: string; color: "blue" | "amber" | "green" | "violet" } }) {
  const badgeStyles = {
    blue:   "bg-blue-50 text-blue-600 border-blue-100",
    amber:  "bg-amber-50 text-amber-600 border-amber-100",
    green:  "bg-emerald-50 text-emerald-600 border-emerald-100",
    violet: "bg-violet-50 text-violet-600 border-violet-100",
  };
  return (
    <div className="min-w-0">
      <div className="text-sm font-medium text-gray-700 flex items-center gap-2 flex-wrap">
        {label}
        {badge && <span className={`text-xs px-1.5 py-0.5 rounded-md border font-medium ${badgeStyles[badge.color]}`}>{badge.text}</span>}
      </div>
      <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
    </div>
  );
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${enabled ? "bg-blue-600" : "bg-gray-200"}`}
      role="switch" aria-checked={enabled}>
      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ${enabled ? "translate-x-4" : "translate-x-0"}`} />
    </button>
  );
}

function PillSelector<T extends string | number>({ options, value, onChange, disabled }: { options: { label: string; value: T }[]; value: T; onChange: (v: T) => void; disabled?: boolean }) {
  return (
    <div className={`flex items-center gap-1 ${disabled ? "opacity-40 pointer-events-none" : ""}`}>
      {options.map((opt) => (
        <button key={String(opt.value)} onClick={() => onChange(opt.value)}
          className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${value === opt.value ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700"}`}>
          {opt.label}
        </button>
      ))}
    </div>
  );
}

const UNIT_META: { value: DurationUnit; label: string; plural: string }[] = [
  { value: "hrs",    label: "Hr",    plural: "Hrs"    },
  { value: "days",   label: "Day",   plural: "Days"   },
  { value: "months", label: "Month", plural: "Months" },
  { value: "years",  label: "Year",  plural: "Years"  },
];

function durationMatch(a: Duration, b: Duration) { return a.value === b.value && a.unit === b.unit; }
function formatDuration({ value, unit }: Duration): string {
  const u = UNIT_META.find((u) => u.value === unit)!;
  return `${value} ${value === 1 ? u.label : u.plural}`;
}

function DurationPicker({ label, sub, duration, onChange, presets, disabled, isLast = false }: {
  label: string; sub: string; duration: Duration; onChange: (d: Duration) => void;
  presets: { label: string; duration: Duration }[]; disabled?: boolean; isLast?: boolean;
}) {
  const matchedPreset = presets.find((p) => durationMatch(duration, p.duration));
  const [mode, setMode] = useState<"preset" | "custom">(matchedPreset ? "preset" : "custom");
  const [customDraft, setCustomDraft] = useState<Duration>(matchedPreset ? { value: 1, unit: "days" } : duration);

  const handlePreset = (d: Duration) => { setMode("preset"); onChange(d); };
  const handleCustomMode = () => { setMode("custom"); onChange(customDraft); };
  const stepCustom = (delta: number) => { const next = { ...customDraft, value: Math.max(1, customDraft.value + delta) }; setCustomDraft(next); onChange(next); };
  const handleCustomValue = (raw: string) => { const n = parseInt(raw, 10); if (!isNaN(n) && n >= 1) { const next = { ...customDraft, value: n }; setCustomDraft(next); onChange(next); } };
  const handleCustomUnit = (unit: DurationUnit) => { const next = { ...customDraft, unit }; setCustomDraft(next); onChange(next); };
  const customOpen = mode === "custom";

  return (
    <div id={toSettingId(label)} className={`${disabled ? "opacity-40 pointer-events-none" : ""}`}>
      <div className={`px-8 py-4 flex items-center justify-between gap-6 bg-gray-50/60 ${!customOpen && isLast ? "" : "border-b border-gray-100"}`}>
        <div className="min-w-0">
          <div className="text-sm font-medium text-gray-700">{label}</div>
          <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
        </div>
        <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
          {presets.map((p) => {
            const active = mode === "preset" && durationMatch(duration, p.duration);
            return (
              <button key={p.label} onClick={() => handlePreset(p.duration)}
                className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all select-none ${active ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700"}`}>
                {p.label}
              </button>
            );
          })}
          <span className="w-px h-4 bg-gray-200 mx-0.5" />
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input type="radio" checked={customOpen} onChange={handleCustomMode} className="w-3.5 h-3.5 accent-blue-600 cursor-pointer" />
            <span className={`text-xs font-medium transition-colors ${customOpen ? "text-blue-600" : "text-gray-500 hover:text-gray-700"}`}>Custom</span>
          </label>
        </div>
      </div>
      {customOpen && (
        <div className={`px-8 py-4 bg-blue-50/40 border-b border-blue-100 flex items-center gap-3 flex-wrap ${isLast ? "border-b-0" : ""}`}>
          <div className="flex items-center border border-blue-300 ring-2 ring-blue-50 rounded-lg overflow-hidden bg-white">
            <button onClick={() => stepCustom(-1)} className="px-2.5 py-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 text-sm leading-none select-none transition-colors">−</button>
            <input type="number" min={1} value={customDraft.value} onChange={(e) => handleCustomValue(e.target.value)}
              className="w-12 text-sm text-center text-gray-700 outline-none bg-transparent py-1.5 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
            <button onClick={() => stepCustom(1)} className="px-2.5 py-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 text-sm leading-none select-none transition-colors">+</button>
          </div>
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
            {UNIT_META.map((u, i) => (
              <button key={u.value} onClick={() => handleCustomUnit(u.value)}
                className={`text-xs px-3 py-1.5 font-medium transition-all select-none ${i < UNIT_META.length - 1 ? "border-r border-gray-100" : ""} ${customDraft.unit === u.value ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"}`}>
                {customDraft.unit === u.value && customDraft.value !== 1 ? u.plural : u.label}
              </button>
            ))}
          </div>
          <span className="flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.5"/><path d="M5 3v2.5l1.5 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
            {formatDuration(customDraft)}
          </span>
          <span className="text-xs text-gray-400 ml-auto italic">Set to {formatDuration(customDraft)} from now</span>
        </div>
      )}
    </div>
  );
}

const TRASH_PRESETS   = [{ label: "24 hrs", duration: { value: 24, unit: "hrs" as DurationUnit } }, { label: "7 days", duration: { value: 7, unit: "days" as DurationUnit } }, { label: "30 days", duration: { value: 30, unit: "days" as DurationUnit } }, { label: "3 months", duration: { value: 3, unit: "months" as DurationUnit } }];
const ARCHIVE_PRESETS = [{ label: "3 months", duration: { value: 3, unit: "months" as DurationUnit } }, { label: "6 months", duration: { value: 6, unit: "months" as DurationUnit } }, { label: "1 year", duration: { value: 1, unit: "years" as DurationUnit } }, { label: "2 years", duration: { value: 2, unit: "years" as DurationUnit } }];

function StorageBar({ used, total, archived }: { used: number; total: number; archived: number }) {
  const usedPct = Math.round((used / total) * 100);
  const archivedPct = Math.round((archived / total) * 100);
  const activePct = usedPct - archivedPct;
  const color = usedPct >= 90 ? "bg-red-500" : usedPct >= 75 ? "bg-amber-400" : "bg-blue-500";

  return (
    <div id={toSettingId("Storage Overview")} className="px-8 py-5 border-b border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{used} GB <span className="text-gray-400 font-normal">of {total} GB used</span></span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${usedPct >= 90 ? "bg-red-50 text-red-500" : usedPct >= 75 ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"}`}>{usedPct}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
        <div className={`${color} rounded-full transition-all duration-500`} style={{ width: `${activePct}%` }} />
        <div className="bg-violet-300 transition-all duration-500" style={{ width: `${archivedPct}%` }} />
      </div>
      <div className="flex items-center gap-4 mt-2">
        <span className="flex items-center gap-1.5 text-xs text-gray-400"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Active files</span>
        <span className="flex items-center gap-1.5 text-xs text-gray-400"><span className="w-2 h-2 rounded-full bg-violet-300 inline-block" /> Archived — {archived} GB</span>
        <span className="flex items-center gap-1.5 text-xs text-gray-400"><span className="w-2 h-2 rounded-full bg-gray-200 inline-block" /> Free — {total - used} GB</span>
      </div>
    </div>
  );
}

function ThresholdPicker({ value, onChange, disabled }: { value: StorageThreshold; onChange: (v: StorageThreshold) => void; disabled?: boolean }) {
  const opts: { label: string; value: StorageThreshold }[] = [{ label: "80%", value: 80 }, { label: "85%", value: 85 }, { label: "90%", value: 90 }, { label: "95%", value: 95 }];
  return <PillSelector options={opts} value={value} onChange={onChange} disabled={disabled} />;
}

const COMMON_TYPES = [".exe", ".zip", ".dmg", ".iso", ".apk", ".rar", ".mp4", ".avi"];

function FileTypeRestrictor({ types, onChange, disabled }: { types: string[]; onChange: (v: string[]) => void; disabled?: boolean }) {
  const [input, setInput] = useState("");
  const add = (t: string) => { const val = t.trim().toLowerCase(); if (!val || types.includes(val)) return; onChange([...types, val.startsWith(".") ? val : `.${val}`]); setInput(""); };
  const remove = (t: string) => onChange(types.filter((x) => x !== t));

  return (
    <div className={`${disabled ? "opacity-40 pointer-events-none" : ""}`}>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {COMMON_TYPES.map((t) => (
          <button key={t} onClick={() => (types.includes(t) ? remove(t) : add(t))}
            className={`text-xs px-2 py-0.5 rounded border font-mono transition-all ${types.includes(t) ? "bg-red-50 text-red-500 border-red-200" : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300"}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add(input)}
          placeholder="Add custom type e.g. .psd"
          className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 w-48 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 text-gray-700 placeholder-gray-300" />
        <button onClick={() => add(input)} className="text-xs px-2.5 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 font-medium transition-colors">Add</button>
      </div>
    </div>
  );
}

function DuplicateScanResult({ onDismiss }: { onDismiss: () => void }) {
  const dupes = [
    { name: "Q3_Report_Final.pdf", size: "4.2 MB", copies: 3 },
    { name: "profile-photo.jpg",   size: "1.8 MB", copies: 2 },
    { name: "project-backup.zip",  size: "120 MB", copies: 2 },
  ];
  return (
    <div className="px-8 py-4 bg-amber-50/60 border-t border-amber-100">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-amber-700">Found {dupes.length} duplicate groups · 128 MB recoverable</span>
        <button onClick={onDismiss} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Dismiss</button>
      </div>
      <div className="space-y-2">
        {dupes.map((d) => (
          <div key={d.name} className="flex items-center justify-between bg-white border border-amber-100 rounded-lg px-3 py-2">
            <div>
              <div className="text-xs font-medium text-gray-700">{d.name}</div>
              <div className="text-xs text-gray-400">{d.copies} copies · {d.size} each</div>
            </div>
            <button className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors">Keep 1</button>
          </div>
        ))}
      </div>
      <button className="mt-3 text-xs px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors">Remove All Duplicates</button>
    </div>
  );
}

function ArchivedFilesPanel({ onClose }: { onClose: () => void }) {
  const files = [
    { name: "2023_Tax_Docs.zip", size: "34 MB", archived: "8 months ago" },
    { name: "Old_Wireframes.fig", size: "12 MB", archived: "7 months ago" },
    { name: "Legacy_Codebase.tar", size: "210 MB", archived: "6 months ago" },
  ];
  return (
    <div className="px-8 py-4 bg-violet-50/50 border-t border-violet-100">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-violet-700">3 archived files · 256 MB in cold storage</span>
        <button onClick={onClose} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Close</button>
      </div>
      <div className="space-y-2">
        {files.map((f) => (
          <div key={f.name} className="flex items-center justify-between bg-white border border-violet-100 rounded-lg px-3 py-2">
            <div>
              <div className="text-xs font-medium text-gray-700">{f.name}</div>
              <div className="text-xs text-gray-400">{f.size} · Archived {f.archived}</div>
            </div>
            <button className="text-xs text-violet-600 hover:text-violet-700 font-medium transition-colors">Restore</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StorageSettings() {
  const [preventDuplicateUpload, setPreventDuplicateUpload] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanDone, setScanDone] = useState(false);
  const handleScan = () => { setScanning(true); setTimeout(() => { setScanning(false); setScanDone(true); }, 1800); };

  const [autoTrash, setAutoTrash] = useState(true);
  const [trashDuration, setTrashDuration] = useState<Duration>({ value: 30, unit: "days" });

  const [autoArchive, setAutoArchive] = useState(false);
  const [archiveDuration, setArchiveDuration] = useState<Duration>({ value: 6, unit: "months" });
  const [showArchived, setShowArchived] = useState(false);

  const [limitSize, setLimitSize] = useState(true);
  const [maxSizeMB, setMaxSizeMB] = useState("500");
  const [restrictTypes, setRestrictTypes] = useState(false);
  const [blockedTypes, setBlockedTypes] = useState<string[]>([".exe", ".dmg"]);
  const [preventNearFull, setPreventNearFull] = useState(true);
  const [storageThreshold, setStorageThreshold] = useState<StorageThreshold>(90);

  return (
    <div className="max-w-[90%]">
      <div className="mb-7">
        <h3 className="text-2xl font-semibold text-gray-800">Storage Settings</h3>
        <p className="text-sm text-gray-400 mt-1">Manage storage usage, automation rules, and upload policies</p>
      </div>

      {/* Storage Overview */}
      <SectionCard title="Storage Overview">
        <StorageBar used={68} total={100} archived={12} />
        <Row id={toSettingId("Storage Plan")} last>
          <RowLabel label="Storage Plan" sub="100 GB · Pro Plan" badge={{ text: "Pro", color: "blue" }} />
          <button className="text-sm px-3 py-1.5 border border-blue-200 text-blue-600 hover:bg-blue-50 font-medium rounded-lg shrink-0 transition-colors">Upgrade</button>
        </Row>
      </SectionCard>

      {/* Duplicate File Management */}
      <SectionCard title="Duplicate File Management">
        <Row id={toSettingId("Prevent Duplicate Uploads")}>
          <RowLabel label="Prevent Duplicate Uploads" sub="Block re-uploading files that already exist in your storage" />
          <Toggle enabled={preventDuplicateUpload} onChange={setPreventDuplicateUpload} />
        </Row>
        <Row id={toSettingId("Scan for Duplicates")} last={!scanDone}>
          <RowLabel label="Scan for Duplicates" sub="Analyse your entire storage and identify redundant files" badge={scanDone ? { text: "3 found", color: "amber" } : undefined} />
          <button onClick={handleScan} disabled={scanning}
            className={`text-sm px-3 py-1.5 rounded-lg border font-medium shrink-0 transition-all ${scanning ? "border-gray-200 text-gray-400 cursor-default" : "border-blue-200 text-blue-600 hover:bg-blue-50"}`}>
            {scanning ? <span className="flex items-center gap-2"><svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Scanning…</span> : scanDone ? "Re-scan" : "Scan Now"}
          </button>
        </Row>
        {scanDone && <DuplicateScanResult onDismiss={() => setScanDone(false)} />}
      </SectionCard>

      {/* Automatic Trash Management */}
      <SectionCard title="Automatic Trash Management">
        <Row id={toSettingId("Auto-Empty Trash")}>
          <RowLabel label="Auto-Empty Trash" sub="Permanently delete trashed files after a set period" />
          <Toggle enabled={autoTrash} onChange={setAutoTrash} />
        </Row>
        <DurationPicker label="Delete Trash After"
          sub={autoTrash ? `Trashed files will be permanently removed after ${formatDuration(trashDuration)}` : "Enable auto-empty to configure this"}
          duration={trashDuration} onChange={setTrashDuration} presets={TRASH_PRESETS} disabled={!autoTrash} isLast />
      </SectionCard>

      {/* Archive & Cold Storage */}
      <SectionCard title="Archive & Cold Storage">
        <Row id={toSettingId("Auto-Archive Unused Files")}>
          <RowLabel label="Auto-Archive Unused Files" sub="Move files that haven't been accessed to cold storage" badge={autoArchive ? { text: "Active", color: "violet" } : undefined} />
          <Toggle enabled={autoArchive} onChange={setAutoArchive} />
        </Row>
        <DurationPicker label="Archive Files Inactive For"
          sub={autoArchive ? `Files untouched for ${formatDuration(archiveDuration)} will be moved to cold storage` : "Enable auto-archive to configure this"}
          duration={archiveDuration} onChange={setArchiveDuration} presets={ARCHIVE_PRESETS} disabled={!autoArchive} />
        <Row id={toSettingId("Restore Archived Files")} last={!showArchived}>
          <RowLabel label="Restore Archived Files" sub="Browse and restore files currently in cold storage" badge={{ text: "3 files · 256 MB", color: "violet" }} />
          <button onClick={() => setShowArchived(!showArchived)} className="text-sm text-violet-600 hover:text-violet-700 font-medium shrink-0 transition-colors">
            {showArchived ? "Hide" : "View Archives"}
          </button>
        </Row>
        {showArchived && <ArchivedFilesPanel onClose={() => setShowArchived(false)} />}
      </SectionCard>

      {/* Upload Restrictions */}
      <SectionCard title="Upload Restrictions">
        <Row id={toSettingId("Limit Upload File Size")}>
          <RowLabel label="Limit Upload File Size" sub={limitSize ? `Files larger than ${maxSizeMB} MB will be rejected` : "No file size limit enforced"} />
          <Toggle enabled={limitSize} onChange={setLimitSize} />
        </Row>
        <Row id={toSettingId("Maximum File Size")} subtle>
          <RowLabel label="Maximum File Size" sub="Per-file upload limit" />
          <div className={`flex items-center gap-2 ${!limitSize ? "opacity-40 pointer-events-none" : ""}`}>
            <input type="number" min={1} value={maxSizeMB} onChange={(e) => setMaxSizeMB(e.target.value)}
              className="w-20 text-sm text-right border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 text-gray-700" />
            <span className="text-sm text-gray-400 shrink-0">MB</span>
          </div>
        </Row>
        <Row id={toSettingId("Restrict File Types")}>
          <RowLabel label="Restrict File Types" sub="Block specific file extensions from being uploaded" />
          <Toggle enabled={restrictTypes} onChange={setRestrictTypes} />
        </Row>
        <Row subtle>
          <div className={`w-full ${!restrictTypes ? "opacity-40 pointer-events-none" : ""}`}>
            <div className="text-xs text-gray-400 mb-2">Select or type file extensions to block</div>
            <FileTypeRestrictor types={blockedTypes} onChange={setBlockedTypes} disabled={!restrictTypes} />
          </div>
        </Row>
        <Row id={toSettingId("Pause Uploads When Storage Is Nearly Full")}>
          <RowLabel label="Pause Uploads When Storage Is Nearly Full" sub={preventNearFull ? `Uploads blocked when storage exceeds ${storageThreshold}%` : "Uploads continue regardless of storage level"} />
          <Toggle enabled={preventNearFull} onChange={setPreventNearFull} />
        </Row>
        <Row last subtle>
          <RowLabel label="Storage Full Threshold" sub="Choose the usage level that triggers the upload block" />
          <ThresholdPicker value={storageThreshold} onChange={setStorageThreshold} disabled={!preventNearFull} />
        </Row>
      </SectionCard>
    </div>
  );
}
