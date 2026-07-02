import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { ANIMALS, type Animal, type Language, getAnimalName } from "@/data/animals";
import { THEMES, type UITheme } from "./ZooMap";

interface Props {
  onSelect: (animal: Animal) => void;
  language: Language;
  uiTheme: UITheme;
}

const PLACEHOLDERS: Record<Language, string> = {
  en: "Search animals...",
  ua: "Пошук тварин...",
  de: "Tiere suchen...",
  es: "Buscar animales...",
  pl: "Szukaj zwierząt...",
};

const AnimalSearch = ({ onSelect, language, uiTheme }: Props) => {
  const theme = THEMES[uiTheme];
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const expanded = focused || query.length > 0;

  // Search across all language name fields + scientific name + id
  const filtered = query.trim()
    ? ANIMALS.filter((a) => {
        const q = query.toLowerCase();
        return (
          a.name.toLowerCase().includes(q) ||
          a.nameUa.toLowerCase().includes(q) ||
          a.nameDe.toLowerCase().includes(q) ||
          a.nameEs.toLowerCase().includes(q) ||
          a.namePl.toLowerCase().includes(q) ||
          String(a.id).padStart(2, "0").includes(q)
        );
      }).slice(0, 12)
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative mr-auto"
      style={{
        width: expanded ? "min(75vw, 320px)" : 38,
        transition: "width 280ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div
        className={`flex items-center rounded-full border shadow-md backdrop-blur-xl overflow-hidden ${theme.panel}`}
        style={{ height: 38 }}
      >
        <button
          type="button"
          onClick={() => {
            setFocused(true);
            setOpen(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className="shrink-0 flex items-center justify-center opacity-70"
          style={{ width: 38, height: 38 }}
        >
          <Search size={16} />
        </button>

        <input
          ref={inputRef}
          type="text"
          placeholder={PLACEHOLDERS[language]}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => { setFocused(true); setOpen(true); }}
          className="flex-1 min-w-0 bg-transparent pr-2 text-sm outline-none placeholder:text-current placeholder:opacity-50"
          style={{
            height: 38,
            opacity: expanded ? 1 : 0,
            pointerEvents: expanded ? "auto" : "none",
            transition: "opacity 200ms ease",
          }}
        />

        {query && expanded && (
          <button
            onClick={() => { setQuery(""); inputRef.current?.focus(); }}
            className="shrink-0 rounded-full p-1 mr-2 opacity-70 transition-opacity hover:opacity-100"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {open && expanded && filtered.length > 0 && (
        <div className={`absolute left-0 top-full mt-1 w-full max-h-72 overflow-y-auto rounded-xl border shadow-xl backdrop-blur-xl z-[1200] ${theme.panel}`}>
          {filtered.map((animal) => {
            const primaryName = getAnimalName(animal, language);
            // Secondary hint: show EN name if not already primary
            const secondaryName = language !== "en" ? animal.name : animal.nameUa;
            return (
              <button
                key={animal.id}
                onClick={() => {
                  onSelect(animal);
                  setQuery("");
                  setOpen(false);
                  setFocused(false);
                  inputRef.current?.blur();
                }}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-white/10 active:bg-white/15"
                style={{ minHeight: 44 }}
              >
                <span className="text-lg">{animal.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{primaryName}</p>
                  <p className="truncate text-xs opacity-60">{secondaryName}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AnimalSearch;