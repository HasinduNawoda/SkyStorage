import { useState } from "react";
import type { ReactNode } from "react";
import { toSectionId, toSettingId } from "../settingsUtils";

function CircularProgressBar({ value = 0, color = "#3b82f6", strokeWidth = 10, size = 160, children }: { value?: number; color?: string; strokeWidth?: number; size?: number; children?: ReactNode }) {
  const SEGMENTS = 80;
  const cx = 50, cy = 50;
  const radius = (100 - strokeWidth) / 2;
  const gapDeg = 3;
  const segDeg = (360 / SEGMENTS) - gapDeg;
  const filledCount = Math.round((value / 100) * SEGMENTS);

  const polarToCartesian = (angleDeg: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  };

  const describeArc = (startDeg: number, endDeg: number) => {
    const start = polarToCartesian(startDeg);
    const end = polarToCartesian(endDeg);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  };

  return (
    <div style={{ width: size, height: size, position: "relative", display: "inline-block" }}>
      <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
        {Array.from({ length: SEGMENTS }, (_, i) => {
          const startDeg = i * (360 / SEGMENTS);
          const endDeg = startDeg + segDeg;
          const filled = i < filledCount;
          return (
            <path key={i} d={describeArc(startDeg, endDeg)} fill="none"
              stroke={filled ? color : "#e5e7eb"} strokeWidth={strokeWidth} strokeLinecap="butt"
              style={{ transition: "stroke 0.4s ease" }} />
          );
        })}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {children}
      </div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div id={toSectionId(title)} className="mb-8">
      <h2 className="text-base font-semibold text-gray-700 mb-3">{title}</h2>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function Row({ id, children, last = false }: { id?: string; children: ReactNode; last?: boolean }) {
  return (
    <div id={id} className={`px-8 py-4 flex items-center justify-between gap-4 ${!last ? "border-b border-gray-100" : ""}`}>
      {children}
    </div>
  );
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange}
      className={`relative rounded-full transition-colors duration-200 shrink-0 focus:outline-none ${enabled ? "bg-blue-500" : "bg-gray-200"}`}
      style={{ width: 40, height: 22 }}>
      <span className="absolute rounded-full bg-white shadow transition-transform duration-200"
        style={{ width: 18, height: 18, transform: enabled ? "translateX(18px)" : "translateX(0px)", top: 2, left: 2 }} />
    </button>
  );
}

const checkupSteps = [
  { id: 1, icon: "🔑", title: "Enable Two-Factor Authentication", desc: "Protect your account with a second verification step.", cta: "Enable 2FA" },
  { id: 2, icon: "🔐", title: "Add a Passkey", desc: "Use biometrics or a device PIN to sign in faster and safer.", cta: "Add Passkey" },
  { id: 3, icon: "📧", title: "Verify Recovery Email", desc: "Confirm your backup email to recover your account if needed.", cta: "Verify" },
  { id: 4, icon: "🖥️", title: "Review Active Sessions", desc: "Check and revoke any sessions you don't recognize.", cta: "Review" },
  { id: 5, icon: "🔔", title: "Enable Login Alerts", desc: "Get notified when a new device accesses your account.", cta: "Enable" },
];

function PrivacyCheckup({ score, steps, onComplete }: { score: number; steps: Array<{ id: number; done: boolean }>; onComplete: (id: number) => void }) {
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";
  const label = score >= 80 ? "Good" : score >= 60 ? "Fair" : "At Risk";
  const done = steps.filter((s) => s.done).length;

  return (
    <div id={toSectionId("Privacy Checkup")} className="mb-8">
      <h2 className="text-base font-semibold text-gray-700 mb-3">Privacy Checkup</h2>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div id={toSettingId("Privacy Checkup")} className="flex flex-col items-center py-8 border-b border-gray-100">
          <CircularProgressBar value={score} color={color} size={220}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 40, fontWeight: 700, color: "#1f2937", lineHeight: 1 }}>{score}%</div>
              <div style={{ fontSize: 15, fontWeight: 600, color, marginTop: 6 }}>{label}</div>
            </div>
          </CircularProgressBar>
          <div className="text-xs text-gray-400 mt-3">{done} of {checkupSteps.length} steps complete</div>
        </div>
        {checkupSteps.map((s, i) => {
          const isDone = steps.find((x) => x.id === s.id)?.done ?? false;
          return (
            <Row key={s.id} last={i === checkupSteps.length - 1}>
              <div className="flex items-start gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 border ${isDone ? "bg-green-50 border-green-100" : "bg-gray-100 border-gray-200"}`}>
                  {isDone ? "✅" : s.icon}
                </div>
                <div className="min-w-0">
                  <div className={`text-sm font-medium ${isDone ? "text-gray-400 line-through" : "text-gray-700"}`}>{s.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{s.desc}</div>
                </div>
              </div>
              {!isDone && (
                <button onClick={() => onComplete(s.id)} className="text-sm font-medium text-blue-600 hover:text-blue-700 shrink-0 transition-colors whitespace-nowrap">
                  {s.cta}
                </button>
              )}
            </Row>
          );
        })}
      </div>
    </div>
  );
}

const passwordHistory = [
  { date: "Mar 1, 2025", masked: "••••••••••••" },
  { date: "Sep 14, 2024", masked: "•••••••••" },
  { date: "Feb 3, 2024", masked: "••••••••••••••" },
];

function PasswordHistoryModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-sm mx-4">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <span className="font-semibold text-gray-800 text-sm">Password History</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
        </div>
        <div className="px-5 py-2">
          <p className="text-xs text-gray-400 py-3">Previous passwords cannot be reused.</p>
          {passwordHistory.map((h, i) => (
            <div key={i} className={`py-3 flex items-center justify-between ${i < passwordHistory.length - 1 ? "border-b border-gray-100" : ""}`}>
              <span className="text-xs text-gray-400">{h.date}</span>
              <span className="text-sm tracking-widest text-gray-500 font-mono">{h.masked}</span>
            </div>
          ))}
        </div>
        <div className="px-5 py-4 border-t border-gray-100">
          <button onClick={onClose} className="w-full text-sm font-medium py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
}

function ChangePassword({ onStrong }: { onStrong: (v: boolean) => void }) {
  const [open, setOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const strength = (() => {
    const p = form.next; if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"][strength];

  const handleSave = () => {
    if (!form.current || !form.next || !form.confirm) { setError("All fields required."); return; }
    if (form.next !== form.confirm) { setError("Passwords don't match."); return; }
    if (strength < 3) { setError("Password is too weak."); return; }
    setError("");
    setSaved(true);
    onStrong(true);
    setTimeout(() => { setSaved(false); setOpen(false); setForm({ current: "", next: "", confirm: "" }); }, 1500);
  };

  return (
    <>
      {showHistory && <PasswordHistoryModal onClose={() => setShowHistory(false)} />}
      <Row id={toSettingId("Password")}>
        <div>
          <div className="text-xs text-gray-400 mb-0.5">Password</div>
          <div className="text-sm text-gray-800">Last changed 3 months ago</div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button onClick={() => setShowHistory(true)} className="text-xs text-gray-400 hover:text-gray-600 transition-colors underline underline-offset-2">History</button>
          <button onClick={() => setOpen(!open)} className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">Change</button>
        </div>
      </Row>
      {open && (
        <div className="px-8 pb-5 border-b border-gray-100">
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            {(["current", "next", "confirm"] as const).map((field) => (
              <div key={field}>
                <label className="text-xs text-gray-400 block mb-1">
                  {field === "current" ? "Current Password" : field === "next" ? "New Password" : "Confirm New Password"}
                </label>
                <div className="relative">
                  <input type={show[field] ? "text" : "password"} value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 pr-10 bg-white"
                    placeholder="••••••••••" />
                  <button type="button" onClick={() => setShow({ ...show, [field]: !show[field] })} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600">
                    {show[field] ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            ))}
            {form.next && (
              <div>
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-1 flex-1 rounded-full transition-colors" style={{ background: i <= strength ? strengthColor : "#e5e7eb" }} />
                  ))}
                </div>
                <span className="text-xs font-medium" style={{ color: strengthColor }}>{strengthLabel}</span>
              </div>
            )}
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-2 pt-1">
              <button onClick={() => { setOpen(false); setError(""); setForm({ current: "", next: "", confirm: "" }); }} className="flex-1 text-sm py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
              <button onClick={handleSave} className={`flex-1 text-sm py-2 rounded-lg font-medium transition-all ${saved ? "bg-green-500 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}>
                {saved ? "Saved ✓" : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Passkeys({ onAdd }: { onAdd: (v: boolean) => void }) {
  const [keys, setKeys] = useState([
    { id: 1, name: "MacBook Pro — Touch ID", added: "Mar 2025" },
    { id: 2, name: "iPhone 15 Pro — Face ID", added: "Jan 2025" },
  ]);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const addKey = () => {
    if (!newName.trim()) return;
    const updated = [...keys, { id: Date.now(), name: newName.trim(), added: "Now" }];
    setKeys(updated); setNewName(""); setAdding(false); onAdd(true);
  };

  const removeKey = (id: number) => {
    const updated = keys.filter((x) => x.id !== id);
    setKeys(updated); onAdd(updated.length > 0);
  };

  return (
    <>
      {keys.map((k, i) => (
        <Row key={k.id} id={i === 0 ? toSettingId("Passkeys") : undefined} last={i === keys.length - 1 && !adding}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-base shrink-0">🔑</div>
            <div>
              <div className="text-xs text-gray-400 mb-0.5">Passkey</div>
              <div className="text-sm text-gray-800">{k.name} · Added {k.added}</div>
            </div>
          </div>
          <button onClick={() => removeKey(k.id)} className="text-sm text-red-500 hover:text-red-600 font-medium shrink-0 transition-colors">Remove</button>
        </Row>
      ))}
      {adding ? (
        <div className="px-8 pb-4">
          <div className="flex gap-2 mt-2">
            <input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Passkey name (e.g. Work MacBook)"
              className="flex-1 border border-blue-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-100"
              onKeyDown={(e) => e.key === "Enter" && addKey()} />
            <button onClick={addKey} className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Add</button>
            <button onClick={() => setAdding(false)} className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="px-8 py-3 border-t border-gray-100">
          <button onClick={() => setAdding(true)} className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">+ Add passkey</button>
        </div>
      )}
    </>
  );
}

function TwoFactor({ onChange }: { onChange: (v: boolean) => void }) {
  const [enabled, setEnabled] = useState(false);
  const [method, setMethod] = useState("app");
  const [showSetup, setShowSetup] = useState(false);
  const [code, setCode] = useState("");

  const handleToggle = () => {
    if (enabled) { setEnabled(false); setShowSetup(false); onChange(false); }
    else setShowSetup(true);
  };

  const handleVerify = () => {
    if (code.length === 6) { setEnabled(true); setShowSetup(false); setCode(""); onChange(true); }
  };

  return (
    <>
      <Row id={toSettingId("Two-Factor Authentication")} last={!showSetup && !enabled}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-base shrink-0">
            {enabled ? "🔒" : "🔓"}
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-0.5">Two-Factor Authentication</div>
            <div className="text-sm text-gray-800">{enabled ? `Enabled via ${method === "app" ? "Authenticator App" : "SMS"}` : "Adds an extra layer of security"}</div>
          </div>
        </div>
        <Toggle enabled={enabled} onChange={handleToggle} />
      </Row>
      {enabled && (
        <Row last>
          <div>
            <div className="text-xs text-gray-400 mb-1">Method</div>
            <div className="flex gap-2">
              {(["app", "sms"]).map((m) => (
                <button key={m} onClick={() => setMethod(m)} className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${method === m ? "border-blue-300 text-blue-600 bg-blue-50" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                  {m === "app" ? "Authenticator App" : "SMS"}
                </button>
              ))}
            </div>
          </div>
          <div />
        </Row>
      )}
      {showSetup && (
        <div className="px-8 pb-5 border-b border-gray-100">
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <p className="text-xs text-gray-500">Open your authenticator app and enter the 6-digit code shown for this account.</p>
            <input type="text" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/, ""))} placeholder="000000"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-center text-xl tracking-widest font-mono text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 bg-white" />
            <div className="flex gap-2">
              <button onClick={() => setShowSetup(false)} className="flex-1 text-sm py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={handleVerify} className="flex-1 text-sm py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700">Verify & Enable</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DataEncryption({ onChange }: { onChange: (v: boolean) => void }) {
  const [e2e, setE2e] = useState(true);
  const [atRest, setAtRest] = useState(true);

  return (
    <>
      <Row id={toSettingId("End-to-End Encryption")}>
        <div>
          <div className="text-xs text-gray-400 mb-0.5">End-to-End Encryption</div>
          <div className="text-sm text-gray-800">Messages and files encrypted in transit</div>
        </div>
        <Toggle enabled={e2e} onChange={() => { const next = !e2e; setE2e(next); onChange(next && atRest); }} />
      </Row>
      <Row id={toSettingId("Encryption at Rest")} last>
        <div>
          <div className="text-xs text-gray-400 mb-0.5">Encryption at Rest</div>
          <div className="text-sm text-gray-800">Stored data encrypted with AES-256</div>
        </div>
        <Toggle enabled={atRest} onChange={() => { const next = !atRest; setAtRest(next); onChange(e2e && next); }} />
      </Row>
    </>
  );
}

const initialAlerts = [
  { id: 1, icon: "⚠️", title: "Suspicious login attempt", detail: "Unknown device · Lagos, NG · 2 hrs ago", read: false },
  { id: 2, icon: "📱", title: "New device logged in", detail: "iPhone 15 Pro · Colombo, LK · Yesterday", read: true },
  { id: 3, icon: "🖥️", title: "New device logged in", detail: "Windows PC · Kandy, LK · 3 days ago", read: true },
];

function LoginAlerts({ onChange }: { onChange: (v: boolean) => void }) {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [notify, setNotify] = useState(true);
  const dismiss = (id: number) => setAlerts((a) => a.map((x) => x.id === id ? { ...x, read: true } : x));

  return (
    <>
      <Row id={toSettingId("Notify on new device login")}>
        <div>
          <div className="text-xs text-gray-400 mb-0.5">Notify on new device login</div>
          <div className="text-sm text-gray-800">Get an email when a new device signs in</div>
        </div>
        <Toggle enabled={notify} onChange={() => { const next = !notify; setNotify(next); onChange(next); }} />
      </Row>
      {alerts.map((a, i) => (
        <Row key={a.id} last={i === alerts.length - 1}>
          <div className="flex items-start gap-3 min-w-0">
            <div className="text-xl shrink-0 mt-0.5">{a.icon}</div>
            <div className="min-w-0">
              <div className={`text-sm flex items-center gap-2 ${a.read ? "text-gray-500" : "text-gray-800 font-medium"}`}>
                {a.title}
                {!a.read && <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 inline-block" />}
              </div>
              <div className="text-xs text-gray-400 truncate">{a.detail}</div>
            </div>
          </div>
          {!a.read && (
            <button onClick={() => dismiss(a.id)} className="text-sm text-blue-600 hover:text-blue-700 font-medium shrink-0 transition-colors">Dismiss</button>
          )}
        </Row>
      ))}
    </>
  );
}

const LOG_ICONS: Record<string, string> = { login: "🔐", upload: "⬆️", download: "⬇️", share: "🔗", permission: "🛡️" };
const LOG_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  login:      { bg: "bg-blue-50",    border: "border-blue-100",    text: "text-blue-600"    },
  upload:     { bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-600" },
  download:   { bg: "bg-violet-50",  border: "border-violet-100",  text: "text-violet-600"  },
  share:      { bg: "bg-amber-50",   border: "border-amber-100",   text: "text-amber-600"   },
  permission: { bg: "bg-rose-50",    border: "border-rose-100",    text: "text-rose-600"    },
};
const LOG_LABELS: Record<string, string> = { login: "Login", upload: "Upload", download: "Download", share: "Share", permission: "Permission" };

const activityLogs = [
  { id: 1, type: "login",      title: "Successful login",      detail: "Chrome · Colombo, LK",                                   time: "2 min ago"   },
  { id: 2, type: "upload",     title: "File uploaded",          detail: "Q4_Report_Final.pdf · 4.2 MB",                           time: "18 min ago"  },
  { id: 3, type: "share",      title: "File shared",            detail: "design_assets.zip shared with team@company.com",          time: "1 hr ago"    },
  { id: 4, type: "download",   title: "File downloaded",        detail: "invoice_march2025.pdf · 210 KB",                         time: "3 hrs ago"   },
  { id: 5, type: "permission", title: "Permission changed",     detail: "contracts/ folder → read-only for guest users",           time: "Yesterday"   },
  { id: 6, type: "login",      title: "Login attempt failed",   detail: "Unknown device · Lagos, NG",                             time: "Yesterday"   },
  { id: 7, type: "upload",     title: "File uploaded",          detail: "profile_photo.png · 890 KB",                             time: "2 days ago"  },
  { id: 8, type: "download",   title: "File downloaded",        detail: "annual_report_2024.xlsx · 1.8 MB",                       time: "2 days ago"  },
  { id: 9, type: "share",      title: "Sharing revoked",        detail: "old_project_data.zip — access removed",                  time: "3 days ago"  },
  { id: 10, type: "permission",title: "Role updated",           detail: "john.doe@company.com → Editor",                          time: "4 days ago"  },
];

const ALL_TYPES = ["all", "login", "upload", "download", "share", "permission"];

function ActivityLog() {
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(false);

  const filtered = activityLogs.filter((l) => filter === "all" || l.type === filter);
  const visible = expanded ? filtered : filtered.slice(0, 5);

  return (
    <div id={toSectionId("Activity Log")} className="mb-8">
      <h2 className="text-base font-semibold text-gray-700 mb-3">Activity Log</h2>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div id={toSettingId("Activity Log")} className="px-8 pt-4 pb-3 border-b border-gray-100 flex gap-1.5 flex-wrap">
          {ALL_TYPES.map((t) => (
            <button key={t} onClick={() => { setFilter(t); setExpanded(false); }}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors capitalize ${filter === t ? "bg-gray-800 border-gray-800 text-white" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
              {t === "all" ? "All Activity" : LOG_LABELS[t]}
            </button>
          ))}
        </div>
        {visible.length === 0 ? (
          <div className="px-8 py-8 text-center text-sm text-gray-400">No activity found.</div>
        ) : (
          visible.map((log, i) => {
            const c = LOG_COLORS[log.type];
            return (
              <div key={log.id} className={`px-8 py-4 flex items-center gap-3 ${i < visible.length - 1 ? "border-b border-gray-100" : ""}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 border ${c.bg} ${c.border}`}>
                  {LOG_ICONS[log.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">{log.title}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${c.bg} ${c.text} border ${c.border}`}>{LOG_LABELS[log.type]}</span>
                  </div>
                  <div className="text-xs text-gray-400 truncate mt-0.5">{log.detail}</div>
                </div>
                <div className="text-xs text-gray-400 shrink-0 whitespace-nowrap">{log.time}</div>
              </div>
            );
          })
        )}
        {filtered.length > 5 && (
          <div className="px-8 py-3 border-t border-gray-100">
            <button onClick={() => setExpanded(!expanded)} className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
              {expanded ? "Show less" : `Show ${filtered.length - 5} more events`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PrivacySecurity() {
  const [twoFA, setTwoFA] = useState(false);
  const [hasPasskey, setHasPasskey] = useState(true);
  const [encryption, setEncryption] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [strongPassword, setStrongPassword] = useState(false);

  const score = [twoFA, hasPasskey, encryption, loginAlerts, strongPassword].filter(Boolean).length * 20;

  const steps = [
    { id: 1, done: twoFA },
    { id: 2, done: hasPasskey },
    { id: 3, done: strongPassword },
    { id: 4, done: true },
    { id: 5, done: loginAlerts },
  ];

  const handleComplete = (id: number) => {
    if (id === 1) setTwoFA(true);
    if (id === 2) setHasPasskey(true);
    if (id === 3) setStrongPassword(true);
    if (id === 5) setLoginAlerts(true);
  };

  return (
    <div className="max-w-[90%]">
      <div className="mb-7">
        <h3 className="text-2xl font-semibold text-gray-800">Privacy & Security</h3>
        <p className="text-sm text-gray-400 mt-1">Manage your security settings, authentication, and privacy preferences</p>
      </div>

      <PrivacyCheckup score={score} steps={steps} onComplete={handleComplete} />

      <SectionCard title="Authentication">
        <ChangePassword onStrong={setStrongPassword} />
        <Passkeys onAdd={setHasPasskey} />
      </SectionCard>

      <SectionCard title="Two-Factor Authentication">
        <TwoFactor onChange={setTwoFA} />
      </SectionCard>

      <SectionCard title="Data Encryption">
        <DataEncryption onChange={setEncryption} />
      </SectionCard>

      <SectionCard title="Login Alerts">
        <LoginAlerts onChange={setLoginAlerts} />
      </SectionCard>

      <ActivityLog />
    </div>
  );
}
