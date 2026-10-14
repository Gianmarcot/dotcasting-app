import { useEffect, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "dc-casting-details-panel-open";
const WIDE_QUERY = "(min-width: 1280px)";

const readStored = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "0";
  } catch {
    return true;
  }
};

/**
 * Pannello laterale retrattile (desktop). ≥1280px affianca il contenuto,
 * sotto si sovrappone e parte chiuso. Nascosto su telefono.
 */
export const CastingSidePanel = ({ children }: { children: ReactNode }) => {
  const [wide, setWide] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(WIDE_QUERY).matches : true,
  );
  const [open, setOpen] = useState(() => (wide ? readStored() : false));

  useEffect(() => {
    const mq = window.matchMedia(WIDE_QUERY);
    const onChange = () => {
      setWide(mq.matches);
      setOpen(mq.matches ? readStored() : false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (wide) {
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
    }
  };

  const docked = wide && open;

  return (
    <aside
      className={cn(
        "sticky top-16 hidden h-[calc(100dvh-4rem)] shrink-0 self-start transition-[width] duration-300 ease-out motion-reduce:transition-none md:block",
        docked ? "w-[449px]" : "w-5",
      )}
    >
      {/* Linea di separazione */}
      <div
        className={cn(
          "absolute bottom-0 left-8 top-0 w-px bg-border transition-opacity duration-300 motion-reduce:transition-none",
          docked ? "opacity-100" : "opacity-0",
        )}
      />

      <div
        className={cn(
          "absolute right-0 top-0 z-20 h-full w-[384px] overflow-y-auto bg-cream-dark p-8 transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none",
          !wide && "rounded-l-3xl shadow-xl",
          open ? "translate-x-0 opacity-100" : "pointer-events-none invisible translate-x-8 opacity-0",
        )}
        aria-hidden={!open}
      >
        {children}
      </div>

      <button
        type="button"
        onClick={toggle}
        aria-label={open ? "Chiudi dettagli" : "Apri dettagli"}
        aria-expanded={open}
        className={cn(
          "absolute top-[22px] z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white text-foreground shadow-sm transition-[right] duration-300 ease-out motion-reduce:transition-none",
          open ? "right-[396px]" : "right-0",
        )}
      >
        {open ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
      </button>
    </aside>
  );
};
