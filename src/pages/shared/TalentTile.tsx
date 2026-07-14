import { Check, ImageOff, Maximize2 } from "lucide-react";
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

const StatusPill = ({ status }: { status: CompanyStatus | null }) => {
  if (status === "confirmed")
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#729128]/25 text-[#A8C76E]">
        <Check className="h-3 w-3" /> Confermato
      </span>
    );
  if (status === "rejected")
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#A30A2B]/25 text-[#E88599]">
        Scartato
      </span>
    );
  return null;
};

export interface TalentTileProps {
  row: TalentTileRow;
  selectable: boolean;
  selected: boolean;
  showStatus: boolean;
  onToggle: () => void;
  onOpenDetails: () => void;
}

export function TalentTile({
  row,
  selectable,
  selected,
  showStatus,
  onToggle,
  onOpenDetails,
}: TalentTileProps) {
  const talent = buildTalent(row);
  const photo = talent.photos?.[0];

  return (
    <div
      className={`group relative bg-[#1A1A1A] rounded-2xl transition-all ${
        selectable ? "cursor-pointer" : ""
      } ${selected ? "ring-2 ring-[#A30A2B]" : "ring-1 ring-white/5 hover:ring-white/15"}`}
      onClick={selectable ? onToggle : undefined}
    >
      {selectable && (
        <div
          className="absolute top-3 left-3 z-10"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          <div
            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
              selected ? "bg-[#A30A2B] border-[#A30A2B]" : "bg-[#1A1A1A] border-white/30"
            }`}
          >
            <Check
              className={`h-4 w-4 text-white transition-opacity ${selected ? "opacity-100" : "opacity-0"}`}
              strokeWidth={3}
            />
          </div>
        </div>
      )}

      {showStatus && (
        <div className="absolute top-3 right-3 z-10">
          <StatusPill status={row.company_status ?? null} />
        </div>
      )}

      <div className="px-12 pt-12 pb-0">
        <div className="overflow-hidden aspect-[5/7]">
          {photo ? (
            <img
              src={photo}
              alt={talent.nome}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/20 bg-[#0F0F0F]">
              <ImageOff className="h-6 w-6" />
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        <p className="font-display uppercase text-[18px] tracking-wide text-[#F5F0E8] leading-tight truncate">
          {talent.nome}
        </p>
        <p className="text-[12px] text-white/50 mt-0.5 truncate">
          {[talent.altezza_cm ? `${talent.altezza_cm} cm` : null, talent.citta].filter(Boolean).join(" • ")}
        </p>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpenDetails();
        }}
        className="absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center bg-transparent hover:bg-white/10 transition-colors"
        aria-label="Apri dettagli"
      >
        <Maximize2 className="h-6 w-6 text-white" />
      </button>
    </div>
  );
}
