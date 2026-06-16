import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Check, ChevronLeft, ChevronRight, Download, ImageOff, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { mapRowToTalent, type SharedRpcTalentRow } from "./_TalentTile";

interface Props {
  row: SharedRpcTalentRow | null;
  token: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selected: boolean;
  /** quando true, mostra il toggle conferma locale */
  canToggleSelection: boolean;
  onToggleSelection: () => void;
}

export default function TalentDetailSheet({
  row,
  token,
  open,
  onOpenChange,
  selected,
  canToggleSelection,
  onToggleSelection,
}: Props) {
  const talent = row ? mapRowToTalent(row) : null;
  const photos = talent?.photos ?? [];
  const [photoIdx, setPhotoIdx] = useState(0);

  const dl = useMutation({
    mutationFn: async () => {
      if (!row) throw new Error("no_row");
      const { data, error } = await supabase.functions.invoke("get-round-pdf-url", {
        body: { token, roleTalentId: row.role_talent_id },
      });
      if (error || !data?.url) throw new Error("Download non disponibile");
      return data.url as string;
    },
    onSuccess: (url) => window.open(url, "_blank", "noopener"),
    onError: () => toast.error("Download non disponibile"),
  });

  // reset photo index when opening a different talent
  if (row && photoIdx >= Math.max(photos.length, 1)) {
    setTimeout(() => setPhotoIdx(0), 0);
  }

  const attrs: Array<{ label: string; value: string | number | null }> = talent
    ? [
        { label: "Età", value: talent.eta },
        { label: "Genere", value: talent.genere },
        { label: "Città", value: talent.citta },
        { label: "Nazionalità", value: talent.nazionalita },
        { label: "Altezza", value: talent.altezza_cm ? `${talent.altezza_cm} cm` : null },
        { label: "Peso", value: talent.peso_kg ? `${talent.peso_kg} kg` : null },
        { label: "Occhi", value: talent.occhi },
        { label: "Capelli", value: talent.capelli },
        { label: "Taglia maglia", value: talent.taglia_maglia },
        { label: "Taglia pantaloni", value: talent.taglia_pantaloni },
        { label: "Scarpe", value: talent.numero_scarpe },
        { label: "Lingue", value: talent.lingue?.join(", ") ?? null },
        { label: "Abilità", value: talent.abilita?.join(", ") ?? null },
        { label: "Patenti", value: talent.patenti?.join(", ") ?? null },
      ]
    : [];

  const visible = attrs.filter((a) => a.value !== null && a.value !== undefined && a.value !== "");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl p-0 bg-[#F5F0E8] border-l border-black/10 overflow-y-auto"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>{talent?.nome ?? "Talent"}</SheetTitle>
        </SheetHeader>

        {/* close button (custom posizione) */}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white"
          aria-label="Chiudi"
        >
          <X className="h-4 w-4" />
        </button>

        {talent && (
          <div className="pb-32">
            {/* photo carousel */}
            <div className="relative aspect-[5/7] bg-[#EFE7DA] overflow-hidden">
              {photos.length > 0 ? (
                <img
                  src={photos[photoIdx]}
                  alt={talent.nome}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#999]">
                  <ImageOff className="h-8 w-8" />
                </div>
              )}

              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setPhotoIdx((i) => (i - 1 + photos.length) % photos.length)}
                    className="absolute top-1/2 -translate-y-1/2 left-2 w-9 h-9 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white"
                    aria-label="Foto precedente"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoIdx((i) => (i + 1) % photos.length)}
                    className="absolute top-1/2 -translate-y-1/2 right-2 w-9 h-9 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white"
                    aria-label="Foto successiva"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                    {photos.map((_, i) => (
                      <span
                        key={i}
                        className={`h-1.5 rounded-full transition-all ${
                          i === photoIdx ? "w-5 bg-white" : "w-1.5 bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* identity block */}
            <div className="px-5 pt-6">
              <h2 className="font-tenor uppercase tracking-widest text-2xl text-[#1A1A1A] leading-tight">
                {talent.nome}
              </h2>
              {talent.citta && (
                <p className="font-dm text-sm text-[#666] mt-1">{talent.citta}</p>
              )}
            </div>

            {/* attributes */}
            <div className="px-5 pt-6">
              <dl className="grid grid-cols-2 gap-y-4 gap-x-4 bg-white rounded-sm p-5 border border-black/5">
                {visible.length === 0 && (
                  <p className="col-span-2 text-sm text-[#666] font-dm">
                    Nessun dato disponibile.
                  </p>
                )}
                {visible.map((a) => (
                  <div key={a.label}>
                    <dt className="text-[10px] uppercase tracking-widest text-[#999] mb-0.5">
                      {a.label}
                    </dt>
                    <dd className="font-dm text-sm font-medium text-[#1A1A1A]">{a.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* PDF */}
            {row?.pdf_path && (
              <div className="px-5 pt-4">
                <button
                  type="button"
                  onClick={() => dl.mutate()}
                  disabled={dl.isPending}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-black/10 text-[#1A1A1A] font-dm text-sm hover:bg-black/5 transition-colors disabled:opacity-50"
                >
                  {dl.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Scarica scheda PDF
                </button>
              </div>
            )}

            {/* sticky toggle conferma */}
            {canToggleSelection && (
              <div className="fixed bottom-0 right-0 w-full sm:max-w-xl bg-white/95 backdrop-blur-md border-t border-black/10 px-5 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <Button
                  onClick={onToggleSelection}
                  className={`w-full rounded-full font-bold uppercase tracking-widest text-xs py-6 h-auto ${
                    selected
                      ? "bg-white text-[#A30A2B] border-2 border-[#A30A2B] hover:bg-[#A30A2B]/5"
                      : "bg-[#A30A2B] text-white hover:bg-[#850822]"
                  }`}
                >
                  {selected ? (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Rimuovi dalla selezione
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Conferma questo talent
                    </>
                  )}
                </Button>
                <p className="text-[10px] text-center text-[#999] mt-2 uppercase tracking-widest">
                  Conferma definitiva con la password
                </p>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
