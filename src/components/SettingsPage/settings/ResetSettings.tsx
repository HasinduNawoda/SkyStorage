import { useState } from "react";
import { toSectionId, toSettingId } from "../settingsUtils";

type SectionKey = "privacy" | "appearance" | "notifications" | "storage" | "backup" | "performance";

const sections: { key: SectionKey; title: string; desc: string; iconBg: string; iconStroke: string }[] = [
  { key: "privacy",       title: "Reset Privacy & Security",  desc: "Two-factor auth, session limits, data visibility",      iconBg: "#E6F1FB", iconStroke: "#185FA5" },
  { key: "appearance",    title: "Reset Appearance",          desc: "Theme, layout density, font size, color mode",          iconBg: "#EEEDFE", iconStroke: "#534AB7" },
  { key: "notifications", title: "Reset Notifications",       desc: "Alert types, frequency, email and push preferences",    iconBg: "#FAEEDA", iconStroke: "#BA7517" },
  { key: "storage",       title: "Reset Storage",             desc: "Upload limits, file type filters, folder defaults",     iconBg: "#EAF3DE", iconStroke: "#3B6D11" },
  { key: "backup",        title: "Reset Backup & Sync",       desc: "Schedule, versioning, conflict resolution policy",      iconBg: "#E1F5EE", iconStroke: "#0F6E56" },
  { key: "performance",   title: "Reset System Performance",  desc: "Cache policy, bandwidth throttle, concurrency limits",  iconBg: "#FCEBEB", iconStroke: "#A32D2D" },
];

function ResetButton({ onReset }: { onReset: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  const handleReset = () => {
    setConfirming(false);
    setDone(true);
    onReset();
    setTimeout(() => setDone(false), 2500);
  };

  if (done) return <span className="text-sm text-green-700 font-medium flex items-center gap-1.5">✓ Reset</span>;
  if (confirming) return (
    <div className="flex gap-2 shrink-0">
      <button onClick={() => setConfirming(false)} className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
      <button onClick={handleReset} className="text-sm px-3 py-1.5 rounded-lg bg-amber-400 text-amber-900 font-semibold hover:bg-amber-500 transition-colors">Confirm reset</button>
    </div>
  );
  return (
    <button onClick={() => setConfirming(true)} className="text-sm px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-700 font-medium hover:bg-amber-100 transition-colors shrink-0">
      Reset
    </button>
  );
}

export default function ResetSettings() {
  const [masterConfirming, setMasterConfirming] = useState(false);
  const [masterDone, setMasterDone] = useState(false);
  const [resetAll, setResetAll] = useState(false);

  const handleMasterReset = () => {
    setMasterConfirming(false);
    setMasterDone(true);
    setResetAll(true);
    setTimeout(() => { setMasterDone(false); setResetAll(false); }, 2800);
  };

  return (
    <div className="max-w-[90%]">
      <div className="mb-7">
        <h3 className="text-2xl font-semibold text-gray-800">Reset Settings</h3>
        <p className="text-sm text-gray-400 mt-1">Restore defaults for all or specific sections of your storage system</p>
      </div>

      {/* Master Reset */}
      <div id={toSectionId("Reset all settings")} className="mb-8">
        <h2 className="text-base font-semibold text-gray-700 mb-3">Reset all settings</h2>
        <div className="border border-amber-300 rounded-xl overflow-hidden bg-amber-50/60">
          <div id={toSettingId("Reset All Settings")} className="px-8 py-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-200 flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3 9a6 6 0 1 1 1.5 3.9" stroke="#854F0B" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M3 13V9h4" stroke="#854F0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-amber-900">Reset all settings to default</div>
                <div className="text-xs text-amber-700 mt-0.5">Every setting across all categories will be restored</div>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full mt-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 inline-block" /> This action cannot be undone
                </span>
              </div>
            </div>
            {masterDone ? (
              <span className="text-sm text-green-700 font-medium flex items-center gap-1.5 shrink-0">✓ All reset</span>
            ) : masterConfirming ? (
              <div className="flex gap-2 shrink-0">
                <button onClick={() => setMasterConfirming(false)} className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={handleMasterReset} className="text-sm px-3 py-1.5 rounded-lg bg-amber-400 text-amber-900 font-semibold hover:bg-amber-500 transition-colors">Confirm reset all</button>
              </div>
            ) : (
              <button onClick={() => setMasterConfirming(true)} className="text-sm px-3 py-1.5 rounded-lg border border-amber-400 bg-amber-100 text-amber-800 font-medium hover:bg-amber-200 transition-colors shrink-0">Reset All</button>
            )}
          </div>
        </div>
      </div>

      {/* Individual Resets */}
      <div id={toSectionId("Reset individual settings")} className="mb-8">
        <h2 className="text-base font-semibold text-gray-700 mb-3">Reset individual settings</h2>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {sections.map((s, i) => (
            <div key={s.key} id={toSettingId(s.title)} className={`px-8 py-4 flex items-center justify-between gap-4 ${i < sections.length - 1 ? "border-b border-gray-100" : ""}`}>
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: s.iconBg }}>
                  <div className="w-4 h-4 rounded-sm" style={{ background: s.iconStroke, opacity: 0.7 }} />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">{s.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{s.desc}</div>
                </div>
              </div>
              <ResetButton key={resetAll ? "reset" : "normal"} onReset={() => {}} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
