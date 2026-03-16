import { useState, useCallback } from "react";
import back from "../assets/icons/back-button.png";

type Props = {
  onBack: () => void;
};

// ── Types ────────────────────────────────────────────────────────────────────

type Severity = "high" | "med" | "low";
type CardState = "idle" | "scanning" | "scanned" | "deleted";

interface Category {
  id: string;
  icon: string;
  name: string;
  displaySize: string;
  bytes: number; // in MB
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

// ── Data ─────────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  {
    id: "junk",
    icon: "🗂️",
    name: "Junk & Temp Files",
    displaySize: "1.2 GB",
    bytes: 1200,
    countLabel: "847 files",
    severity: "high",
    resultText: "847 temp/cache files found",
    deleteLabel: "Delete 1.2 GB",
  },
  {
    id: "large",
    icon: "📦",
    name: "Large Unused Files",
    displaySize: "18.4 GB",
    bytes: 18400,
    countLabel: "23 files",
    severity: "high",
    resultText: "23 files >500 MB, unused 90d+",
    deleteLabel: "Delete 18.4 GB",
  },
  {
    id: "versions",
    icon: "🔁",
    name: "Old File Versions",
    displaySize: "4.7 GB",
    bytes: 4700,
    countLabel: "1,204 versions",
    severity: "med",
    resultText: "1,204 old versions pruneable",
    deleteLabel: "Delete 4.7 GB",
  },
  {
    id: "empty",
    icon: "📁",
    name: "Empty Folders",
    displaySize: "0 MB",
    bytes: 0,
    countLabel: "34 folders",
    severity: "low",
    resultText: "34 empty folders found",
    deleteLabel: "Remove 34 folders",
  },
  {
    id: "orphan",
    icon: "🔗",
    name: "Orphaned Files",
    displaySize: "890 MB",
    bytes: 890,
    countLabel: "156 files",
    severity: "med",
    resultText: "156 unreferenced files found",
    deleteLabel: "Delete 890 MB",
  },
  {
    id: "stale",
    icon: "🔓",
    name: "Stale Shared Links",
    displaySize: "—",
    bytes: 0,
    countLabel: "41 links",
    severity: "med",
    resultText: "41 expired share links found",
    deleteLabel: "Revoke 41 links",
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatMB(mb: number): string {
  if (mb >= 1000) return (mb / 1000).toFixed(1) + " GB";
  return mb + " MB";
}

function severityLabel(s: Severity) {
  if (s === "high") return "High priority";
  if (s === "med") return "Medium priority";
  return "Low priority";
}

function severityClasses(s: Severity): string {
  if (s === "high") return "bg-red-50 text-red-600";
  if (s === "med") return "bg-amber-50 text-amber-600";
  return "bg-emerald-50 text-emerald-600";
}

function iconBg(s: Severity): string {
  if (s === "high") return "bg-red-50";
  if (s === "med") return "bg-amber-50";
  return "bg-emerald-50";
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ScanProgress({ value }: { value: number }) {
  return (
    <div className="w-full h-0.5 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-blue-500 rounded-full transition-all duration-75"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function Toast({
  message,
  withUndo,
  onUndo,
  onClose,
}: {
  message: string;
  withUndo: boolean;
  onUndo?: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center gap-3 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg max-w-xs animate-[fadeUp_0.25s_ease_forwards]">
      <span className="text-emerald-400">✓</span>
      <span className="flex-1">{message}</span>
      {withUndo && (
        <button
          onClick={() => { onUndo?.(); onClose(); }}
          className="text-blue-400 font-medium text-xs whitespace-nowrap"
        >
          Undo
        </button>
      )}
    </div>
  );
}

function Modal({
  type,
  progress,
  step,
  freedBytes,
  done,
  onClose,
}: {
  type: "clean" | "wipe";
  progress: number;
  step: string;
  freedBytes: number;
  done: boolean;
  onClose: () => void;
}) {
  const isWipe = type === "wipe";
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-9 w-96 text-center shadow-2xl">
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl mx-auto mb-5 ${
            done ? "bg-emerald-50" : isWipe ? "bg-red-50" : "bg-blue-50"
          }`}
        >
          {done ? "✓" : isWipe ? "🗑️" : "🧹"}
        </div>
        <h3 className="text-base font-semibold mb-1 tracking-tight">
          {done
            ? isWipe ? "Storage Wiped" : "Clean Complete"
            : isWipe ? "Wiping Storage…" : "Cleaning…"}
        </h3>
        <p className="text-sm text-gray-400 mb-5">
          {done ? "" : isWipe ? "Permanently deleting all files." : "Removing files and freeing space."}
        </p>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all duration-100 ${
              isWipe ? "bg-red-500" : "bg-blue-500"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 font-mono mb-5">{step}</p>
        {done && (
          <>
            <p className="font-mono text-2xl font-medium text-emerald-500 tracking-tight mb-1">
              {formatMB(freedBytes)} freed
            </p>
            <p className="text-xs text-gray-400 mb-5">Storage space recovered</p>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
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

function CategoryCard({
  cat,
  cardState,
  scanProgress,
  selected,
  onScan,
  onToggleSelect,
  onDelete,
}: {
  cat: Category;
  cardState: CardState;
  scanProgress: number;
  selected: boolean;
  onScan: () => void;
  onToggleSelect: () => void;
  onDelete: () => void;
}) {
  const isDeleted = cardState === "deleted";
  const isScanned = cardState === "scanned" || isDeleted;
  const isScanning = cardState === "scanning";

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
        isDeleted
          ? "opacity-50 border-gray-100"
          : selected
          ? "border-blue-400 shadow-[0_0_0_3px_rgba(59,130,246,0.08)] shadow-md"
          : "border-gray-100 shadow-sm hover:-translate-y-0.5 hover:shadow-md"
      }`}
    >
      <div className="p-4">
        {/* Top row */}
        <div className="flex items-start justify-between mb-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base ${iconBg(cat.severity)}`}>
            {cat.icon}
          </div>
          {/* Checkbox */}
          <button
            onClick={onToggleSelect}
            disabled={!isScanned || isDeleted}
            className={`w-4.5 h-4.5 rounded-md border transition-all flex items-center justify-center ${
              selected
                ? "bg-blue-600 border-blue-600"
                : "border-gray-200 bg-white"
            } ${(!isScanned || isDeleted) ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
            style={{ width: 18, height: 18 }}
          >
            {selected && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <polyline points="1.5,5 4,7.5 8.5,2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>

        {/* Name & size */}
        <p className="text-sm font-medium text-gray-900 mb-0.5">{cat.name}</p>
        <p className="font-mono text-xl font-medium text-gray-900 tracking-tight leading-none mb-1">
          {cat.displaySize}{" "}
          <span className="font-sans text-xs font-normal text-gray-400">estimated</span>
        </p>
        <p className="text-xs text-gray-400 mb-3">{cat.countLabel}</p>

        {/* Severity badge */}
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full mb-3 ${severityClasses(cat.severity)}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
          {severityLabel(cat.severity)}
        </span>

        {/* Result box */}
        {isScanned && (
          <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 mb-3 flex items-center justify-between">
            <span className="text-xs text-gray-500">{cat.resultText}</span>
            <span className="font-mono text-xs font-medium text-gray-800 ml-2 whitespace-nowrap">{cat.displaySize}</span>
          </div>
        )}

        {/* Scan progress */}
        {isScanning && (
          <div className="mb-3">
            <ScanProgress value={scanProgress} />
          </div>
        )}

        {/* Action button */}
        {!isScanned && (
          <button
            onClick={onScan}
            disabled={isScanning}
            className={`w-full py-2 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
              isScanning
                ? "border-blue-200 bg-blue-50 text-blue-600 cursor-not-allowed"
                : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
            }`}
          >
            {isScanning ? (
              <>
                <span className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                Scanning…
              </>
            ) : (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                Analyze
              </>
            )}
          </button>
        )}

        {isScanned && !isDeleted && (
          <button
            onClick={onDelete}
            className="w-full py-2 rounded-lg border border-red-100 bg-red-50 text-red-600 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
            {cat.deleteLabel}
          </button>
        )}

        {isDeleted && (
          <div className="w-full py-2 rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-600 text-xs font-medium flex items-center justify-center gap-1.5">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Cleaned
          </div>
        )}
      </div>

      {/* Bottom scan progress bar */}
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
  // Card states
  const [cardStates, setCardStates] = useState<Record<string, CardState>>(
    Object.fromEntries(CATEGORIES.map((c) => [c.id, "idle"]))
  );
  const [scanProgress, setScanProgress] = useState<Record<string, number>>(
    Object.fromEntries(CATEGORIES.map((c) => [c.id, 0]))
  );
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  // Modal
  const [modal, setModal] = useState<{
    visible: boolean;
    type: "clean" | "wipe";
    progress: number;
    step: string;
    freedBytes: number;
    done: boolean;
  }>({ visible: false, type: "clean", progress: 0, step: "", freedBytes: 0, done: false });

  // Wipe section
  const [confirmInput, setConfirmInput] = useState("");
  const [wiped, setWiped] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<{ id: number; message: string; withUndo: boolean }[]>([]);
  const toastId = { current: 0 };

  // History
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Storage
  const [usedGB, setUsedGB] = useState(75);

  // Scan all progress
  const [scanAllProgress, setScanAllProgress] = useState(0);
  const [scanningAll, setScanningAll] = useState(false);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const addToast = useCallback((message: string, withUndo: boolean) => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, message, withUndo }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5000);
  }, []);

  const addHistory = useCallback((label: string, freed: string) => {
    const date = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    setHistory((h) => [{ date, label, freed }, ...h].slice(0, 5));
  }, []);

  const runScanAnimation = useCallback(
    (id: string): Promise<void> =>
      new Promise((resolve) => {
        setCardStates((s) => ({ ...s, [id]: "scanning" }));
        let pct = 0;
        const iv = setInterval(() => {
          pct += Math.random() * 18 + 4;
          if (pct >= 100) {
            pct = 100;
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
      }),
    []
  );

  const runModalAnimation = useCallback(
    (type: "clean" | "wipe", steps: string[], freedBytes: number, onDone: () => void) => {
      const allSteps = [...steps, "Finalizing…", "✓ Complete"];
      let pct = 0;
      let stepIdx = 0;
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
    },
    []
  );

  // ── Actions ────────────────────────────────────────────────────────────────

  const scanCard = useCallback(
    async (id: string) => {
      await runScanAnimation(id);
    },
    [runScanAnimation]
  );

  const deleteCard = useCallback(
    (id: string) => {
      const cat = CATEGORIES.find((c) => c.id === id)!;
      runModalAnimation(
        "clean",
        [`Removing ${cat.name}…`, "Freeing blocks…"],
        cat.bytes,
        () => {
          setCardStates((s) => ({ ...s, [id]: "deleted" }));
          setSelected((s) => { const n = { ...s }; delete n[id]; return n; });
          setUsedGB((u) => Math.max(0, parseFloat((u - cat.bytes / 1000).toFixed(1))));
          addHistory(`Selective clean · ${cat.name}`, cat.displaySize !== "—" ? cat.displaySize : cat.countLabel);
          addToast(`${cat.name} cleaned · ${cat.displaySize !== "—" ? cat.displaySize : cat.countLabel} freed`, true);
        }
      );
    },
    [runModalAnimation, addHistory, addToast]
  );

  const scanAll = useCallback(async () => {
    if (scanningAll) return;
    setScanningAll(true);
    setScanAllProgress(0);
    const ids = CATEGORIES.filter((c) => cardStates[c.id] === "idle").map((c) => c.id);
    for (let i = 0; i < ids.length; i++) {
      await runScanAnimation(ids[i]);
      setScanAllProgress(Math.round(((i + 1) / ids.length) * 100));
    }
    setScanningAll(false);
    addToast("All categories scanned", false);
  }, [scanningAll, cardStates, runScanAnimation, addToast]);

  const toggleSelect = useCallback(
    (id: string) => {
      if (cardStates[id] !== "scanned") return;
      setSelected((s) => (s[id] ? (({ [id]: _, ...rest }) => rest)(s) : { ...s, [id]: true }));
    },
    [cardStates]
  );

  const toggleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        const sel: Record<string, boolean> = {};
        CATEGORIES.forEach((c) => { if (cardStates[c.id] === "scanned") sel[c.id] = true; });
        setSelected(sel);
      } else {
        setSelected({});
      }
    },
    [cardStates]
  );

  const cleanSelected = useCallback(() => {
    const ids = Object.keys(selected);
    if (!ids.length) return;
    const totalBytes = ids.reduce((s, id) => s + (CATEGORIES.find((c) => c.id === id)?.bytes ?? 0), 0);
    runModalAnimation(
      "clean",
      ["Scanning selected…", "Removing files…", "Freeing space…"],
      totalBytes,
      () => {
        setCardStates((s) => {
          const n = { ...s };
          ids.forEach((id) => { n[id] = "deleted"; });
          return n;
        });
        setSelected({});
        setUsedGB((u) => Math.max(0, parseFloat((u - totalBytes / 1000).toFixed(1))));
        addHistory(`Selective clean · ${ids.length} categories`, formatMB(totalBytes));
        addToast(`${formatMB(totalBytes)} freed successfully`, true);
      }
    );
  }, [selected, runModalAnimation, addHistory, addToast]);

  const initiateWipe = useCallback(() => {
    if (confirmInput.toLowerCase().trim() !== "wipe my storage") return;
    runModalAnimation(
      "wipe",
      ["Revoking share links…", "Deleting all files…", "Removing folders…", "Clearing metadata…"],
      75000,
      () => {
        setUsedGB(0);
        setWiped(true);
        setConfirmInput("");
        addHistory("Full storage wipe", "75 GB");
        addToast("Storage wiped — 75 GB freed", false);
      }
    );
  }, [confirmInput, runModalAnimation, addHistory, addToast]);

  // ── Derived ────────────────────────────────────────────────────────────────

  const selectedCount = Object.keys(selected).length;
  const totalSelectedBytes = Object.keys(selected).reduce(
    (s, id) => s + (CATEGORIES.find((c) => c.id === id)?.bytes ?? 0),
    0
  );
  const potentialBytes = CATEGORIES.filter(
    (c) => cardStates[c.id] === "scanned"
  ).reduce((s, c) => s + c.bytes, 0);

  const wipeConfirmed = confirmInput.toLowerCase().trim() === "wipe my storage";

  const allScanned = CATEGORIES.every(
    (c) => cardStates[c.id] === "scanned" || cardStates[c.id] === "deleted"
  );

  return (
    <div className="min-h-screen bg-[#F8F9FC]" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      <div className="max-w-3xl mx-auto px-6 py-8">

        <div className="max-w-xl">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={onBack} className="text-sm text-blue-600 font-medium">
              <img src={back} alt="Back" className="w-12 h-12" />
            </button>
            <h2 className="text-3xl font-bold">Deep Clean</h2>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            SECTION 1 — ANALYZE & CLEAN
        ══════════════════════════════════════════════════ */}

        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900 tracking-tight">Analyze &amp; Clean</h2>
            <p className="text-xs text-gray-400 mt-0.5">Scan by category, review findings, delete selectively.</p>
          </div>
          <button
            onClick={scanAll}
            disabled={scanningAll || allScanned}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {scanningAll ? (
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            )}
            {allScanned ? "All Scanned" : scanningAll ? "Scanning…" : "Scan All"}
          </button>
        </div>

        {/* Scan-all progress bar */}
        {scanningAll && (
          <div className="h-0.5 bg-gray-100 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-blue-500 rounded-full transition-all duration-150" style={{ width: `${scanAllProgress}%` }} />
          </div>
        )}

        {/* Bulk action bar */}
        <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center justify-between mb-4 shadow-sm">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-3.5 h-3.5 accent-blue-600 cursor-pointer"
                onChange={(e) => toggleSelectAll(e.target.checked)}
                checked={selectedCount > 0 && selectedCount === CATEGORIES.filter((c) => cardStates[c.id] === "scanned").length}
              />
              Select all scanned
            </label>
            <span className="text-xs text-gray-400">
              <strong className="text-gray-700">{selectedCount}</strong> selected ·{" "}
              <strong className="text-gray-700">{formatMB(totalSelectedBytes)}</strong> to free
            </span>
          </div>
          <button
            onClick={cleanSelected}
            disabled={selectedCount === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
            Clean Selected
          </button>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
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

        {/* Footer bar */}
        <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center justify-between shadow-sm mb-10">
          <p className="text-xs text-gray-400">
            Potential savings:{" "}
            <strong className="font-mono text-sm text-emerald-600 font-medium">
              {potentialBytes > 0 ? formatMB(potentialBytes) : "—"}
            </strong>
          </p>
          <p className="text-xs text-gray-400">
            Last cleaned:{" "}
            <span className="text-gray-600">
              {history.length > 0 ? history[0].date : "Never"}
            </span>
          </p>
        </div>

        {/* ── Divider ── */}
        <div className="relative mb-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-dashed border-gray-200" />
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            SECTION 2 — WIPE STORAGE
        ══════════════════════════════════════════════════ */}

        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900 tracking-tight">Wipe Entire Storage</h2>
            <p className="text-xs text-gray-400 mt-0.5">Permanently delete everything. This cannot be undone.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-red-100 overflow-hidden shadow-sm">
          {/* Wipe header */}
          <div className="bg-red-50 border-b border-red-100 px-5 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-lg flex-shrink-0">🗑️</div>
            <div>
              <p className="text-sm font-semibold text-red-800">Clear All Storage</p>
              <p className="text-xs text-red-500 mt-0.5">All files, folders, and shared links will be permanently removed</p>
            </div>
          </div>

          <div className="p-5">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              {[
                { val: wiped ? "0 GB" : "75 GB", label: "Total used" },
                { val: wiped ? "0" : "4", label: "Folders" },
                { val: wiped ? "0" : "7,543", label: "Files" },
                { val: wiped ? "0" : "41", label: "Shared links" },
              ].map((s) => (
                <div key={s.label} className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                  <p className="font-mono text-lg font-medium text-gray-900 tracking-tight">{s.val}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Warning */}
            <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl p-3.5 mb-5 text-xs text-amber-800 leading-relaxed">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="mt-0.5 flex-shrink-0"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span>
                This action is <strong>irreversible</strong>. All files will be permanently deleted with no recovery window.
                All active shared links will be revoked and members removed from shared folders.
              </span>
            </div>

            {/* Confirm input */}
            {!wiped && (
              <>
                <p className="text-xs text-gray-500 mb-2">
                  To confirm, type{" "}
                  <code className="font-mono bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded text-red-600 text-xs">
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
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-mono text-sm outline-none transition-all mb-4 ${
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
              className={`w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                wiped
                  ? "bg-emerald-50 border border-emerald-100 text-emerald-600 cursor-default"
                  : wipeConfirmed
                  ? "bg-red-600 text-white hover:bg-red-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-100"
                  : "bg-red-50 text-red-300 border border-red-100 cursor-not-allowed"
              }`}
            >
              {wiped ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Storage Wiped
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  Wipe Entire Storage — {usedGB} GB
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Clean history ── */}
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Clean History</h3>
          {history.length === 0 ? (
            <p className="text-xs text-gray-400 py-3">No clean history yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {history.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-xs shadow-sm"
                >
                  <span className="text-gray-400">{h.date}</span>
                  <span className="text-gray-500">{h.label}</span>
                  <span className="font-mono font-medium text-emerald-600">{h.freed}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── Modal ───────────────────────────────────────── */}
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

      {/* ── Toasts ──────────────────────────────────────── */}
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
