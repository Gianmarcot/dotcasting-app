import { useEffect, useRef, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import * as pdfjsLib from "pdfjs-dist";
// @ts-expect-error - vite ?url import
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { TalentCardPDF } from "@/lib/casting/TalentCardPDF";
import { TalentCardWeb } from "@/lib/casting/TalentCardWeb";
import {
  resolveCard,
  PRESET_ESSENZIALE,
  PRESET_COMPLETO,
} from "@/lib/casting/roundPreset";
import { MOCK_TALENT } from "./mockTalent";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc as string;

export default function CardPreview() {
  const [presetKey, setPresetKey] = useState<"essenziale" | "completo">("completo");
  const [mode, setMode] = useState<"pdf" | "web">("pdf");
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [pages, setPages] = useState<string[]>([]); // dataURLs
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const preset = presetKey === "completo" ? PRESET_COMPLETO : PRESET_ESSENZIALE;
  const card = resolveCard(MOCK_TALENT, preset);

  useEffect(() => {
    if (mode !== "pdf") return;
    let cancelled = false;
    let createdUrl: string | null = null;

    (async () => {
      setLoading(true);
      setError(null);
      try {
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
  }, [presetKey, mode, reloadKey]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // HMR: ricarica quando i moduli del PDF cambiano
  useEffect(() => {
    if (import.meta.hot) {
      const bump = () => setReloadKey((k) => k + 1);
      import.meta.hot.accept(
        [
          "@/lib/casting/TalentCardPDF",
          "@/lib/casting/TalentCardWeb",
          "@/lib/casting/roundPreset",
          "@/lib/casting/talentFields",
          "./mockTalent",
        ],
        bump,
      );
    }
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
              className="px-3 py-1 rounded bg-neutral-200 hover:bg-neutral-300"
            >
              Ricarica PDF
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
              {loading
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
            <TalentCardWeb card={card} />
          </div>
        )}
      </div>
    </div>
  );
}
