import { useEffect, useMemo, useRef, useState } from "react";
import { FloatingInput } from "@/components/ui/field";
import { loadComuni } from "@/lib/geo/comuni";
import { cn } from "@/lib/utils";

/* --------------------------------------------------------------------------
 * Città con suggerimenti sui comuni italiani.
 * Il campo resta scrivibile liberamente: se il testo non è tra i suggerimenti
 * viene comunque accettato (residenza all'estero, frazioni, nomi diversi) con
 * una nota informativa, mai un errore bloccante.
 * ------------------------------------------------------------------------ */

const MAX_SUGGESTIONS = 8;

let flatCache: string[] | null = null;

const loadCityList = async () => {
  if (flatCache) return flatCache;
  const byProvince = await loadComuni();
  const all = new Set<string>();
  Object.values(byProvince).forEach((list) => list.forEach((c) => all.add(c)));
  flatCache = [...all].sort((a, b) => a.localeCompare(b, "it"));
  return flatCache;
};

export const CityField = ({
  label = "Città in cui vivi",
  value,
  onChange,
  error,
  className,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  className?: string;
}) => {
  const [cities, setCities] = useState<string[] | null>(flatCache);
  const [open, setOpen] = useState(false);
  const [touched, setTouched] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Il dataset (~110KB) viene caricato solo quando l'utente inizia a scrivere.
  useEffect(() => {
    if (cities || !value) return;
    let active = true;
    void loadCityList().then((list) => {
      if (active) setCities(list);
    });
    return () => {
      active = false;
    };
  }, [cities, value]);

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [open]);

  const query = value.trim().toLowerCase();

  const suggestions = useMemo(() => {
    if (!cities || query.length < 2) return [];
    const starts: string[] = [];
    const contains: string[] = [];
    for (const city of cities) {
      const lower = city.toLowerCase();
      if (lower === query) return [];
      if (lower.startsWith(query)) starts.push(city);
      else if (lower.includes(query)) contains.push(city);
      if (starts.length >= MAX_SUGGESTIONS) break;
    }
    return [...starts, ...contains].slice(0, MAX_SUGGESTIONS);
  }, [cities, query]);

  const known = !!cities && !!query && cities.some((c) => c.toLowerCase() === query);
  const showUnknownNote = touched && !!query && !!cities && !known && !error;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <FloatingInput
        label={label}
        value={value}
        error={error}
        warning={
          showUnknownNote
            ? "Città non riconosciuta: la useremo così come l'hai scritta."
            : null
        }
        autoComplete="address-level2"
        onChange={(v) => {
          setTouched(true);
          setOpen(true);
          if (!cities) void loadCityList().then(setCities);
          onChange(v);
        }}
      />

      {open && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 max-h-64 overflow-y-auto rounded-2xl border border-[var(--field-border)] bg-[var(--field-bg)] py-2 shadow-lg"
        >
          {suggestions.map((city) => (
            <li key={city}>
              <button
                type="button"
                role="option"
                aria-selected={false}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(city);
                  setOpen(false);
                }}
                className="block w-full px-4 py-2 text-left text-base text-[var(--field-fg)] transition-colors hover:bg-muted"
              >
                {city}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CityField;
