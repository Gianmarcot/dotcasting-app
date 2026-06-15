import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ExternalLink, Send } from "lucide-react";
import { TalentWithAttributes, calculateAge } from "@/hooks/useTalents";
import { useTalentMediaByProfileId } from "@/hooks/useTalentMediaByProfileId";
import { TalentPhotoStrip } from "./TalentPhotoStrip";
import { InviteTalentDialog } from "@/components/invitations/InviteTalentDialog";
import { FIELD_REGISTRY, type Talent as RegistryTalent } from "@/lib/casting/talentFields";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface Props {
  talent: TalentWithAttributes | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const buildName = (t: TalentWithAttributes) => {
  if (t.stage_name) return t.stage_name;
  return [t.first_name, t.last_name].filter(Boolean).join(" ") || "Senza nome";
};

const buildInitials = (t: TalentWithAttributes) => {
  if (t.stage_name) {
    const p = t.stage_name.trim().split(/\s+/);
    return ((p[0]?.[0] || "") + (p[1]?.[0] || "")).toUpperCase();
  }
  return (((t.first_name?.[0] || "") + (t.last_name?.[0] || "")) || "?").toUpperCase();
};

const buildLocation = (t: TalentWithAttributes) => {
  const isIt = !t.country || /^ita/i.test(t.country) || t.country === "IT";
  return isIt ? (t.city || "") : [t.city, t.country].filter(Boolean).join(", ");
};

// Map TalentWithAttributes -> registry shape (subset)
const toRegistry = (t: TalentWithAttributes): RegistryTalent => ({
  id: t.id,
  nome: buildName(t),
  eta: calculateAge(t.birth_date),
  genere: t.gender,
  citta: buildLocation(t) || null,
  nazionalita: t.nationality,
  etnia: t.ethnicity,
  altezza_cm: t.attributes?.height ?? null,
  peso_kg: t.attributes?.weight ?? null,
  occhi: t.attributes?.eye_color ?? null,
  capelli: t.attributes?.hair_color ?? null,
  capelli_lunghezza: t.attributes?.hair_length ?? null,
  taglia_maglia: t.attributes?.shirt_size ?? null,
  petto_cm: t.attributes?.chest ?? null,
  fianchi_cm: t.attributes?.hips ?? null,
  numero_scarpe: t.attributes?.shoe_size ? Number(t.attributes.shoe_size) : null,
  lingue: t.attributes?.languages ?? null,
  abilita: t.attributes?.skills ?? null,
  photos: [],
});

// Essential subset of fields shown in the drawer (uses registry labels for consistency)
const ESSENTIAL_KEYS = [
  "eta",
  "genere",
  "citta",
  "altezza",
  "peso",
  "occhi",
  "capelli",
  "taglia_maglia",
  "numero_scarpe",
  "lingue",
  "abilita",
];

export const TalentPreviewDrawer = ({ talent, open, onOpenChange }: Props) => {
  const navigate = useNavigate();
  const [photoIdx, setPhotoIdx] = useState(0);
  const [inviteOpen, setInviteOpen] = useState(false);

  const { data: media } = useTalentMediaByProfileId(open ? talent?.id ?? null : null);

  const photos = useMemo(() => {
    if (!media) return [];
    return media
      .filter((m) => m.media_type === "photo")
      .map((m) => ({
        id: m.id,
        profile_id: talent?.id || "",
        url: m.url,
        thumbnail_url: m.thumbnail_url,
        sort_order: m.sort_order ?? 0,
      }));
  }, [media, talent?.id]);

  // Reset on talent change
  useEffect(() => {
    setPhotoIdx(0);
  }, [talent?.id]);

  // Keyboard navigation
  useEffect(() => {
    if (!open || photos.length === 0) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setPhotoIdx((i) => (i + 1) % photos.length);
      } else if (e.key === "ArrowLeft") {
        setPhotoIdx((i) => (i - 1 + photos.length) % photos.length);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, photos.length]);

  if (!talent) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-[440px] p-0">
          <VisuallyHidden>
            <SheetTitle>Anteprima talent</SheetTitle>
          </VisuallyHidden>
        </SheetContent>
      </Sheet>
    );
  }

  const name = buildName(talent);
  const initials = buildInitials(talent);
  const location = buildLocation(talent);
  const age = calculateAge(talent.birth_date);
  const meta = [location, age ? `${age} anni` : null].filter(Boolean).join(" · ");

  const registry = toRegistry(talent);
  const essentialFields = ESSENTIAL_KEYS.map((k) => {
    const def = FIELD_REGISTRY.find((f) => f.key === k);
    if (!def) return null;
    const raw = def.accessor(registry);
    if (raw === null || raw === undefined || raw === "") return null;
    const value = def.format ? def.format(raw as any) : String(raw);
    return { key: def.key, label: def.label, value };
  }).filter(Boolean) as { key: string; label: string; value: string }[];

  const current = photos[photoIdx];
  const canNav = photos.length > 1;

  const goPrev = () => setPhotoIdx((i) => (i - 1 + photos.length) % photos.length);
  const goNext = () => setPhotoIdx((i) => (i + 1) % photos.length);

  // Swipe support (mobile)
  let touchStartX = 0;
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) < 40 || !canNav) return;
    dx > 0 ? goPrev() : goNext();
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-[440px] p-0 flex flex-col gap-0 bg-background"
        >
          <VisuallyHidden>
            <SheetTitle>{`Anteprima ${name}`}</SheetTitle>
            <SheetDescription>Anteprima talent</SheetDescription>
          </VisuallyHidden>

          <div className="flex-1 overflow-y-auto">
            {/* Gallery */}
            <div
              className="relative w-full bg-[#2C2C2A]"
              style={{ aspectRatio: "3 / 4" }}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              {current ? (
                <img
                  src={current.url}
                  alt={name}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[#F1EFE8] text-7xl font-medium tracking-wide">
                    {initials}
                  </span>
                </div>
              )}

              {canNav && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    aria-label="Foto precedente"
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    aria-label="Foto successiva"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                    {photoIdx + 1} / {photos.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {photos.length > 1 && (
              <div className="px-4 pt-3">
                <TalentPhotoStrip
                  photos={photos}
                  activeIndex={photoIdx}
                  onSelect={setPhotoIdx}
                  name={name}
                  initials={initials}
                  columnsClassName="grid-cols-5"
                />
              </div>
            )}

            {/* Header */}
            <div className="px-5 pt-4">
              <h2 className="text-xl font-medium text-foreground">{name}</h2>
              {meta && (
                <p className="text-sm text-muted-foreground mt-1">{meta}</p>
              )}
              {talent.talent_categories && talent.talent_categories.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {talent.talent_categories.map((cat) => (
                    <Badge key={cat} variant="secondary" className="text-[11px]">
                      {cat}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Key data */}
            {essentialFields.length > 0 && (
              <div className="px-5 mt-5">
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Dati chiave
                </h3>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {essentialFields.map((f) => (
                    <div key={f.key} className="flex flex-col">
                      <dt className="text-xs text-muted-foreground">{f.label}</dt>
                      <dd className="text-foreground">{f.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            <div className="h-6" />
          </div>

          {/* Actions */}
          <div className="border-t bg-background p-4 flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                onOpenChange(false);
                navigate(`/owner/talents/${talent.id}/view`);
              }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Apri profilo completo
            </Button>
            <Button className="flex-1" onClick={() => setInviteOpen(true)}>
              <Send className="h-4 w-4 mr-2" />
              Aggiungi a un casting
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <InviteTalentDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        talentUserId={talent.user_id}
        talentName={name}
      />
    </>
  );
};
