// =============================================================
// TalentPdfWizard.tsx — Wizard di download PDF della scheda talent.
// Non reimplementa nulla: costruisce un RoundPreset (campi + foto
// + link video) e lo passa a resolveCard + TalentCardPDF, gli
// stessi usati dalla generazione dei round.
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
import { fetchPhotoAsDataUrl } from "@/lib/casting/generateRound";
import { fetchAppSettings } from "@/hooks/useAppSettings";
import { getCategoryLabel, PHOTO_CATEGORIES } from "@/lib/mediaCategories";

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

type Step = 1 | 2 | 3;

export const TalentPdfWizard = ({
  profileId,
  talentName,
  open,
  onOpenChange,
}: TalentPdfWizardProps) => {
  const [step, setStep] = useState<Step>(1);
  const [talent, setTalent] = useState<Talent | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [fields, setFields] = useState<string[]>(() => FIELD_REGISTRY.map((f) => f.key));
  const [photos, setPhotos] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);

  useEffect(() => {
    if (!open || !profileId) return;
    setStep(1);
    setFields(FIELD_REGISTRY.map((f) => f.key));
    setLoading(true);
    fetchTalentByProfileId(profileId)
      .then((t) => {
        setTalent(t);
        // Di default: le foto principali (come prima) e, se c'è un solo
        // video, quello viene proposto già selezionato.
        setPhotos(t?.photos ?? []);
        const vids = t?.videos ?? [];
        setVideos(vids.length === 1 ? [vids[0].url] : []);
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

  const allPhotos = useMemo(
    () => talent?.allPhotos ?? (talent?.photos ?? []).map((url) => ({ url, category: "main_photos", title: null, sort_order: 0 })),
    [talent]
  );

  /** Foto raggruppate per categoria, nell'ordine canonico del profilo. */
  const photoGroups = useMemo(() => {
    const order = PHOTO_CATEGORIES.map((c) => c.key as string);
    const byCategory = new Map<string, typeof allPhotos>();
    for (const p of allPhotos) {
      const list = byCategory.get(p.category) ?? [];
      list.push(p);
      byCategory.set(p.category, list);
    }
    return Array.from(byCategory.entries())
      .sort((a, b) => {
        const ia = order.indexOf(a[0]);
        const ib = order.indexOf(b[0]);
        return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
      })
      .map(([category, items]) => ({ category, label: getCategoryLabel(category), items }));
  }, [allPhotos]);

  const talentVideos = useMemo(() => talent?.videos ?? [], [talent]);

  const videoLabel = (v: { title: string | null; category: string }) =>
    v.title?.trim() || getCategoryLabel(v.category);

  const toggleField = (key: string) =>
    setFields((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  const toggleGroup = (keys: string[], on: boolean) =>
    setFields((prev) => (on ? Array.from(new Set([...prev, ...keys])) : prev.filter((k) => !keys.includes(k))));

  const togglePhoto = (url: string) =>
    setPhotos((prev) => (prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]));

  const togglePhotoGroup = (urls: string[], on: boolean) =>
    setPhotos((prev) => (on ? Array.from(new Set([...prev, ...urls])) : prev.filter((u) => !urls.includes(u))));

  const toggleVideo = (url: string) =>
    setVideos((prev) => (prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]));

  const hasVideos = talentVideos.length > 0;
  const lastStep: Step = hasVideos ? 3 : 2;

  const generate = async () => {
    if (!talent) return;
    setGenerating(true);
    try {
      const branding = await fetchAppSettings().catch(() => null);
      // Ordine di stampa = ordine del profilo, non quello dei click.
      const selectedUrls = allPhotos.map((p) => p.url).filter((u) => photos.includes(u));
      // react-pdf non accetta URL remoti senza estensione valida:
      // le foto vanno risolte in data URL (con correzione EXIF) come nei round.
      const fetched = await Promise.all(selectedUrls.map((u) => fetchPhotoAsDataUrl(u)));
      const ordered = fetched
        .map((r) => r.dataUrl)
        .filter((u): u is string => !!u);
      if (ordered.length < selectedUrls.length) {
        toast({
          title: "Alcune foto non sono state incluse",
          description: "Il PDF è stato generato con le foto disponibili.",
        });
      }
      const videoLinks = talentVideos
        .filter((v) => videos.includes(v.url))
        .map((v) => ({ label: videoLabel(v), url: v.url }));
      const preset: RoundPreset = {
        fields,
        // le prime 2 foto sono le cover di pagina 1: il resto è galleria
        photoCount: Math.max(0, ordered.length - 2),
        showAgencyContact: true,
        videoLinks,
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

  const description =
    step === 1
      ? "Scegli quali dati includere nella scheda."
      : step === 2
        ? "Seleziona quali foto vuoi inserire nel PDF."
        : "Seleziona quale link video vuoi inserire nel PDF.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="z-[100]" />
        <DialogPrimitive.Content className="dc-dialog z-[110] max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Scarica PDF</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
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
                  <label className="flex cursor-pointer items-center gap-3 text-[15px] font-medium text-foreground">
                    <Checkbox checked={allOn} onCheckedChange={(c) => toggleGroup(keys, !!c)} />
                    {g.label}
                  </label>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-6 pl-9 sm:grid-cols-3">
                    {g.items.map((f) => (
                      <label key={f.key} className="flex cursor-pointer items-center gap-3 text-[15px] text-foreground">
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
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              {photos.length === 0
                ? "Nessuna foto selezionata: il PDF conterrà solo i dati."
                : `${photos.length} foto selezionate. Le prime due sono le foto grandi della prima pagina.`}
            </p>

            {photoGroups.map((g) => {
              const urls = g.items.map((i) => i.url);
              const allOn = urls.every((u) => photos.includes(u));
              return (
                <div key={g.category} className="space-y-3">
                  <label className="flex cursor-pointer items-center gap-3 text-[15px] font-medium text-foreground">
                    <Checkbox checked={allOn} onCheckedChange={(c) => togglePhotoGroup(urls, !!c)} />
                    {g.label}
                  </label>
                  <div className="grid grid-cols-3 gap-3 pl-9 sm:grid-cols-4">
                    {g.items.map((p) => {
                      const selected = photos.includes(p.url);
                      return (
                        <button
                          type="button"
                          key={p.url}
                          onClick={() => togglePhoto(p.url)}
                          className={`relative aspect-[2/3] overflow-hidden rounded-2xl border-2 transition-colors ${
                            selected ? "border-primary" : "border-transparent"
                          }`}
                          aria-pressed={selected}
                        >
                          <img src={p.url} alt="" className="h-full w-full object-cover" />
                          <span className="absolute left-2 top-2">
                            <Checkbox
                              checked={selected}
                              className="data-[state=unchecked]:border-white data-[state=unchecked]:bg-background/80"
                            />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {photoGroups.length === 0 && (
              <p className="text-sm text-muted-foreground">Nessuna foto disponibile per questo talent.</p>
            )}
          </div>
        )}

        {!loading && step === 3 && (
          <div className="space-y-3">
            {talentVideos.map((v) => (
              <label
                key={v.url}
                className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border p-4 text-[15px] text-foreground"
              >
                <Checkbox checked={videos.includes(v.url)} onCheckedChange={() => toggleVideo(v.url)} />
                <span className="min-w-0">
                  <span className="block font-medium">{videoLabel(v)}</span>
                  <span className="block truncate text-sm text-muted-foreground">{v.url}</span>
                </span>
              </label>
            ))}
          </div>
        )}

        <DialogFooter>
          {step > 1 && (
            <Button variant="secondary" onClick={() => setStep((s) => (s - 1) as Step)} disabled={generating}>
              Indietro
            </Button>
          )}
          {step < lastStep ? (
            <Button onClick={() => setStep((s) => (s + 1) as Step)} disabled={loading || !talent}>
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
