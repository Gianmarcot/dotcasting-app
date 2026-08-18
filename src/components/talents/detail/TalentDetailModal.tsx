// =============================================================
// TalentDetailModal.tsx — Modale di dettaglio talent a tutta pagina.
// Metà sinistra: carosello foto (fissa). Metà destra: dati in sola
// lettura (scrollabile). Riusabile sia dalla preview del proprio
// profilo (un solo talent) sia da liste di talent (con frecce).
// =============================================================

import { useEffect, useMemo, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModalNavBar } from "@/components/ui/modal-nav-bar";
import { useProfileById } from "@/hooks/useProfileById";
import { useTalentAttributesByProfileId } from "@/hooks/useTalentAttributesByProfileId";
import { useTalentMediaByProfileId } from "@/hooks/useTalentMediaByProfileId";
import { buildTalentDetail, type DetailField } from "./talentDetailData";
import { TalentPdfWizard } from "./TalentPdfWizard";

interface TalentDetailModalProps {
  /** elenco dei talent navigabili: un solo id = variante senza frecce */
  profileIds: string[];
  /** indice del talent mostrato */
  index?: number;
  onIndexChange?: (index: number) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LABEL = "text-[13px] leading-tight text-[#686868]";
const VALUE = "mt-[2px] text-[15px] leading-snug text-[#1a1a1a]";

const FieldItem = ({ field }: { field: DetailField }) => (
  <div className={field.wide ? "col-span-full" : ""}>
    <p className={LABEL}>{field.label}</p>
    <p className={cn(VALUE, "whitespace-pre-wrap break-words")}>{field.value}</p>
  </div>
);

export const TalentDetailModal = ({
  profileIds,
  index = 0,
  onIndexChange,
  open,
  onOpenChange,
}: TalentDetailModalProps) => {
  const [localIndex, setLocalIndex] = useState(index);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [wizardOpen, setWizardOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentIndex = onIndexChange ? index : localIndex;
  const profileId = profileIds[currentIndex] ?? null;

  const { data: profile } = useProfileById(profileId);
  const { data: attrs } = useTalentAttributesByProfileId(profileId);
  const { data: media } = useTalentMediaByProfileId(profileId);

  const photos = useMemo(
    () => (media ?? []).filter((m) => m.media_type === "photo").map((m) => m.url),
    [media]
  );

  const { fullName, location, sections } = useMemo(
    () => buildTalentDetail(profile as Record<string, unknown> | null, attrs as Record<string, unknown> | null),
    [profile, attrs]
  );

  const setIndex = (next: number) => {
    if (onIndexChange) onIndexChange(next);
    else setLocalIndex(next);
    setPhotoIndex(0);
    scrollRef.current?.scrollTo({ top: 0 });
  };

  useEffect(() => setPhotoIndex(0), [profileId]);
  useEffect(() => {
    if (open) setLocalIndex(index);
  }, [open, index]);

  const prevPhoto = () => setPhotoIndex((i) => (photos.length ? (i - 1 + photos.length) % photos.length : 0));
  const nextPhoto = () => setPhotoIndex((i) => (photos.length ? (i + 1) % photos.length : 0));

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevPhoto();
      if (e.key === "ArrowRight") nextPhoto();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, photos.length]);

  const hasNavigation = profileIds.length > 1;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[70] bg-black/40 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:duration-200 data-[state=open]:duration-300" />
        <DialogPrimitive.Content
          className="fixed inset-0 z-[80] flex flex-col overflow-hidden bg-white outline-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-bottom-2 data-[state=open]:slide-in-from-bottom-2 data-[state=closed]:duration-200 data-[state=open]:duration-300 data-[state=open]:ease-out lg:flex-row motion-reduce:data-[state=closed]:slide-out-to-bottom-0 motion-reduce:data-[state=open]:slide-in-from-bottom-0"
          aria-label={`Dettaglio di ${fullName}`}
        >
          <DialogPrimitive.Title className="sr-only">{fullName}</DialogPrimitive.Title>

          {/* barra di navigazione fissa in alto a destra */}
          <ModalNavBar
            className="fixed right-8 top-8 z-[90] animate-fade-in motion-reduce:animate-none"
            showNavigation={hasNavigation}
            prevDisabled={currentIndex <= 0}
            nextDisabled={currentIndex >= profileIds.length - 1}
            onPrev={() => setIndex(Math.max(0, currentIndex - 1))}
            onNext={() => setIndex(Math.min(profileIds.length - 1, currentIndex + 1))}
            onClose={() => onOpenChange(false)}
            labels={{ prev: "Talent precedente", next: "Talent successivo", close: "Chiudi dettaglio" }}
          />

          {/* METÀ SINISTRA — carosello, non scorre */}
          <div className="relative flex shrink-0 flex-col items-center justify-center bg-[#f4f0ec] py-10 lg:h-full lg:w-1/2 lg:py-0">
            <div
              className="relative flex flex-col items-center"
              role="group"
              aria-roledescription="carosello"
              aria-label={
                photos.length ? `Foto ${photoIndex + 1} di ${photos.length}` : "Nessuna foto disponibile"
              }
            >
              <div
                className="overflow-hidden rounded-2xl bg-black/5"
                style={{ height: "min(600px, 58.6vh)", aspectRatio: "2 / 3" }}
              >
                {photos.length > 0 ? (
                  <div
                    key={profileId ?? "empty"}
                    className="flex h-full w-full transition-transform duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
                    style={{ transform: `translateX(-${photoIndex * 100}%)` }}
                  >
                    {photos.map((url, i) => (
                      <img
                        key={url + i}
                        src={url}
                        alt={`${fullName} — foto ${i + 1} di ${photos.length}`}
                        className="h-full w-full shrink-0 object-cover"
                        aria-hidden={i !== photoIndex}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
                    Nessuna foto disponibile
                  </div>
                )}
              </div>

              {/* indicatori */}
              {photos.length > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  {photos.map((url, i) => (
                    <button
                      key={url + i}
                      type="button"
                      onClick={() => setPhotoIndex(i)}
                      aria-label={`Vai alla foto ${i + 1}`}
                      aria-current={i === photoIndex}
                      className={cn(
                        "h-1.5 w-1.5 rounded-full transition-all duration-300 ease-out motion-reduce:transition-none",
                        i === photoIndex ? "scale-125 bg-[#1a1a1a]" : "bg-[#1a1a1a]/20 hover:bg-[#1a1a1a]/40"
                      )}
                    />
                  ))}
                </div>
              )}
              <p className="sr-only" aria-live="polite">
                {photos.length ? `Foto ${photoIndex + 1} di ${photos.length}` : ""}
              </p>
            </div>

            {/* frecce foto ai bordi della metà sinistra */}
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevPhoto}
                  aria-label="Foto precedente"
                  className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-[#1a1a1a] opacity-70 transition-opacity duration-200 hover:opacity-100 active:opacity-60 motion-reduce:transition-none lg:left-[54px]"
                >
                  <ChevronLeft className="h-6 w-6" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  onClick={nextPhoto}
                  aria-label="Foto successiva"
                  className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-[#1a1a1a] opacity-70 transition-opacity duration-200 hover:opacity-100 active:opacity-60 motion-reduce:transition-none lg:right-[54px]"
                >
                  <ChevronRight className="h-6 w-6" strokeWidth={1.5} />
                </button>
              </>
            )}
          </div>

          {/* METÀ DESTRA — dettagli, scorre */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto bg-white lg:h-full lg:w-1/2">
            <div className="w-full max-w-[524px] px-6 pb-24 pt-24 lg:ml-[100px] lg:mr-[96px] lg:px-0 lg:pt-[147px]">
              <button
                type="button"
                onClick={() => setWizardOpen(true)}
                className="flex h-12 items-center gap-[10px] rounded-full border border-border bg-background px-5 text-[15px] text-foreground"
              >
                <Download className="h-5 w-5" strokeWidth={1.5} />
                Scarica PDF
              </button>

              <h2 className="mt-8 font-display text-4xl uppercase leading-tight text-[#1a1a1a]">
                {fullName}
              </h2>
              {location && <p className="mt-2 text-[15px] text-[#686868]">{location}</p>}

              {sections.map((section) => (
                <section key={section.key}>
                  {section.title && (
                    <>
                      <div className="my-12 h-px w-full bg-divider" />
                      <div className="flex items-center gap-4">
                        {section.icon && (
                          <section.icon className="h-8 w-8 text-[#1a1a1a]" strokeWidth={1} />
                        )}
                        <h3 className="font-display text-base uppercase text-[#1a1a1a]">
                          {section.title}
                        </h3>
                      </div>
                    </>
                  )}

                  {section.pills && section.pills.length > 0 && (
                    <div className={cn("flex flex-wrap gap-2", section.title ? "mt-12" : "mt-8")}>
                      {section.pills.map((pill) => (
                        <span
                          key={pill}
                          className="rounded-full border border-border bg-background px-4 py-2 text-[14px] text-[#1a1a1a]"
                        >
                          {pill}
                        </span>
                      ))}
                    </div>
                  )}

                  {section.fields.length > 0 && (
                    <div
                      className={cn(
                        "grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2",
                        section.title ? "mt-12" : "mt-8"
                      )}
                    >
                      {section.fields.map((field) => (
                        <FieldItem key={section.key + field.label} field={field} />
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>

      <TalentPdfWizard
        profileId={profileId}
        talentName={fullName}
        open={wizardOpen}
        onOpenChange={setWizardOpen}
      />
    </DialogPrimitive.Root>
  );
};

export default TalentDetailModal;
