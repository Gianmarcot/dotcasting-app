import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "dc-casting-details-panel-open";
const WIDE_QUERY = "(min-width: 1280px)";

/** Gioco tra il contenuto della pagina e la linea di separazione. */
const GAP = 32;
/** Larghezza del drawer, misurata dalla linea in poi. */
const PANEL = 384;
/** Il testo non si allarga oltre, anche su finestre molto larghe. */
const CONTENT = 352;

/**
 * Distanza tra il bordo destro dell'area admin (max 1600px, riempimento incluso)
 * e il bordo destro della finestra: il drawer la attraversa per stare a bordo.
 */
const PANEL_EXTRA =
  "calc(" + GAP + "px + max(0px, (100vw - var(--owner-sidebar-w) - 1600px) / 2))";

const readStored = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "0";
  } catch {
    return true;
  }
};

/**
 * Pannello laterale retrattile (desktop): la linea è il bordo sinistro del
 * drawer, che tocca il bordo superiore, inferiore e destro della finestra.
 * ≥1280px affianca il contenuto, sotto si sovrappone e parte chiuso.
 * Nascosto su telefono, dove i dettagli stanno in pagina.
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
      style={{ "--panel-extra": PANEL_EXTRA } as CSSProperties}
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 self-start transition-[width] duration-300 ease-out motion-reduce:transition-none md:block",
        docked ? "w-[416px]" : "w-5",
      )}
    >
      {/* Linea di separazione: coincide con il bordo sinistro del drawer */}
      <div
        className={cn(
          "absolute bottom-0 left-8 top-0 w-px bg-border transition-opacity duration-300 motion-reduce:transition-none",
          docked ? "opacity-100" : "opacity-0",
        )}
      />

      <div
        style={{
          right: "calc(-1 * var(--panel-extra))",
          width: "calc(" + PANEL + "px + var(--panel-extra))",
        }}
        className={cn(
          "absolute top-0 z-20 h-full overflow-y-auto bg-cream-dark p-8 transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none",
          !wide && "rounded-l-3xl shadow-xl",
          open ? "translate-x-0 opacity-100" : "pointer-events-none invisible translate-x-8 opacity-0",
        )}
        aria-hidden={!open}
      >
        <div className="h-full" style={{ maxWidth: CONTENT }}>
          {children}
        </div>
      </div>

      <button
        type="button"
        onClick={toggle}
        aria-label={open ? "Chiudi dettagli" : "Apri dettagli"}
        aria-expanded={open}
        className={cn(
          "absolute top-[22px] z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white text-foreground shadow-sm transition-[right] duration-300 ease-out motion-reduce:transition-none",
          open ? "right-[364px]" : "right-0",
        )}
      >
        {open ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
      </button>
    </aside>
  );
};
