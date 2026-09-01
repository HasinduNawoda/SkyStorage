import { useState, useEffect } from "react";
import back from "../assets/icons/back-button.png";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

type Props = { onBack: () => void };

type Severity = "high" | "med" | "low";
type CardState = "idle" | "scanning" | "scanned" | "deleted";

interface Category {
  id: string;
  icon: string;
  name: string;
  severity: Severity;
  countLabel: string;
  resultText: string;
  deleteLabel: string;
  bytes: number;
  count: number;
  items: any;
}

interface HistoryEntry {
  date: string;
  label: string;
  freed: string;
}

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

// -----------------------------------------------------------------------------
// Modals & Toasts
// -----------------------------------------------------------------------------

function Toast({ message, withUndo, onClose }: { message: string; withUndo?: boolean; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="flex items-center gap-3 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg animate-in slide-in-from-bottom-2 fade-in duration-300">
      <span className="text-sm font-medium">{message}</span>
      {withUndo && (
        <>
          <div className="w-px h-4 bg-gray-700 mx-1" />
          <button onClick={onClose} className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition">
            Undo
          </button>
        </>
      )}
    </div>
  );
}

export default function DeepClean({ onBack }: Props) {
  const [globalState, setGlobalState] = useState<"idle" | "scanning" | "scanned">("idle");
  const [categories, setCategories] = useState<Category[]>([
    { id: "junk", icon: "📦", name: "Junk & Temp Files", severity: "high", countLabel: "? files", resultText: "Not scanned yet", deleteLabel: "Clean", bytes: 0, count: 0, items: [] },
    { id: "large", icon: "🐋", name: "Large Unused Files", severity: "high", countLabel: "? files", resultText: "Not scanned yet", deleteLabel: "Clean", bytes: 0, count: 0, items: [] },
    { id: "recycle", icon: "🗑️", name: "Old Recycle Bin", severity: "med", countLabel: "? items", resultText: "Not scanned yet", deleteLabel: "Clean", bytes: 0, count: 0, items: [] },
    { id: "empty", icon: "📁", name: "Empty Folders", severity: "low", countLabel: "? folders", resultText: "Not scanned yet", deleteLabel: "Clean", bytes: 0, count: 0, items: [] },
    { id: "stale", icon: "🔗", name: "Stale Shared Links", severity: "med", countLabel: "? links", resultText: "Not scanned yet", deleteLabel: "Clean", bytes: 0, count: 0, items: [] },
  ]);

  const [cardStates, setCardStates] = useState<Record<string, CardState>>({
    junk: "idle", large: "idle", recycle: "idle", empty: "idle", stale: "idle"
  });

  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("sky_deepclean_history") || "[]");
    } catch { return []; }
  });
  const [toasts, setToasts] = useState<{ id: string; message: string; withUndo?: boolean }[]>([]);

  const addToast = (message: string, withUndo?: boolean) => {
    setToasts((t) => [...t, { id: Math.random().toString(), message, withUndo }]);
  };

  const saveHistory = (entry: HistoryEntry) => {
    const newHistory = [entry, ...history].slice(0, 50);
    setHistory(newHistory);
    localStorage.setItem("sky_deepclean_history", JSON.stringify(newHistory));
  };

  const handleScanAll = async () => {
    setGlobalState("scanning");
    
    try {
      const res = await fetch(`${API_BASE}/deepclean/scan`, { credentials: "include" });
      const data = await res.json();
      
      setCategories(categories.map(c => {
        const d = data[c.id] || { count: 0, bytes: 0, items: [] };
        return {
          ...c,
          count: d.count,
          bytes: d.bytes,
          items: d.items,
          countLabel: `${d.count} ${c.id === "empty" ? "folders" : c.id === "stale" ? "links" : "files"}`,
          resultText: d.count === 0 ? "Nothing to clean" : `Found ${d.count} items`,
          deleteLabel: d.bytes > 0 ? `Delete ${formatMB(Math.round(d.bytes / 1024 / 1024))}` : "Clean"
        };
      }));

      setCardStates({ junk: "scanned", large: "scanned", recycle: "scanned", empty: "scanned", stale: "scanned" });
      setGlobalState("scanned");
    } catch (e) {
      console.error(e);
      setGlobalState("idle");
      addToast("Scan failed. Try again.");
    }
  };

  const handleDelete = async (cat: Category) => {
    if (cat.count === 0) return;
    
    setCardStates((prev) => ({ ...prev, [cat.id]: "scanning" }));
    
    try {
      const res = await fetch(`${API_BASE}/deepclean/clean`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ category: cat.id, items: cat.items })
      });
      
      if (!res.ok) throw new Error("Clean failed");

      setCardStates((prev) => ({ ...prev, [cat.id]: "deleted" }));
      addToast(`Cleaned ${cat.name}`);
      saveHistory({
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        label: `Cleaned ${cat.name}`,
        freed: formatMB(Math.round(cat.bytes / 1024 / 1024))
      });
    } catch (e) {
      console.error(e);
      setCardStates((prev) => ({ ...prev, [cat.id]: "scanned" }));
      addToast(`Failed to clean ${cat.name}`);
    }
  };

  const totalFreed = history.reduce((sum, h) => {
    const val = parseFloat(h.freed.split(" ")[0]);
    if (h.freed.includes("GB")) return sum + val * 1024;
    return sum + val;
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-6">
      <div className="w-full max-w-4xl">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="text-sm text-blue-600 font-medium shrink-0 hover:opacity-80 transition-opacity"
          >
            <img src={back} alt="Back" className="w-12 h-12" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900">Deep Clean</h1>
            <p className="text-gray-500 mt-1">Identify and remove unneeded files safely.</p>
          </div>
        </div>

        {/* Master Scan Banner */}
        <div className="bg-white border border-gray-200 rounded-3xl p-8 mb-10 shadow-sm flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {globalState === "idle"
                ? "Ready to scan?"
                : globalState === "scanning"
                ? "Analyzing storage..."
                : "Scan Complete"}
            </h2>
            <p className="text-gray-500 mt-2">
              {globalState === "idle"
                ? "Find junk, large files, and duplicates to free up space."
                : globalState === "scanning"
                ? "This might take a few seconds."
                : "Review the categories below to safely delete data."}
            </p>
          </div>
          <button
            onClick={handleScanAll}
            disabled={globalState === "scanning"}
            className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
              globalState === "scanning"
                ? "bg-blue-100 text-blue-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
            }`}
          >
            {globalState === "scanning" ? "Scanning..." : globalState === "scanned" ? "Rescan" : "Start Scan"}
          </button>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {categories.map((cat) => {
            const state = cardStates[cat.id];
            
            return (
              <div
                key={cat.id}
                className={`relative bg-white rounded-2xl border p-5 flex flex-col transition-all duration-300 ${
                  state === "idle" || state === "scanning"
                    ? "border-gray-100 shadow-sm opacity-60"
                    : state === "deleted"
                    ? "border-emerald-200 bg-emerald-50/30 opacity-70"
                    : "border-gray-200 shadow-md hover:shadow-lg"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl">
                    {cat.icon}
                  </div>
                  {state === "scanned" && cat.count > 0 && (
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${severityClasses(cat.severity)}`}>
                      {severityLabel(cat.severity)}
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-1">{cat.name}</h3>
                
                {state === "deleted" ? (
                  <div className="text-sm text-emerald-600 font-medium mb-4">Cleaned!</div>
                ) : (
                  <div className="text-sm text-gray-500 mb-4">
                    {state === "scanned" ? cat.resultText : cat.countLabel}
                  </div>
                )}

                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div className="text-base font-bold text-gray-900">
                    {state === "scanned" && cat.count > 0 ? formatMB(Math.round(cat.bytes / 1024 / 1024)) : "--"}
                  </div>
                  {state === "scanned" && cat.count > 0 && (
                    <button
                      onClick={() => handleDelete(cat)}
                      className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition"
                    >
                      {cat.deleteLabel}
                    </button>
                  )}
                  {state === "scanning" && (
                    <div className="text-sm text-gray-400 animate-pulse">Processing...</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* History */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-normal text-gray-700">Clean History</h3>
            {history.length > 0 && (
              <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Lifetime freed: {formatMB(Math.round(totalFreed))}
              </span>
            )}
          </div>
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

      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
        {toasts.map((t) => (
          <Toast key={t.id} message={t.message} withUndo={t.withUndo} onClose={() => setToasts((ts) => ts.filter((x) => x.id !== t.id))} />
        ))}
      </div>
    </div>
  );
}
