import { useMemo } from "react";
import { Camera, ChevronRight, Play } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FiscalPill, MinorPill } from "@/components/talents/TalentStatusPill";
import { buildDisplayName, buildInitials, buildMeta } from "@/components/talents/TalentBoardCard";
import { useTalentsMainPhotos } from "@/hooks/useTalentsMainPhotos";
import { useTalentsMediaCounts } from "@/hooks/useTalentsMediaCounts";
import type { TalentWithAttributes } from "@/hooks/useTalents";
import type { TalentMediaCounts } from "@/hooks/useTalentsMediaCounts";
import { cn } from "@/lib/utils";

/**
 * Colonne condivise tra intestazioni e righe. Le colonne opzionali spariscono
 * sotto il rispettivo breakpoint e la griglia si restringe di un binario.
 */
const GRID =
  "grid grid-cols-[minmax(180px,1fr)_20px] sm:grid-cols-[minmax(200px,1fr)_180px_20px] md:grid-cols-[minmax(200px,1fr)_180px_132px_20px] lg:grid-cols-[minmax(220px,1fr)_180px_132px_260px_20px] items-center gap-4";

/** Pill contatore: identica a quella della vista portfolio, senza la parola. */
const countPill =
  "inline-flex items-center gap-[5px] rounded-full border border-border bg-white px-3 py-1.5 text-[12px] font-medium leading-none text-ink";

export interface TalentCompactRowProps {
  talent: TalentWithAttributes;
  /** Immagine dell'avatar: foto profilo se presente, altrimenti la prima foto principale. */
  photoUrl?: string | null;
  counts: TalentMediaCounts;
  onSelect: (talent: TalentWithAttributes) => void;
}

export const TalentCompactRow = ({
  talent,
  photoUrl,
  counts,
  onSelect,
}: TalentCompactRowProps) => {
  const name = buildDisplayName(talent);
  const meta = buildMeta(talent);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(talent)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSelect(talent);
      }}
      className={cn(
        GRID,
        "h-20 cursor-pointer rounded-lg px-4 transition-colors hover:bg-muted/30",
      )}
    >
      {/* Talento */}
      <div className="flex min-w-0 items-center gap-4">
        <Avatar size="md" className="shrink-0">
          {photoUrl ? <AvatarImage src={photoUrl} alt={name} /> : null}
          <AvatarFallback className="bg-muted text-sm">
            {buildInitials(talent)}
          </AvatarFallback>
        </Avatar>
        <span className="truncate text-base font-medium text-foreground">{name}</span>
      </div>

      {/* Città / età */}
      <span className="hidden truncate text-sm text-muted-foreground sm:block">
        {meta || "—"}
      </span>

      {/* Media */}
      <div className="hidden items-center gap-2 md:flex">
        <span className={countPill}>
          <Camera className="h-5 w-5" strokeWidth={1.5} />
          {counts.photos}
        </span>
        <span className={countPill}>
          <Play className="h-5 w-5" strokeWidth={1.5} />
          {counts.videos}
        </span>
      </div>

      {/* Etichette */}
      <div className="hidden flex-wrap items-center gap-2 lg:flex">
        <MinorPill birthDate={talent.birth_date} className="bg-background" />
        <FiscalPill profile={talent} />
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </div>
  );
};

interface Props {
  talents: TalentWithAttributes[];
  onSelectTalent: (t: TalentWithAttributes) => void;
}

export const TalentCompactList = ({ talents, onSelectTalent }: Props) => {
  const ids = useMemo(() => talents.map((t) => t.id), [talents]);
  const { data: counts } = useTalentsMediaCounts(ids);
  const { data: photosMap } = useTalentsMainPhotos(ids);

  return (
    <div className="dc-card overflow-hidden p-6">
      <div className={cn(GRID, "px-4 py-2 text-sm font-medium text-muted-foreground")}>
        <span>Talento</span>
        <span className="hidden sm:block">Città / età</span>
        <span className="hidden md:block">Media</span>
        <span className="hidden lg:block">Etichette</span>
        <span />
      </div>

      {talents.map((t) => {
        const firstMain = photosMap?.get(t.id)?.[0];
        return (
          <TalentCompactRow
            key={t.id}
            talent={t}
            photoUrl={t.profile_photo_url || firstMain?.thumbnail_url || firstMain?.url || null}
            counts={counts?.get(t.id) || { photos: 0, videos: 0 }}
            onSelect={onSelectTalent}
          />
        );
      })}
    </div>
  );
};

export default TalentCompactList;
