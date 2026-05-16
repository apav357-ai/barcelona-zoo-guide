import ZooMap from "@/components/ZooMap";

const Index = () => {
  return (
    <div
      className="w-screen flex flex-col bg-background text-foreground"
      style={{
        height: "100dvh",
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      {/* Header */}
      <header className="shrink-0 flex items-center justify-center px-3 py-1 bg-background text-foreground border-b border-border">
        <h1 className="text-sm font-bold tracking-tight">🦁 Barcelona Zoo Guide</h1>
      </header>

      {/* Map fills remaining space */}
      <main className="flex-1 relative min-h-0">
        <ZooMap />
      </main>
    </div>
  );
};

export default Index;