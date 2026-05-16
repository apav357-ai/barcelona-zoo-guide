import { Moon, Sun } from "lucide-react";
import ZooMap from "@/components/ZooMap";
import { useTheme } from "@/hooks/use-theme";

const Index = () => {
  const { theme, toggle } = useTheme();

  return (
    <div
      className="w-screen flex flex-col bg-background text-foreground"
      style={{
        height: "100dvh",
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-3 py-1 bg-background text-foreground border-b border-border">
        <div className="w-9" />
        <h1 className="text-sm font-bold tracking-tight">🦁 Barcelona Zoo Guide</h1>
        <button
          type="button"
          onClick={toggle}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-accent active:bg-accent/80 transition-colors"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </header>

      {/* Map fills remaining space */}
      <main className="flex-1 relative min-h-0">
        <ZooMap />
      </main>
    </div>
  );
};

export default Index;
