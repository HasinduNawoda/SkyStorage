import { useState, useRef, useEffect } from "react";
import { toSectionId, toSettingId } from "../settingsUtils";

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

function ExpandRow({ id, children, last = false }: { id?: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div id={id} className={`px-8 py-4 flex flex-col gap-3 ${!last ? "border-b border-gray-100" : ""}`}>
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

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 shrink-0 focus:outline-none ${on ? "bg-blue-500" : "bg-gray-200"}`}>
      <span className={`absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${on ? "translate-x-[18px]" : "translate-x-0"}`} />
    </button>
  );
}

function SegControl({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex border border-gray-200 rounded-lg overflow-hidden shrink-0">
      {options.map((opt, i) => (
        <button key={opt} onClick={() => onChange(opt)}
          className={`px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${i !== options.length - 1 ? "border-r border-gray-200" : ""} ${value === opt ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50"}`}>
          {opt}
        </button>
      ))}
    </div>
  );
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
        <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
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

export default function SystemPerformance() {
  const [cpuMode, setCpuMode] = useState("Balanced");
  const [cpuCustom, setCpuCustom] = useState(40);
  const [ramMode, setRamMode] = useState("Auto");
  const [ramCustom, setRamCustom] = useState(2048);
  const [diskPriority, setDiskPriority] = useState("Normal");

  const [uploadMode, setUploadMode] = useState("Unlimited");
  const [uploadVal, setUploadVal] = useState(500);
  const [uploadUnit, setUploadUnit] = useState("KB/s");
  const [downloadMode, setDownloadMode] = useState("Unlimited");
  const [downloadVal, setDownloadVal] = useState(5);
  const [downloadUnit, setDownloadUnit] = useState("MB/s");
  const [adaptiveBandwidth, setAdaptiveBandwidth] = useState(true);

  const [profile, setProfile] = useState("Balanced");
  const [pauseSyncLowBattery, setPauseSyncLowBattery] = useState(true);
  const [pauseBackupLowBattery, setPauseBackupLowBattery] = useState(false);

  const [pdfOpen, setPdfOpen] = useState("Same preview panel");
  const [imageOpen, setImageOpen] = useState("Same preview panel");
  const [docOpen, setDocOpen] = useState("New tab");
  const [mediaOpen, setMediaOpen] = useState("Same preview panel");

  const profiles = [
    { key: "Battery Saver",    icon: "🔋", desc: "Minimal resource use"    },
    { key: "Balanced",         icon: "⚖️",  desc: "Recommended default"     },
    { key: "High Performance", icon: "⚡", desc: "Max speed, more power"   },
  ];

  const openOptions = ["Same preview panel", "New tab", "Download"];
  const imageOpenOptions = ["Same preview panel", "New tab", "Lightbox"];
  const mediaOpenOptions = ["Same preview panel", "New tab", "Download"];

  return (
    <div className="max-w-[90%]">
      <div className="mb-7">
        <h3 className="text-2xl font-semibold text-gray-800">System Performance</h3>
        <p className="text-sm text-gray-400 mt-1">Control resource usage, network limits, and sync behavior for optimal performance</p>
      </div>

      {/* Resource Usage */}
      <SectionCard title="Resource Usage">
        <ExpandRow id={toSettingId("CPU usage limit")}>
          <div className="flex items-center justify-between gap-4">
            <RowLabel label="CPU usage limit" desc="Cap processor usage to reduce heat and preserve battery" />
            <SegControl options={["Low", "Balanced", "High", "Custom"]} value={cpuMode} onChange={setCpuMode} />
          </div>
          {cpuMode === "Custom" && (
            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs text-gray-400 shrink-0">Custom limit</span>
              <input type="range" min={10} max={100} step={1} value={cpuCustom} onChange={(e) => setCpuCustom(Number(e.target.value))} className="flex-1 accent-blue-500" />
              <span className="text-xs font-semibold text-blue-600 w-10 text-right">{cpuCustom}%</span>
            </div>
          )}
        </ExpandRow>
        <ExpandRow id={toSettingId("Memory (RAM) usage limit")}>
          <div className="flex items-center justify-between gap-4">
            <RowLabel label="Memory (RAM) usage limit" desc="Manage how much RAM the app can allocate" />
            <SegControl options={["Auto manage", "Manual limit"]} value={ramMode} onChange={setRamMode} />
          </div>
          {ramMode === "Manual limit" && (
            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs text-gray-400 shrink-0">RAM limit</span>
              <input type="range" min={256} max={8192} step={256} value={ramCustom} onChange={(e) => setRamCustom(Number(e.target.value))} className="flex-1 accent-blue-500" />
              <span className="text-xs font-semibold text-blue-600 w-14 text-right">{(ramCustom / 1024).toFixed(1)} GB</span>
            </div>
          )}
        </ExpandRow>
        <Row id={toSettingId("Disk I/O priority")} last>
          <RowLabel label="Disk I/O priority" desc="Set how aggressively the app reads and writes to disk" />
          <SegControl options={["Low impact", "Normal", "High performance"]} value={diskPriority} onChange={setDiskPriority} />
        </Row>
      </SectionCard>

      {/* Network Performance */}
      <SectionCard title="Network Performance">
        <ExpandRow id={toSettingId("Upload speed limit")}>
          <div className="flex items-center justify-between gap-4">
            <RowLabel label="Upload speed limit" desc="Throttle outbound bandwidth to keep other apps responsive" />
            <SegControl options={["Unlimited", "Custom"]} value={uploadMode} onChange={setUploadMode} />
          </div>
          {uploadMode === "Custom" && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-gray-400 shrink-0">Limit</span>
              <input type="number" min={1} max={9999} value={uploadVal} onChange={(e) => setUploadVal(Number(e.target.value))} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-800 w-24 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
              <select value={uploadUnit} onChange={(e) => setUploadUnit(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-700 outline-none bg-white"><option>KB/s</option><option>MB/s</option></select>
            </div>
          )}
        </ExpandRow>
        <ExpandRow id={toSettingId("Download speed limit")}>
          <div className="flex items-center justify-between gap-4">
            <RowLabel label="Download speed limit" desc="Throttle inbound bandwidth when needed" />
            <SegControl options={["Unlimited", "Custom"]} value={downloadMode} onChange={setDownloadMode} />
          </div>
          {downloadMode === "Custom" && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-gray-400 shrink-0">Limit</span>
              <input type="number" min={1} max={9999} value={downloadVal} onChange={(e) => setDownloadVal(Number(e.target.value))} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-800 w-24 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
              <select value={downloadUnit} onChange={(e) => setDownloadUnit(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-700 outline-none bg-white"><option>KB/s</option><option>MB/s</option></select>
            </div>
          )}
        </ExpandRow>
        <Row id={toSettingId("Adaptive bandwidth")} last>
          <RowLabel label="Adaptive bandwidth" desc="Automatically adjust transfer speeds based on network conditions" />
          <Toggle on={adaptiveBandwidth} onChange={() => setAdaptiveBandwidth((v) => !v)} />
        </Row>
      </SectionCard>

      {/* Performance Mode */}
      <SectionCard title="Performance Mode">
        <ExpandRow id={toSettingId("Performance profile")}>
          <div className="flex items-center justify-between gap-4">
            <RowLabel label="Performance profile" desc="Quickly tune all resource settings at once" />
          </div>
          <div className="flex gap-3 flex-wrap pt-1">
            {profiles.map((p) => (
              <button key={p.key} onClick={() => setProfile(p.key)}
                className={`flex flex-col items-center px-5 py-3 rounded-xl border transition-all text-left min-w-[96px] ${profile === p.key ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-white hover:bg-gray-50"}`}>
                <span className="text-lg mb-1">{p.icon}</span>
                <span className={`text-xs font-semibold ${profile === p.key ? "text-blue-600" : "text-gray-700"}`}>{p.key}</span>
                <span className="text-[11px] text-gray-400 mt-0.5 text-center">{p.desc}</span>
              </button>
            ))}
          </div>
        </ExpandRow>
        <Row id={toSettingId("Pause sync on low battery")}>
          <RowLabel label="Pause sync on low battery" desc="Suspend file sync when battery drops below 20%" />
          <Toggle on={pauseSyncLowBattery} onChange={() => setPauseSyncLowBattery((v) => !v)} />
        </Row>
        <Row id={toSettingId("Pause backup on low battery")} last>
          <RowLabel label="Pause backup on low battery" desc="Stop automatic backups until device is charging" />
          <Toggle on={pauseBackupLowBattery} onChange={() => setPauseBackupLowBattery((v) => !v)} />
        </Row>
      </SectionCard>

      {/* File Preview Behavior */}
      <SectionCard title="File Preview Behavior">
        {(
          [
            { label: "PDF files",              desc: "How PDF documents open when clicked",    value: pdfOpen,   set: setPdfOpen,   opts: openOptions       },
            { label: "Images",                  desc: "How image files open when clicked",      value: imageOpen, set: setImageOpen, opts: imageOpenOptions  },
            { label: "Documents (.docx, .xlsx)",desc: "How office documents open when clicked", value: docOpen,   set: setDocOpen,   opts: openOptions       },
            { label: "Videos & audio",          desc: "How media files open when clicked",      value: mediaOpen, set: setMediaOpen, opts: mediaOpenOptions  },
          ] as const
        ).map((item, i, arr) => (
          <Row key={item.label} id={toSettingId(item.label)} last={i === arr.length - 1}>
            <RowLabel label={item.label} desc={item.desc} />
            <CustomSelect options={item.opts as unknown as string[]} value={item.value} onChange={(v) => (item.set as (v: string) => void)(v)} />
          </Row>
        ))}
      </SectionCard>
    </div>
  );
}
