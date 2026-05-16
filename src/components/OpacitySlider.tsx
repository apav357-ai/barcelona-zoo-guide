import { Eye } from "lucide-react";

interface Props {
  opacity: number;
  onChange: (v: number) => void;
}

const OpacitySlider = ({ opacity, onChange }: Props) => (
  <div
    className="absolute z-[1000] flex items-center gap-2 rounded-xl border border-border/50 bg-background/80 px-3 py-2 shadow-lg backdrop-blur-xl"
    style={{
      bottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)",
      left: "1rem",
      maxWidth: "calc(100vw - 2rem)",
    }}
  >
    <Eye size={16} className="shrink-0 text-muted-foreground" />
    <input
      type="range"
      min={0}
      max={1}
      step={0.05}
      value={opacity}
      onChange={(e) => onChange(Number(e.target.value))}
      className="h-1.5 w-24 cursor-pointer appearance-none rounded-full bg-muted accent-primary sm:w-32"
      style={{ touchAction: "none" }}
    />
    <span className="min-w-[2.5ch] text-xs font-medium text-muted-foreground">
      {Math.round(opacity * 100)}%
    </span>
  </div>
);

export default OpacitySlider;
