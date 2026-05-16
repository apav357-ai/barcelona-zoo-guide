import { useState } from "react";
import {
  Settings,
  RotateCw,
  Maximize,
  Eye,
  ClipboardList,
  Lock,
  Unlock,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Import,
  Layers,
  Plus,
  Minus,
  Globe, // Додали іконку глобуса для мови
} from "lucide-react";

const NUDGE_STEP = 0.00005;

export type TileLayerType = "osm" | "google-road" | "google-sat";

// Створюємо тип для мов
export type Language = "ua" | "en";

interface Props {
  rotation: number;
  scale: number;
  opacity: number;
  locked: boolean;
  tileLayer: TileLayerType;
  // Додали нові пропси для мови
  language: Language;
  onLanguageChange: (lang: Language) => void;
  // ... інші пропси
  onRotationChange: (deg: number) => void;
  onScaleChange: (s: number) => void;
  onOpacityChange: (o: number) => void;
  onLockChange: (on: boolean) => void;
  onNudge: (dLat: number, dLng: number) => void;
  onLogCalibration: () => void;
  onImportConfig: (json: string) => void;
  onTileLayerChange: (layer: TileLayerType) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

// Словник перекладів для цього компонента
const TRANSLATIONS = {
  ua: {
    layer: "Шар карти",
    nudge: "Мікро-зсув",
    rotation: "Поворот",
    scale: "Масштаб",
    opacity: "Прозорість",
    saveCalib: "Зберегти калібрування",
    importConfig: "Імпорт конфігурації",
    pasteJson: "Вставте JSON калібрування...",
    apply: "Застосувати",
    activeMap: "Карта активна — зображення зафіксовано",
    frozenMap: "Карта заморожена — перетягніть зображення",
    tiles: {
      osm: "OpenStreetMap",
      "google-road": "Google Roadmap",
      "google-sat": "Google Satellite",
    }
  },
  en: {
    layer: "Map Layer",
    nudge: "Micro-nudge",
    rotation: "Rotation",
    scale: "Scale",
    opacity: "Opacity",
    saveCalib: "Save Calibration",
    importConfig: "Import Config",
    pasteJson: "Paste calibration JSON...",
    apply: "Apply",
    activeMap: "Map is active — image locked",
    frozenMap: "Map is frozen — drag image to move",
    tiles: {
      osm: "OpenStreetMap",
      "google-road": "Google Roadmap",
      "google-sat": "Google Satellite",
    }
  }
};

const MapControls = ({
  rotation,
  scale,
  opacity,
  locked,
  tileLayer,
  language, // Отримуємо поточну мову
  onLanguageChange, // Функція для зміни мови
  onRotationChange,
  onScaleChange,
  onOpacityChange,
  onLockChange,
  onNudge,
  onLogCalibration,
  onImportConfig,
  onTileLayerChange,
  onZoomIn,
  onZoomOut,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [showImport, setShowImport] = useState(false);

  // t - це наш поточний словник залежно від обраної мови
  const t = TRANSLATIONS[language];

  const fs = { fontSize: "clamp(0.875rem, 2vw, 1rem)" } as const;
  const fsSm = { fontSize: "clamp(0.75rem, 1.8vw, 0.875rem)" } as const;

  const nudgeBtn =
    "flex items-center justify-center rounded-lg bg-muted text-muted-foreground transition-transform active:scale-90 disabled:opacity-30";

  return (
    <div className="absolute inset-0 z-[9999] pointer-events-none">
      
      {/* 🌍 КНОПКА ЗМІНИ МОВИ — у верхньому правому куті */}
      <div className="fixed top-4 right-4 pointer-events-auto">
        <button
          onClick={() => onLanguageChange(language === "ua" ? "en" : "ua")}
          className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-md border border-gray-200 text-gray-700 font-bold transition-transform active:scale-90 uppercase"
        >
          <Globe size={18} className="text-primary" />
          {language}
        </button>
      </div>

      {/* ✅ ZOOM КНОПКИ — внизу по центру */}
      <div
        className="fixed pointer-events-auto flex flex-row gap-4"
        style={{
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 80px)",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <button
          onClick={onZoomOut}
          className="flex h-[64px] w-[64px] items-center justify-center rounded-full bg-white shadow-2xl border border-gray-200 text-gray-700 transition-transform active:scale-90"
          style={{ fontSize: 32 }}
        >
          <Minus size={30} strokeWidth={2.5} />
        </button>

        <button
          onClick={onZoomIn}
          className="flex h-[64px] w-[64px] items-center justify-center rounded-full bg-white shadow-2xl border border-gray-200 text-gray-700 transition-transform active:scale-90"
          style={{ fontSize: 32 }}
        >
          <Plus size={30} strokeWidth={2.5} />
        </button>
      </div>

      {/* 1. КРУГЛІ КНОПКИ У КУТКУ */}
      <div className="fixed bottom-10 right-6 flex flex-col gap-4 pointer-events-auto">
        <button
          onClick={() => onLockChange(!locked)}
          className={`flex h-[60px] w-[60px] items-center justify-center rounded-full shadow-2xl border transition-transform active:scale-90 ${
            locked
              ? "bg-white text-destructive border-red-100"
              : "bg-primary text-primary-foreground border-primary"
          }`}
        >
          {locked ? <Lock size={28} /> : <Unlock size={28} />}
        </button>

        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-white shadow-2xl border border-gray-100 text-primary transition-transform active:scale-90"
        >
          <Settings size={28} />
        </button>
      </div>

      {/* 2. МЕНЮ НАЛАШТУВАНЬ */}
      {open && (
        <div className="fixed bottom-[180px] right-6 w-[280px] max-w-[calc(100vw-2rem)] pointer-events-auto">
          <div
            className="space-y-3 overflow-y-auto rounded-xl border border-border bg-background/95 p-4 shadow-2xl backdrop-blur-md"
            style={{ maxHeight: "60vh" }}
          >
            {/* Layer selector */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-semibold text-foreground" style={fsSm}>
                <Layers size={14} className="text-muted-foreground" />
                {t.layer}
              </div>
              <div className="flex flex-wrap gap-1">
                {(Object.keys(t.tiles) as TileLayerType[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => onTileLayerChange(key)}
                    className={`rounded-lg px-3 py-1.5 font-medium transition-transform active:scale-95 ${
                      tileLayer === key
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                    style={{ minHeight: 48, ...fsSm }}
                  >
                    {t.tiles[key]}
                  </button>
                ))}
              </div>
            </div>

            {/* Nudge panel */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-semibold text-foreground" style={fsSm}>
                {t.nudge}
              </div>
              <div className="grid grid-cols-3 gap-1" style={{ maxWidth: 160, margin: "0 auto" }}>
                <div />
                <button
                  disabled={locked}
                  onClick={() => onNudge(NUDGE_STEP, 0)}
                  className={nudgeBtn}
                  style={{ minHeight: 48, minWidth: 48 }}
                >
                  <ArrowUp size={18} />
                </button>
                <div />
                <button
                  disabled={locked}
                  onClick={() => onNudge(0, -NUDGE_STEP)}
                  className={nudgeBtn}
                  style={{ minHeight: 48, minWidth: 48 }}
                >
                  <ArrowLeft size={18} />
                </button>
                <div />
                <button
                  disabled={locked}
                  onClick={() => onNudge(0, NUDGE_STEP)}
                  className={nudgeBtn}
                  style={{ minHeight: 48, minWidth: 48 }}
                >
                  <ArrowRight size={18} />
                </button>
                <div />
                <button
                  disabled={locked}
                  onClick={() => onNudge(-NUDGE_STEP, 0)}
                  className={nudgeBtn}
                  style={{ minHeight: 48, minWidth: 48 }}
                >
                  <ArrowDown size={18} />
                </button>
                <div />
              </div>
            </div>

            {/* Rotation */}
            <label className="block space-y-1">
              <div className="flex items-center gap-2 font-semibold text-foreground" style={fsSm}>
                <RotateCw size={14} className="text-muted-foreground" />
                {t.rotation}: {rotation.toFixed(1)}°
              </div>
              <input
                type="range"
                min={0}
                max={360}
                step={0.5}
                value={rotation}
                disabled={locked}
                onChange={(e) => onRotationChange(Number(e.target.value))}
                className="w-full accent-primary"
                style={{ minHeight: 48, touchAction: "none" }}
              />
            </label>

            {/* Scale */}
            <label className="block space-y-1">
              <div className="flex items-center gap-2 font-semibold text-foreground" style={fsSm}>
                <Maximize size={14} className="text-muted-foreground" />
                {t.scale}: {scale.toFixed(3)}x
              </div>
              <input
                type="range"
                min={0.01}
                max={2}
                step={0.005}
                value={scale}
                disabled={locked}
                onChange={(e) => onScaleChange(Number(e.target.value))}
                className="w-full accent-primary"
                style={{ minHeight: 48, touchAction: "none" }}
              />
            </label>

            {/* Opacity */}
            <label className="block space-y-1">
              <div className="flex items-center gap-2 font-semibold text-foreground" style={fsSm}>
                <Eye size={14} className="text-muted-foreground" />
                {t.opacity}: {Math.round(opacity * 100)}%
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={opacity}
                onChange={(e) => onOpacityChange(Number(e.target.value))}
                className="w-full accent-primary"
                style={{ minHeight: 48, touchAction: "none" }}
              />
            </label>

            {/* Log Calibration */}
            <button
              onClick={onLogCalibration}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground transition-transform active:scale-95"
              style={{ minHeight: 48, ...fsSm }}
            >
              <ClipboardList size={18} /> {t.saveCalib}
            </button>

            {/* Import/Export */}
            <button
              onClick={() => setShowImport((v) => !v)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border bg-background py-2.5 font-semibold text-foreground shadow-sm transition-transform active:scale-95"
              style={{ minHeight: 48, ...fsSm }}
            >
              <Import size={18} /> {t.importConfig}
            </button>

            {showImport && (
              <div className="space-y-2 pt-2 border-t">
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder={t.pasteJson}
                  className="w-full rounded-lg border border-border bg-background p-2 text-foreground"
                  style={{ minHeight: 80, ...fsSm }}
                  rows={4}
                />
                <button
                  onClick={() => {
                    if (importText.trim()) {
                      onImportConfig(importText);
                      setImportText("");
                      setShowImport(false);
                    }
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground transition-transform active:scale-95"
                  style={{ minHeight: 48, ...fsSm }}
                >
                  {t.apply}
                </button>
              </div>
            )}

            <p
              className="text-center text-muted-foreground pt-2"
              style={{ fontSize: "clamp(0.65rem, 1.5vw, 0.75rem)" }}
            >
              {locked ? t.activeMap : t.frozenMap}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapControls;