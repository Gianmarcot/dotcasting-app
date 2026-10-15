import { Check, ImageOff, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { mapToTalent } from "@/lib/casting/fetchRoundTalents";

type CompanyStatus = "none" | "pending" | "proposed" | "confirmed" | "rejected";

export interface TalentTileRow {
  role_talent_id: string;
  pdf_path: string | null;
  company_status: CompanyStatus | null;
  profile: Record<string, unknown>;
  attributes: Record<string, unknown> | null;
  media: Array<{ url: string; sort_order: number; media_type: string; category: string | null }>;
}

const buildTalent = (row: TalentTileRow) =>
  mapToTalent({
    ...row.profile,
    attributes: row.attributes ? [row.attributes] : null,
    media: row.media ?? [],
  } as unknown as Parameters<typeof mapToTalent>[0]);

export interface TalentTileProps {
  row: TalentTileRow;
  selectable: boolean;
  selected: boolean;
  showStatus: boolean;
  onToggle: () => void;
  onOpenDetails: () => void;
}

export function TalentTile({ row, selectable, selected, onToggle, onOpenDetails }: TalentTileProps) {
  const talent = buildTalent(row);
  return (
    <TalentTileView
      name={talent.nome}
      photoUrl={talent.photos?.[0] ?? null}
      meta={[talent.altezza_cm ? `${talent.altezza_cm} cm` : null, talent.citta].filter(Boolean).join(" • ")}
      selectable={selectable}
      selected={selected}
      onToggle={onToggle}
      onOpenDetails={onOpenDetails}
    />
  );
}

export interface TalentTileViewProps {
  name: string;
  photoUrl: string | null;
  meta: string;
  /** Iniziali per chi non ha foto (variante chiara). */
  initials?: string;
  selectable: boolean;
  selected: boolean;
  onToggle: () => void;
  onOpenDetails: () => void;
  /** "dark" = pagina cliente, "light" = superfici bianche/crema dell'admin. */
  tone?: "dark" | "light";
}

/** Tessera talent: foto 5:7, nome Tenor maiuscolo, meta, cerchio di selezione e pulsante dettagli. */
export function TalentTileView({
  name,
  photoUrl,
  meta,
  initials,
  selectable,
  selected,
  onToggle,
  onOpenDetails,
  tone = "dark",
}: TalentTileViewProps) {
  const light = tone === "light";
  return (
    <div
      className={cn(
        "group relative rounded-2xl transition-all",
        selectable && "cursor-pointer",
        light
          ? cn("bg-white shadow-sm", selected ? "ring-2 ring-primary" : "ring-1 ring-border hover:ring-[var(--grey-400)]")
          : cn("bg-[#1A1A1A]", selected ? "ring-2 ring-[#A30A2B]" : "ring-1 ring-white/5 hover:ring-white/15"),
      )}
      onClick={selectable ? onToggle : undefined}
    >
      {selectable && (
        <button
          type="button"
          role="checkbox"
          aria-checked={selected}
          aria-label={`Seleziona ${name}`}
          className="absolute left-3 top-3 z-10"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          <span
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all",
              selected
                ? light ? "border-primary bg-primary" : "border-[#A30A2B] bg-[#A30A2B]"
                : light ? "border-[var(--grey-400)] bg-white" : "border-white/30 bg-[#1A1A1A]",
            )}
          >
            <Check className={cn("h-4 w-4 text-white transition-opacity", selected ? "opacity-100" : "opacity-0")} strokeWidth={3} />
          </span>
        </button>
      )}

      <div className="px-12 pb-0 pt-12">
        <div className="aspect-[5/7] overflow-hidden">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : light ? (
            <div className="flex h-full w-full items-center justify-center bg-ink text-2xl font-medium text-white">
              {initials ?? "?"}
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#0F0F0F] text-white/20">
              <ImageOff className="h-6 w-6" />
            </div>
          )}
        </div>
      </div>

      <div className="p-6 pr-16">
        <p className={cn("truncate font-display text-[18px] uppercase leading-tight tracking-wide", light ? "text-ink" : "text-[#F5F0E8]")}>
          {name}
        </p>
        <p className={cn("mt-0.5 min-h-[18px] truncate text-[12px]", light ? "text-field-label" : "text-white/50")}>{meta}</p>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpenDetails();
        }}
        className={cn(
          "absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-transparent transition-colors",
          light ? "text-ink hover:bg-field" : "text-white hover:bg-white/10",
        )}
        aria-label="Apri dettagli"
      >
        <Maximize2 className="h-6 w-6" />
      </button>
    </div>
  );
}
