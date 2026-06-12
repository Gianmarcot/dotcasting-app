import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import * as pdfjsLib from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import type { ComponentType } from "react";
import type { ResolvedCard } from "@/lib/casting/roundPreset";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc as string;

const CORRIE_PROFILE_ID = "4dca73b4-deab-436e-b408-2c190c0f34d4";

type TalentSource = "mock" | "corrie";

const loadCardModules = async (source: TalentSource) => {
  const [{ TalentCardPDF }, { resolveCard, PRESET_ESSENZIALE, PRESET_COMPLETO }, { MOCK_TALENT }, { fetchTalentByProfileId }] =
    await Promise.all([
      import("@/lib/casting/TalentCardPDF"),
      import("@/lib/casting/roundPreset"),
      import("./mockTalent"),
      import("@/lib/casting/fetchRoundTalents"),
    ]);

  let talent = MOCK_TALENT;
  if (source === "corrie") {
    const real = await fetchTalentByProfileId(CORRIE_PROFILE_ID);
    if (!real) throw new Error("Talent Corrie non trovato nel database");
    talent = real;
  }

  return { TalentCardPDF, resolveCard, PRESET_ESSENZIALE, PRESET_COMPLETO, talent };
};

const createWebComponent = () =>
  lazy(async () => {
    const mod = await import("@/lib/casting/TalentCardWeb");
    return { default: mod.TalentCardWeb };
  });

export default function CardPreview() {
  const [presetKey, setPresetKey] = useState<"essenziale" | "completo">("completo");
  const [mode, setMode] = useState<"pdf" | "web">("pdf");
  const [source, setSource] = useState<TalentSource>("mock");
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [pages, setPages] = useState<string[]>([]); // dataURLs
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [hmrFlash, setHmrFlash] = useState(false);
  const [webCard, setWebCard] = useState<ResolvedCard | null>(null);
  const [WebComponent, setWebComponent] = useState<ComponentType<{ card: ResolvedCard }> | null>(() =>
    createWebComponent(),
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode !== "pdf") return;
    let cancelled = false;
    let createdUrl: string | null = null;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { TalentCardPDF, resolveCard, PRESET_ESSENZIALE, PRESET_COMPLETO, talent } =
          await loadCardModules(source);
        const preset = presetKey === "completo" ? PRESET_COMPLETO : PRESET_ESSENZIALE;
        const card = resolveCard(talent, preset);
        const blob = await pdf(<TalentCardPDF card={card} />).toBlob();
        if (cancelled) return;
        createdUrl = URL.createObjectURL(blob);
        setBlobUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return createdUrl;
        });

        const arrayBuffer = await blob.arrayBuffer();
        const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const rendered: string[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d")!;
          await page.render({ canvasContext: ctx, viewport, canvas }).promise;
          rendered.push(canvas.toDataURL("image/png"));
          if (cancelled) return;
        }
        if (!cancelled) {
          setPages(rendered);
          setLastUpdate(new Date());
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetKey, mode, reloadKey, source]);

  useEffect(() => {
    if (mode !== "web") return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { resolveCard, PRESET_ESSENZIALE, PRESET_COMPLETO, talent } = await loadCardModules(source);
        const preset = presetKey === "completo" ? PRESET_COMPLETO : PRESET_ESSENZIALE;
        const card = resolveCard(talent, preset);
        if (!cancelled) {
          setWebCard(card);
          setWebComponent(() => createWebComponent());
          setLastUpdate(new Date());
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [presetKey, mode, reloadKey]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // HMR: ricarica quando i moduli della card cambiano senza trattenere binding statici obsoleti
  useEffect(() => {
    if (!import.meta.hot) return;

    const watched = [
      "/src/lib/casting/TalentCardPDF.tsx",
      "/src/lib/casting/TalentCardWeb.tsx",
      "/src/lib/casting/roundPreset.ts",
      "/src/lib/casting/talentFields.ts",
      "/src/dev/mockTalent.ts",
    ];

    const onUpdate = (payload: { updates?: Array<{ path?: string; acceptedPath?: string }> }) => {
      const shouldReload = payload.updates?.some((update) =>
        watched.some((path) => update.path?.endsWith(path) || update.acceptedPath?.endsWith(path)),
      );
      if (!shouldReload) return;

      setReloadKey((k) => k + 1);
      setHmrFlash(true);
      window.setTimeout(() => setHmrFlash(false), 1200);
    };

    import.meta.hot.on("vite:afterUpdate", onUpdate);

    return () => {
      import.meta.hot?.off("vite:afterUpdate", onUpdate);
    };
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col bg-neutral-100">
      <div className="flex items-center gap-4 px-4 py-2 border-b bg-white text-sm flex-wrap">
        <strong>Card Preview (dev)</strong>
        <div className="flex items-center gap-2">
          <span>Preset:</span>
          <button
            onClick={() => setPresetKey("essenziale")}
            className={`px-3 py-1 rounded ${presetKey === "essenziale" ? "bg-black text-white" : "bg-neutral-200"}`}
          >
            Essenziale
          </button>
          <button
            onClick={() => setPresetKey("completo")}
            className={`px-3 py-1 rounded ${presetKey === "completo" ? "bg-black text-white" : "bg-neutral-200"}`}
          >
            Completo
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span>Render:</span>
          <button
            onClick={() => setMode("pdf")}
            className={`px-3 py-1 rounded ${mode === "pdf" ? "bg-black text-white" : "bg-neutral-200"}`}
          >
            PDF
          </button>
          <button
            onClick={() => setMode("web")}
            className={`px-3 py-1 rounded ${mode === "web" ? "bg-black text-white" : "bg-neutral-200"}`}
          >
            Web
          </button>
        </div>
        {mode === "pdf" && (
          <>
            <button
              onClick={() => setReloadKey((k) => k + 1)}
              disabled={loading}
              className="px-3 py-1 rounded bg-neutral-200 hover:bg-neutral-300"
            >
              {loading ? "Rigenerazione…" : "Ricarica PDF"}
            </button>
            {blobUrl && (
              <>
                <a
                  href={blobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline text-blue-600"
                >
                  Apri in nuova scheda
                </a>
                <a
                  href={blobUrl}
                  download="talent-card.pdf"
                  className="underline text-blue-600"
                >
                  Scarica
                </a>
              </>
            )}
            <span className="text-neutral-500 ml-auto">
              {hmrFlash
                ? "Aggiornato da HMR"
                : loading
                ? "Generazione…"
                : lastUpdate
                  ? `Ultimo aggiornamento: ${lastUpdate.toLocaleTimeString()}`
                  : ""}
            </span>
          </>
        )}
      </div>
      <div ref={containerRef} className="flex-1 overflow-auto">
        {mode === "pdf" ? (
          <div className="flex flex-col items-center gap-4 py-6">
            {error && (
              <div className="p-4 text-sm text-red-600">
                Errore generazione PDF: {error}
              </div>
            )}
            {!error && pages.length === 0 && loading && (
              <div className="p-4 text-sm">Generazione PDF…</div>
            )}
            {pages.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`Pagina ${i + 1}`}
                className="shadow-lg bg-white max-w-full h-auto"
              />
            ))}
          </div>
        ) : (
          <div className="p-4">
            {error && <div className="p-4 text-sm text-red-600">Errore preview web: {error}</div>}
            {!error && (!WebComponent || !webCard || loading) && (
              <div className="p-4 text-sm">Generazione preview web…</div>
            )}
            {!error && WebComponent && webCard && !loading && (
              <Suspense fallback={<div className="p-4 text-sm">Generazione preview web…</div>}>
                <WebComponent card={webCard} />
              </Suspense>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
