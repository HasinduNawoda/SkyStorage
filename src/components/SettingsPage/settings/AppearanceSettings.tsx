import { useState } from "react";
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
      className={`px-8 py-4 flex items-center justify-between gap-4 ${
        !last ? "border-b border-gray-100" : ""
      }`}
    >
      {children}
    </div>
  );
}

type ThemeMode = "Light" | "Dark" | "System";
type FontSize = "Small" | "Medium" | "Large";
type AccentColor = "Blue" | "Purple" | "Green" | "Orange";

const DEFAULTS = {
  themeMode: "Light" as ThemeMode,
  accentColor: "Blue" as AccentColor,
  fontSize: "Medium" as FontSize,
  zoom: 100,
};

const ACCENT_COLORS: { name: AccentColor; bg: string; ring: string; text: string }[] = [
  { name: "Blue",   bg: "bg-blue-500",    ring: "ring-blue-500",    text: "text-blue-600"    },
  { name: "Purple", bg: "bg-purple-500",  ring: "ring-purple-500",  text: "text-purple-600"  },
  { name: "Green",  bg: "bg-emerald-500", ring: "ring-emerald-500", text: "text-emerald-600" },
  { name: "Orange", bg: "bg-orange-400",  ring: "ring-orange-400",  text: "text-orange-500"  },
];

const THEME_PREVIEWS: {
  name: ThemeMode;
  topBar: string;
  sidebar: string;
  body: string;
  dots: string[];
  border: string;
}[] = [
  { name: "Light",  topBar: "bg-gray-100",  sidebar: "bg-gray-200", body: "bg-white",   dots: ["bg-red-400","bg-yellow-400","bg-green-400"], border: "border-gray-300" },
  { name: "Dark",   topBar: "bg-gray-800",  sidebar: "bg-gray-900", body: "bg-gray-700",dots: ["bg-red-400","bg-yellow-400","bg-green-400"], border: "border-gray-600" },
  { name: "System", topBar: "bg-gradient-to-r from-gray-200 to-gray-700", sidebar: "bg-gradient-to-b from-gray-200 to-gray-800", body: "bg-gradient-to-br from-white to-gray-600", dots: ["bg-red-400","bg-yellow-400","bg-green-400"], border: "border-gray-400" },
];

function ThemeAndAccentSection({
  themeMode, setThemeMode, accentColor, setAccentColor,
}: {
  themeMode: ThemeMode; setThemeMode: (v: ThemeMode) => void;
  accentColor: AccentColor; setAccentColor: (v: AccentColor) => void;
}) {
  const activeAccent = ACCENT_COLORS.find((c) => c.name === accentColor)!;

  return (
    <div id={toSectionId("Theme")} className="mb-8">
      <h2 className="text-base font-semibold text-gray-700 mb-3">Theme</h2>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

        {/* Theme Mode row */}
        <div id={toSettingId("Theme Mode")} className="px-8 py-5 border-b border-gray-100">
          <div className="flex items-end gap-5">
            {THEME_PREVIEWS.map((t) => {
              const selected = themeMode === t.name;
              return (
                <button
                  key={t.name}
                  onClick={() => setThemeMode(t.name)}
                  className="flex flex-col items-center gap-2 group focus:outline-none"
                >
                  <div className={`w-28 h-[72px] rounded-lg border-2 overflow-hidden flex flex-col transition-all duration-200 ${selected ? `${activeAccent.ring} ring-2 ring-offset-1 border-transparent` : `${t.border} group-hover:border-gray-400`}`}>
                    <div className={`flex items-center gap-1 px-2 py-1 ${t.topBar}`}>
                      {t.dots.map((d, i) => <span key={i} className={`w-1.5 h-1.5 rounded-full ${d}`} />)}
                    </div>
                    <div className="flex flex-1">
                      <div className={`w-7 ${t.sidebar}`} />
                      <div className={`flex-1 ${t.body}`} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-colors ${selected ? `border-${activeAccent.name.toLowerCase()}-500 bg-${activeAccent.name.toLowerCase()}-500` : "border-gray-300"}`}>
                      {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-xs text-gray-600 font-medium">{t.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Accent Color row */}
        <div id={toSettingId("Accent Color")} className="px-8 py-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-gray-700">Accent Color</div>
            <div className="text-xs text-gray-400 mt-0.5">Used for buttons, links and highlights</div>
          </div>
          <div className="flex items-center gap-2.5">
            {ACCENT_COLORS.map((c) => {
              const selected = accentColor === c.name;
              return (
                <button
                  key={c.name}
                  onClick={() => setAccentColor(c.name)}
                  title={c.name}
                  className={`w-7 h-7 rounded-full ${c.bg} transition-all duration-150 ${selected ? `ring-2 ring-offset-2 ${c.ring} scale-110` : "opacity-60 hover:opacity-90 hover:scale-105"}`}
                />
              );
            })}
            <span className={`text-xs font-medium ml-1 ${activeAccent.text}`}>{accentColor}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppearanceSettings() {
  const [themeMode,   setThemeMode]   = useState<ThemeMode>(DEFAULTS.themeMode);
  const [accentColor, setAccentColor] = useState<AccentColor>(DEFAULTS.accentColor);
  const [fontSize,    setFontSize]    = useState<FontSize>(DEFAULTS.fontSize);
  const [zoom,        setZoom]        = useState<number>(DEFAULTS.zoom);
  const [resetFlash,  setResetFlash]  = useState(false);

  const activeAccent = ACCENT_COLORS.find((c) => c.name === accentColor)!;

  const handleReset = () => {
    setThemeMode(DEFAULTS.themeMode);
    setAccentColor(DEFAULTS.accentColor);
    setFontSize(DEFAULTS.fontSize);
    setZoom(DEFAULTS.zoom);
    setResetFlash(true);
    setTimeout(() => setResetFlash(false), 1800);
  };

  function PillGroup<T extends string>({ options, value, onChange }: { options: T[]; value: T; onChange: (v: T) => void }) {
    return (
      <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
        {options.map((opt) => {
          const selected = value === opt;
          return (
            <button key={opt} onClick={() => onChange(opt)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${selected ? "bg-white text-gray-800 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
              {opt}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="max-w-[90%]">
      <div className="mb-7">
        <h3 className="text-2xl font-semibold text-gray-800">Appearance</h3>
        <p className="text-sm text-gray-400 mt-1">Customize how the app looks and feels</p>
      </div>

      <ThemeAndAccentSection
        themeMode={themeMode} setThemeMode={setThemeMode}
        accentColor={accentColor} setAccentColor={setAccentColor}
      />

      {/* Font Size */}
      <SectionCard title="Font Size">
        <Row id={toSettingId("Text Size")} last>
          <div>
            <div className="text-sm font-medium text-gray-700">Text Size</div>
            <div className="text-xs text-gray-400 mt-0.5">Affects all text across the interface</div>
          </div>
          <PillGroup<FontSize> options={["Small", "Medium", "Large"]} value={fontSize} onChange={setFontSize} />
        </Row>
      </SectionCard>

      {/* Zoom */}
      <SectionCard title="Zoom">
        <Row id={toSettingId("Page Zoom")} last>
          <div>
            <div className="text-sm font-medium text-gray-700">Page Zoom</div>
            <div className="text-xs text-gray-400 mt-0.5">Scale the entire interface</div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setZoom((z) => Math.max(75, z - 10))} className="w-7 h-7 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 flex items-center justify-center text-base font-medium transition-colors">−</button>
            <span className="text-sm font-semibold text-gray-700 w-10 text-center tabular-nums">{zoom}%</span>
            <button onClick={() => setZoom((z) => Math.min(150, z + 10))} className="w-7 h-7 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 flex items-center justify-center text-base font-medium transition-colors">+</button>
          </div>
        </Row>
      </SectionCard>

      {/* Reset */}
      <div id={toSectionId("Reset")} className="mb-8">
        <h2 className="text-base font-semibold text-gray-700 mb-3">Reset</h2>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div id={toSettingId("Restore Defaults")} className="px-8 py-4 flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-gray-700">Restore Defaults</div>
              <div className="text-xs text-gray-400 mt-0.5">Resets theme, accent color, font size and zoom to their default values</div>
            </div>
            <button onClick={handleReset}
              className={`text-sm px-4 py-1.5 rounded-lg border font-medium shrink-0 transition-all duration-200 ${resetFlash ? "border-green-200 text-green-600 bg-green-50" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              {resetFlash ? "Reset ✓" : "Reset to Default"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
