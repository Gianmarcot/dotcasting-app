import { useState } from "react";
import { PDFViewer } from "@react-pdf/renderer";
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
      <div className="flex items-center gap-4 px-4 py-2 border-b bg-white text-sm">
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
          <PDFViewer style={{ width: "100%", height: "100%", border: "none" }}>
            <TalentCardPDF card={card} />
          </PDFViewer>
        ) : (
          <div className="p-4">
            <TalentCardWeb card={card} />
          </div>
        )}
      </div>
    </div>
  );
}
