import { useState } from "react";
import { BlobProvider } from "@react-pdf/renderer";
import { TalentCardPDF } from "@/lib/casting/TalentCardPDF";
import { TalentCardWeb } from "@/lib/casting/TalentCardWeb";
import {
  resolveCard,
  PRESET_ESSENZIALE,
  PRESET_COMPLETO,
} from "@/lib/casting/roundPreset";
import { MOCK_TALENT } from "./mockTalent";

export default function CardPreview() {
  const [presetKey, setPresetKey] = useState<"essenziale" | "completo">("completo");
  const [mode, setMode] = useState<"pdf" | "web">("pdf");

  const preset = presetKey === "completo" ? PRESET_COMPLETO : PRESET_ESSENZIALE;
  const card = resolveCard(MOCK_TALENT, preset);

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
      </div>
      <div className="flex-1 overflow-auto">
        {mode === "pdf" ? (
          <BlobProvider document={<TalentCardPDF card={card} />}>
            {({ url, loading, error }) => {
              if (error) {
                return (
                  <div className="p-4 text-sm text-red-600">
                    Errore generazione PDF: {String(error)}
                  </div>
                );
              }
              if (loading || !url) {
                return <div className="p-4 text-sm">Generazione PDF…</div>;
              }
              return (
                <div className="flex flex-col h-full">
                  <div className="px-4 py-2 border-b bg-white text-sm flex gap-3">
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="underline text-blue-600"
                    >
                      Apri in nuova scheda
                    </a>
                    <a
                      href={url}
                      download="talent-card.pdf"
                      className="underline text-blue-600"
                    >
                      Scarica
                    </a>
                  </div>
                  <iframe
                    src={url}
                    className="flex-1 w-full border-0"
                    title="PDF preview"
                  />
                </div>
              );
            }}
          </BlobProvider>
        ) : (
          <div className="p-4">
            <TalentCardWeb card={card} />
          </div>
        )}
      </div>
    </div>
  );
}
