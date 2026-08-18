// =============================================================
// TalentPdfWizard.tsx — Wizard di download PDF della scheda talent.
// Non reimplementa nulla: costruisce un RoundPreset (campi + numero
// foto) e lo passa a resolveCard + TalentCardPDF, gli stessi usati
// dalla generazione dei round.
// =============================================================

import { useEffect, useMemo, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { Buffer } from "buffer";
import { Download, Loader2 } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { FIELD_REGISTRY, GROUP_LABELS, type FieldGroup, type Talent } from "@/lib/casting/talentFields";
import { resolveCard, type RoundPreset } from "@/lib/casting/roundPreset";
import { TalentCardPDF } from "@/lib/casting/TalentCardPDF";
import { fetchTalentByProfileId } from "@/lib/casting/fetchRoundTalents";
import { fetchAppSettings } from "@/hooks/useAppSettings";

if (!(globalThis as { Buffer?: unknown }).Buffer) {
  (globalThis as { Buffer?: unknown }).Buffer = Buffer;
}

interface TalentPdfWizardProps {
  profileId: string | null;
  talentName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GROUP_ORDER: FieldGroup[] = ["anagrafica", "fisico", "misure", "competenze", "contatti"];

export const TalentPdfWizard = ({
  profileId,
  talentName,
  open,
  onOpenChange,
}: TalentPdfWizardProps) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [talent, setTalent] = useState<Talent | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [fields, setFields] = useState<string[]>(() => FIELD_REGISTRY.map((f) => f.key));
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    if (!open || !profileId) return;
    setStep(1);
    setFields(FIELD_REGISTRY.map((f) => f.key));
    setLoading(true);
    fetchTalentByProfileId(profileId)
      .then((t) => {
        setTalent(t);
        setPhotos(t?.photos ?? []);
      })
      .catch(() => toast({ title: "Impossibile caricare i dati del talent", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [open, profileId]);

  const groups = useMemo(
    () =>
      GROUP_ORDER.map((g) => ({
        group: g,
        label: GROUP_LABELS[g],
        items: FIELD_REGISTRY.filter((f) => f.group === g),
      })).filter((g) => g.items.length > 0),
    []
  );

  const toggleField = (key: string) =>
    setFields((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  const toggleGroup = (keys: string[], on: boolean) =>
    setFields((prev) => (on ? Array.from(new Set([...prev, ...keys])) : prev.filter((k) => !keys.includes(k))));

  const togglePhoto = (url: string) =>
    setPhotos((prev) => (prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]));

  const generate = async () => {
    if (!talent) return;
    setGenerating(true);
    try {
      const branding = await fetchAppSettings().catch(() => null);
      const ordered = (talent.photos ?? []).filter((u) => photos.includes(u));
      const preset: RoundPreset = {
        fields,
        // le prime 2 foto sono le cover di pagina 1: il resto è galleria
        photoCount: Math.max(0, ordered.length - 2),
        showAgencyContact: true,
      };
      const card = resolveCard({ ...talent, photos: ordered }, preset, {
        agencyName: branding?.agency_name ?? null,
        agencyLogoUrl: branding?.agency_logo_url ?? null,
        agencyContactEmail: branding?.contact_email ?? null,
      });
      const blob = await pdf(<TalentCardPDF card={card} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${(talentName || "talent").replace(/[^\w\s-]/g, "").trim() || "talent"}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      onOpenChange(false);
    } catch (e) {
      toast({ title: "Generazione PDF non riuscita", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="z-[100]" />
        <DialogPrimitive.Content className="dc-dialog z-[110] max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Scarica PDF</DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Scegli quali dati includere nella scheda."
              : "Scegli quali foto includere nella scheda."}
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && step === 1 && (
          <div className="space-y-6">
            {groups.map((g) => {
              const keys = g.items.map((i) => i.key);
              const allOn = keys.every((k) => fields.includes(k));
              return (
                <div key={g.group} className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Checkbox checked={allOn} onCheckedChange={(c) => toggleGroup(keys, !!c)} />
                    {g.label}
                  </label>
                  <div className="grid grid-cols-2 gap-2 pl-6 sm:grid-cols-3">
                    {g.items.map((f) => (
                      <label key={f.key} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Checkbox
                          checked={fields.includes(f.key)}
                          onCheckedChange={() => toggleField(f.key)}
                        />
                        {f.label}
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && step === 2 && (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {(talent?.photos ?? []).map((url) => {
              const selected = photos.includes(url);
              return (
                <button
                  type="button"
                  key={url}
                  onClick={() => togglePhoto(url)}
                  className={`relative aspect-[2/3] overflow-hidden rounded-2xl border-2 transition-colors ${
                    selected ? "border-primary" : "border-transparent"
                  }`}
                  aria-pressed={selected}
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <span className="absolute left-2 top-2">
                    <Checkbox checked={selected} className="bg-background" />
                  </span>
                </button>
              );
            })}
            {(talent?.photos ?? []).length === 0 && (
              <p className="col-span-full text-sm text-muted-foreground">
                Nessuna foto disponibile per questo talent.
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          {step === 2 && (
            <Button variant="secondary" onClick={() => setStep(1)} disabled={generating}>
              Indietro
            </Button>
          )}
          {step === 1 ? (
            <Button onClick={() => setStep(2)} disabled={loading || !talent}>
              Avanti
            </Button>
          ) : (
            <Button onClick={generate} disabled={generating || !talent}>
              {generating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generazione…
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  Genera PDF
                </>
              )}
            </Button>
          )}
        </DialogFooter>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};

export default TalentPdfWizard;
