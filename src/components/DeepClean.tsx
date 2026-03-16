import { useState, useCallback } from "react";
import back from "../assets/icons/back-button.png";

type Props = { onBack: () => void };

type Severity = "high" | "med" | "low";
type CardState = "idle" | "scanning" | "scanned" | "deleted";

interface Category {
  id: string;
  icon: string;
  name: string;
  displaySize: string;
  bytes: number;
  countLabel: string;
  severity: Severity;
  resultText: string;
  deleteLabel: string;
}

interface HistoryEntry {
  date: string;
  label: string;
  freed: string;
}

const CATEGORIES: Category[] = [
  { id: "junk",     icon: "🗂️", name: "Junk & Temp Files",   displaySize: "1.2 GB",  bytes: 1200,  countLabel: "847 files",      severity: "high", resultText: "847 temp/cache files found",     deleteLabel: "Delete 1.2 GB"     },
  { id: "large",    icon: "📦", name: "Large Unused Files",  displaySize: "18.4 GB", bytes: 18400, countLabel: "23 files",        severity: "high", resultText: "23 files >500 MB, unused 90d+", deleteLabel: "Delete 18.4 GB"    },
  { id: "versions", icon: "🔁", name: "Old File Versions",   displaySize: "4.7 GB",  bytes: 4700,  countLabel: "1,204 versions",  severity: "med",  resultText: "1,204 old versions pruneable",  deleteLabel: "Delete 4.7 GB"     },
  { id: "empty",    icon: "📁", name: "Empty Folders",       displaySize: "0 MB",    bytes: 0,     countLabel: "34 folders",      severity: "low",  resultText: "34 empty folders found",        deleteLabel: "Remove 34 folders" },
  { id: "orphan",   icon: "🔗", name: "Orphaned Files",      displaySize: "890 MB",  bytes: 890,   countLabel: "156 files",       severity: "med",  resultText: "156 unreferenced files found",  deleteLabel: "Delete 890 MB"     },
  { id: "stale",    icon: "🔓", name: "Stale Shared Links",  displaySize: "—",       bytes: 0,     countLabel: "41 links",        severity: "med",  resultText: "41 expired share links found",  deleteLabel: "Revoke 41 links"   },
];

function formatMB(mb: number): string {
  if (mb >= 1000) return (mb / 1000).toFixed(1) + " GB";
  return mb + " MB";
}

function severityLabel(s: Severity) {
  return s === "high" ? "High priority" : s === "med" ? "Medium priority" : "Low priority";
}

function severityClasses(s: Severity) {
  return s === "high"
    ? "bg-red-50 text-red-500 border border-red-100"
    : s === "med"
    ? "bg-amber-50 text-amber-500 border border-amber-100"
    : "bg-emerald-50 text-emerald-600 border border-emerald-100";
}

function iconBg(s: Severity) {
  return s === "high" ? "bg-red-50" : s === "med" ? "bg-amber-50" : "bg-emerald-50";
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ message, withUndo, onUndo, onClose }: {
  message: string; withUndo: boolean; onUndo?: () => void; onClose: () => void;
}) {
  return (
    <div className="flex items-center gap-3 bg-gray-900 text-white px-5 py-3.5 rounded-2xl shadow-xl max-w-sm">
      <span className="text-emerald-400 text-lg">✓</span>
      <span className="flex-1 text-sm font-medium">{message}</span>
      {withUndo && (
        <button
          onClick={() => { onUndo?.(); onClose(); }}
          className="text-blue-400 font-medium text-sm whitespace-nowrap ml-2 hover:text-blue-300 transition-colors"
        >
          Undo
        </button>
      )}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

function Modal({ type, progress, step, freedBytes, done, onClose }: {
  type: "clean" | "wipe"; progress: number; step: string;
  freedBytes: number; done: boolean; onClose: () => void;
}) {
  const isWipe = type === "wipe";
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-10 w-[440px] text-center shadow-2xl">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 ${
          done ? "bg-emerald-50" : isWipe ? "bg-red-50" : "bg-blue-50"
        }`}>
          {done ? "✓" : isWipe ? "🗑️" : "🧹"}
        </div>
        <h3 className="text-2xl font-medium text-gray-700 mb-2 tracking-tight">
          {done ? (isWipe ? "Storage Wiped" : "Clean Complete") : (isWipe ? "Wiping Storage…" : "Cleaning…")}
        </h3>
        <p className="text-base text-gray-400 mb-6 leading-relaxed">
          {done ? "" : isWipe ? "Permanently deleting all files. Please wait." : "Removing selected files and freeing up space."}
        </p>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
          <div
            className={`h-full rounded-full transition-all duration-100 ${isWipe ? "bg-red-500" : "bg-blue-500"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-400 font-mono mb-6">{step}</p>
        {done && (
          <>
            <p className="font-mono text-4xl font-medium text-emerald-500 tracking-tight mb-1">
              {formatMB(freedBytes)} freed
            </p>
            <p className="text-base text-gray-400 mb-6">Storage space successfully recovered</p>
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-xl bg-blue-600 text-white text-base font-medium hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Category Card ─────────────────────────────────────────────────────────────

function CategoryCard({ cat, cardState, scanProgress, selected, onScan, onToggleSelect, onDelete }: {
  cat: Category; cardState: CardState; scanProgress: number; selected: boolean;
  onScan: () => void; onToggleSelect: () => void; onDelete: () => void;
}) {
  const isDeleted = cardState === "deleted";
  const isScanned = cardState === "scanned" || isDeleted;
  const isScanning = cardState === "scanning";

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col ${
      isDeleted
        ? "opacity-40 border-gray-100"
        : selected
        ? "border-blue-400 ring-2 ring-blue-100 shadow-md"
        : "border-gray-200 shadow-sm hover:-translate-y-0.5 hover:shadow-md hover:border-gray-300"
    }`}>
      <div className="p-5 flex flex-col flex-1">

        {/* Icon + checkbox */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${iconBg(cat.severity)}`}>
            {cat.icon}
          </div>
          <button
            onClick={onToggleSelect}
            disabled={!isScanned || isDeleted}
            style={{ width: 22, height: 22 }}
            className={`rounded-md border-2 transition-all flex items-center justify-center flex-shrink-0 ${
              selected ? "bg-blue-600 border-blue-600" : "border-gray-200 bg-white"
            } ${(!isScanned || isDeleted) ? "opacity-20 cursor-not-allowed" : "cursor-pointer hover:border-blue-400"}`}
          >
            {selected && (
              <svg width="11" height="11" viewBox="0 0 10 10" fill="none">
                <polyline points="1.5,5 4,7.5 8.5,2.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>

        {/* Name */}
        <p className="text-base font-medium text-gray-500 mb-1 leading-snug">{cat.name}</p>

        {/* Size */}
        <p className="font-mono text-3xl font-medium text-gray-500 tracking-tight leading-none mb-1">
          {cat.displaySize}
          <span className="font-sans text-sm font-normal text-gray-400 ml-1.5">est.</span>
        </p>

        {/* Count */}
        <p className="text-sm text-gray-400 mb-3">{cat.countLabel}</p>

        {/* Severity badge */}
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full mb-4 w-fit tracking-wide ${severityClasses(cat.severity)}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {severityLabel(cat.severity)}
        </span>

        {/* Result box */}
        {isScanned && (
          <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 mb-3 flex items-center justify-between gap-2">
            <span className="text-sm text-gray-500 leading-snug">{cat.resultText}</span>
            <span className="font-mono text-sm font-medium text-gray-500 whitespace-nowrap">{cat.displaySize}</span>
          </div>
        )}

        {/* Scan progress */}
        {isScanning && (
          <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mb-3">
            <div className="h-full bg-blue-500 rounded-full transition-all duration-75"
              style={{ width: `${scanProgress}%` }} />
          </div>
        )}

        <div className="mt-auto">
          {!isScanned && (
            <button
              onClick={onScan}
              disabled={isScanning}
              className={`w-full py-3 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                isScanning
                  ? "border-blue-200 bg-blue-50 text-blue-600 cursor-not-allowed"
                  : "border-gray-200 bg-white text-gray-500 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {isScanning ? (
                <>
                  <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  Scanning…
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  Analyze
                </>
              )}
            </button>
          )}

          {isScanned && !isDeleted && (
            <button
              onClick={onDelete}
              className="w-full py-3 rounded-xl border border-red-100 bg-red-50 text-red-600 text-sm font-medium flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
              </svg>
              {cat.deleteLabel}
            </button>
          )}

          {isDeleted && (
            <div className="w-full py-3 rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600 text-sm font-medium flex items-center justify-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Cleaned
            </div>
          )}
        </div>
      </div>

      {isScanning && (
        <div className="h-0.5 bg-gray-100">
          <div className="h-full bg-blue-500 transition-all duration-75" style={{ width: `${scanProgress}%` }} />
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function DeepCleanPage({ onBack }: Props) {
  const [cardStates, setCardStates] = useState<Record<string, CardState>>(
    Object.fromEntries(CATEGORIES.map((c) => [c.id, "idle"]))
  );
  const [scanProgress, setScanProgress] = useState<Record<string, number>>(
    Object.fromEntries(CATEGORIES.map((c) => [c.id, 0]))
  );
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [modal, setModal] = useState<{
    visible: boolean; type: "clean" | "wipe"; progress: number;
    step: string; freedBytes: number; done: boolean;
  }>({ visible: false, type: "clean", progress: 0, step: "", freedBytes: 0, done: false });
  const [confirmInput, setConfirmInput] = useState("");
  const [wiped, setWiped] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; message: string; withUndo: boolean }[]>([]);
  const toastId = { current: 0 };
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [usedGB, setUsedGB] = useState(75);
  const [scanAllProgress, setScanAllProgress] = useState(0);
  const [scanningAll, setScanningAll] = useState(false);

  const addToast = useCallback((message: string, withUndo: boolean) => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, message, withUndo }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5000);
  }, []);

  const addHistory = useCallback((label: string, freed: string) => {
    const date = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    setHistory((h) => [{ date, label, freed }, ...h].slice(0, 5));
  }, []);

  const runScanAnimation = useCallback((id: string): Promise<void> =>
    new Promise((resolve) => {
      setCardStates((s) => ({ ...s, [id]: "scanning" }));
      let pct = 0;
      const iv = setInterval(() => {
        pct += Math.random() * 18 + 4;
        if (pct >= 100) {
          clearInterval(iv);
          setScanProgress((p) => ({ ...p, [id]: 100 }));
          setTimeout(() => {
            setCardStates((s) => ({ ...s, [id]: "scanned" }));
            setScanProgress((p) => ({ ...p, [id]: 0 }));
            resolve();
          }, 200);
        } else {
          setScanProgress((p) => ({ ...p, [id]: pct }));
        }
      }, 80);
    }), []);

  const runModalAnimation = useCallback((
    type: "clean" | "wipe", steps: string[], freedBytes: number, onDone: () => void
  ) => {
    const allSteps = [...steps, "Finalizing…", "✓ Complete"];
    let pct = 0; let stepIdx = 0;
    setModal({ visible: true, type, progress: 0, step: allSteps[0], freedBytes, done: false });
    const iv = setInterval(() => {
      pct += Math.random() * 8 + 3;
      if (pct > 100) pct = 100;
      const newStep = Math.min(Math.floor((pct / 100) * allSteps.length), allSteps.length - 1);
      if (newStep !== stepIdx) stepIdx = newStep;
      setModal((m) => ({ ...m, progress: pct, step: allSteps[stepIdx] }));
      if (pct >= 100) {
        clearInterval(iv);
        setModal((m) => ({ ...m, done: true, step: "✓ Complete" }));
        onDone();
      }
    }, 120);
  }, []);

  const scanCard = useCallback(async (id: string) => {
    await runScanAnimation(id);
  }, [runScanAnimation]);

  const deleteCard = useCallback((id: string) => {
    const cat = CATEGORIES.find((c) => c.id === id)!;
    runModalAnimation("clean", [`Removing ${cat.name}…`, "Freeing blocks…"], cat.bytes, () => {
      setCardStates((s) => ({ ...s, [id]: "deleted" }));
      setSelected((s) => { const n = { ...s }; delete n[id]; return n; });
      setUsedGB((u) => Math.max(0, parseFloat((u - cat.bytes / 1000).toFixed(1))));
      addHistory(`Selective clean · ${cat.name}`, cat.displaySize !== "—" ? cat.displaySize : cat.countLabel);
      addToast(`${cat.name} cleaned`, true);
    });
  }, [runModalAnimation, addHistory, addToast]);

  const scanAll = useCallback(async () => {
    if (scanningAll) return;
    setScanningAll(true); setScanAllProgress(0);
    const ids = CATEGORIES.filter((c) => cardStates[c.id] === "idle").map((c) => c.id);
    for (let i = 0; i < ids.length; i++) {
      await runScanAnimation(ids[i]);
      setScanAllProgress(Math.round(((i + 1) / ids.length) * 100));
    }
    setScanningAll(false);
    addToast("All categories scanned", false);
  }, [scanningAll, cardStates, runScanAnimation, addToast]);

  const toggleSelect = useCallback((id: string) => {
    if (cardStates[id] !== "scanned") return;
    setSelected((s) => (s[id] ? (({ [id]: _, ...rest }) => rest)(s) : { ...s, [id]: true }));
  }, [cardStates]);

  const toggleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      const sel: Record<string, boolean> = {};
      CATEGORIES.forEach((c) => { if (cardStates[c.id] === "scanned") sel[c.id] = true; });
      setSelected(sel);
    } else { setSelected({}); }
  }, [cardStates]);

  const cleanSelected = useCallback(() => {
    const ids = Object.keys(selected);
    if (!ids.length) return;
    const totalBytes = ids.reduce((s, id) => s + (CATEGORIES.find((c) => c.id === id)?.bytes ?? 0), 0);
    runModalAnimation("clean", ["Scanning selected…", "Removing files…", "Freeing space…"], totalBytes, () => {
      setCardStates((s) => { const n = { ...s }; ids.forEach((id) => { n[id] = "deleted"; }); return n; });
      setSelected({});
      setUsedGB((u) => Math.max(0, parseFloat((u - totalBytes / 1000).toFixed(1))));
      addHistory(`Selective clean · ${ids.length} categories`, formatMB(totalBytes));
      addToast(`${formatMB(totalBytes)} freed successfully`, true);
    });
  }, [selected, runModalAnimation, addHistory, addToast]);

  const initiateWipe = useCallback(() => {
    if (confirmInput.toLowerCase().trim() !== "wipe my storage") return;
    runModalAnimation("wipe",
      ["Revoking share links…", "Deleting all files…", "Removing folders…", "Clearing metadata…"],
      75000, () => {
        setUsedGB(0); setWiped(true); setConfirmInput("");
        addHistory("Full storage wipe", "75 GB");
        addToast("Storage wiped — 75 GB freed", false);
      }
    );
  }, [confirmInput, runModalAnimation, addHistory, addToast]);

  const selectedCount = Object.keys(selected).length;
  const totalSelectedBytes = Object.keys(selected).reduce(
    (s, id) => s + (CATEGORIES.find((c) => c.id === id)?.bytes ?? 0), 0
  );
  const potentialBytes = CATEGORIES.filter((c) => cardStates[c.id] === "scanned").reduce((s, c) => s + c.bytes, 0);
  const wipeConfirmed = confirmInput.toLowerCase().trim() === "wipe my storage";
  const allScanned = CATEGORIES.every((c) => cardStates[c.id] === "scanned" || cardStates[c.id] === "deleted");

  return (
    <div className="bg-[#F8F9FC]">
      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* ── Original heading ── */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="text-sm text-blue-600 font-medium">
            <img src={back} alt="Back" className="w-12 h-12" />
          </button>
          <h2 className="text-3xl font-bold text-gray-900">Deep Clean</h2>
        </div>

        {/* ══════════════════════════════
            SECTION 1 — ANALYZE & CLEAN
        ══════════════════════════════ */}

        {/* Section header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-2xl font-normal text-gray-700">Analyze &amp; Clean</h3>
            <p className="text-base text-gray-400 mt-1">Scan by category, review findings, then delete selectively.</p>
          </div>
          <button
            onClick={scanAll}
            disabled={scanningAll || allScanned}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {scanningAll
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            }
            {allScanned ? "All Scanned" : scanningAll ? "Scanning…" : "Scan All"}
          </button>
        </div>

        {/* Scan-all global progress */}
        {scanningAll && (
          <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden mb-5">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-150"
              style={{ width: `${scanAllProgress}%` }}
            />
          </div>
        )}

        {/* Bulk action bar */}
        <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex items-center justify-between mb-5 shadow-sm">
          <div className="flex items-center gap-5">
            <label className="flex items-center gap-2.5 text-base font-medium text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4 accent-blue-600 cursor-pointer"
                onChange={(e) => toggleSelectAll(e.target.checked)}
                checked={selectedCount > 0 && selectedCount === CATEGORIES.filter((c) => cardStates[c.id] === "scanned").length}
              />
              Select all scanned
            </label>
            <span className="text-sm text-gray-400">
              <strong className="text-gray-700 font-medium">{selectedCount}</strong> selected ·{" "}
              <strong className="text-gray-700 font-medium">{formatMB(totalSelectedBytes)}</strong> to free
            </span>
          </div>
          <button
            onClick={cleanSelected}
            disabled={selectedCount === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
            </svg>
            Clean Selected
          </button>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          {CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat.id}
              cat={cat}
              cardState={cardStates[cat.id]}
              scanProgress={scanProgress[cat.id]}
              selected={!!selected[cat.id]}
              onScan={() => scanCard(cat.id)}
              onToggleSelect={() => toggleSelect(cat.id)}
              onDelete={() => deleteCard(cat.id)}
            />
          ))}
        </div>

        {/* Summary footer bar */}
        <div className="bg-white border border-gray-200 rounded-2xl px-6 py-5 flex items-center justify-between shadow-sm mb-12">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">Potential savings</p>
            <p className="font-mono text-2xl font-medium text-emerald-600">
              {potentialBytes > 0 ? formatMB(potentialBytes) : "—"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">Last cleaned</p>
            <p className="text-base font-medium text-gray-700">
              {history.length > 0 ? history[0].date : "Never"}
            </p>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="flex items-center gap-4 mb-10">
          <div className="flex-1 border-t-2 border-dashed border-gray-200" />
          <span className="text-xs font-medium text-gray-300 uppercase tracking-widest">or</span>
          <div className="flex-1 border-t-2 border-dashed border-gray-200" />
        </div>

        {/* ══════════════════════════════
            SECTION 2 — WIPE STORAGE
        ══════════════════════════════ */}

        <div className="mb-5">
          <h3 className="text-2xl font-normal text-gray-700">Wipe Entire Storage</h3>
          <p className="text-base text-gray-400 mt-1">Permanently delete everything. This cannot be undone.</p>
        </div>

        <div className="bg-white rounded-2xl border border-red-100 overflow-hidden shadow-sm">

          {/* Wipe header */}
          <div className="bg-red-50 border-b border-red-100 px-6 py-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center text-2xl flex-shrink-0">🗑️</div>
            <div>
              <p className="text-lg font-medium text-red-800">Clear All Storage</p>
              <p className="text-sm text-red-400 mt-0.5">All files, folders, and shared links will be permanently removed</p>
            </div>
          </div>

          <div className="p-6">

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                { val: wiped ? "0 GB" : "75 GB", label: "Total used"    },
                { val: wiped ? "0"    : "4",      label: "Folders"       },
                { val: wiped ? "0"    : "7,543",  label: "Files"         },
                { val: wiped ? "0"    : "41",     label: "Shared links"  },
              ].map((s) => (
                <div key={s.label} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center">
                  <p className="font-mono text-2xl font-medium text-gray-700 tracking-tight">{s.val}</p>
                  <p className="text-sm text-gray-400 mt-1 font-medium">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Warning banner */}
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" className="mt-0.5 flex-shrink-0 text-amber-500">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <p className="text-sm text-amber-800 leading-relaxed">
                This action is <strong>irreversible</strong>. All files will be permanently deleted with no recovery window.
                All active shared links will be revoked and members removed from shared folders.
              </p>
            </div>

            {/* Confirm input */}
            {!wiped && (
              <>
                <p className="text-sm text-gray-500 mb-3">
                  To confirm, type{" "}
                  <code className="font-mono bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-lg text-red-600 text-sm font-medium">
                    wipe my storage
                  </code>{" "}
                  below:
                </p>
                <input
                  type="text"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder="wipe my storage"
                  autoComplete="off"
                  className={`w-full px-4 py-3.5 rounded-xl border font-mono text-base outline-none transition-all mb-5 ${
                    wipeConfirmed
                      ? "border-red-400 bg-red-50 text-red-700"
                      : "border-gray-200 bg-white text-gray-800 focus:border-gray-400"
                  }`}
                />
              </>
            )}

            {/* Wipe button */}
            <button
              onClick={initiateWipe}
              disabled={!wipeConfirmed || wiped}
              className={`w-full py-4 rounded-xl text-base font-medium flex items-center justify-center gap-3 transition-all ${
                wiped
                  ? "bg-emerald-50 border border-emerald-100 text-emerald-600 cursor-default"
                  : wipeConfirmed
                  ? "bg-red-600 text-white hover:bg-red-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-100"
                  : "bg-red-50 text-red-300 border border-red-100 cursor-not-allowed"
              }`}
            >
              {wiped ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Storage Wiped
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                  </svg>
                  Wipe Entire Storage — {usedGB} GB
                </>
              )}
            </button>

          </div>
        </div>

        {/* ── Clean history ── */}
        <div className="mt-10 mb-8">
          <h3 className="text-xl font-normal text-gray-700 mb-4">Clean History</h3>
          {history.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl px-6 py-10 text-center shadow-sm">
              <p className="text-base text-gray-400">No clean history yet. Run your first scan above.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {history.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-6 py-4 shadow-sm"
                >
                  <span className="text-sm text-gray-400 font-medium">{h.date}</span>
                  <span className="text-sm text-gray-600 font-normal">{h.label}</span>
                  <span className="font-mono text-base font-medium text-emerald-600">{h.freed}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── Modal ── */}
      {modal.visible && (
        <Modal
          type={modal.type}
          progress={modal.progress}
          step={modal.step}
          freedBytes={modal.freedBytes}
          done={modal.done}
          onClose={() => setModal((m) => ({ ...m, visible: false }))}
        />
      )}

      {/* ── Toasts ── */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
        {toasts.map((t) => (
          <Toast
            key={t.id}
            message={t.message}
            withUndo={t.withUndo}
            onClose={() => setToasts((ts) => ts.filter((x) => x.id !== t.id))}
          />
        ))}
      </div>

    </div>
  );
}
