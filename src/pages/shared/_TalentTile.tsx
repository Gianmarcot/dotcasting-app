import { Check, ImageOff } from "lucide-react";
import { mapToTalent } from "@/lib/casting/fetchRoundTalents";

export type SharedCompanyStatus = "none" | "pending" | "proposed" | "confirmed" | "rejected";

export interface SharedRpcTalentRow {
  role_talent_id: string;
  pdf_path: string | null;
  company_status: SharedCompanyStatus | null;
  profile: Record<string, unknown>;
  attributes: Record<string, unknown> | null;
  media: Array<{ url: string; sort_order: number; media_type: string; category: string | null }>;
}

export const mapRowToTalent = (row: SharedRpcTalentRow) =>
  mapToTalent({
    ...row.profile,
    attributes: row.attributes ? [row.attributes] : null,
    media: row.media ?? [],
  } as unknown as Parameters<typeof mapToTalent>[0]);

const initials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
};

interface TalentTileProps {
  row: SharedRpcTalentRow;
  selected: boolean;
  /** mode: select → tap = toggle selezione e mostra checkbox; browse → tap = apri dettaglio */
  mode: "browse" | "select" | "readonly";
  onClick: () => void;
}

export default function TalentTile({ row, selected, mode, onClick }: TalentTileProps) {
  const talent = mapRowToTalent(row);
  const photo = talent.photos?.[0];
  const status = row.company_status ?? null;
  const showCheckbox = mode === "select";
  const showFrozenBadge = mode === "readonly" && (status === "confirmed" || status === "rejected");

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative bg-white overflow-hidden text-left transition-all w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A30A2B] ${
        selected ? "ring-2 ring-[#A30A2B]" : "ring-1 ring-black/5"
      }`}
    >
      {/* photo */}
      <div className="aspect-[5/7] overflow-hidden bg-[#EFE7DA] relative">
        {photo ? (
          <img
            src={photo}
            alt={talent.nome}
            loading="lazy"
            className={`w-full h-full object-cover transition-transform duration-500 ${
              selected ? "scale-[1.01]" : "group-hover:scale-[1.03]"
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#999] gap-2">
            <ImageOff className="h-6 w-6" />
            <span className="font-tenor text-2xl tracking-widest">{initials(talent.nome)}</span>
          </div>
        )}

        {/* dim overlay quando selezionato per dare profondità */}
        {selected && <div className="absolute inset-0 bg-[#A30A2B]/5 pointer-events-none" />}

        {/* checkbox (solo in modalità select) */}
        {showCheckbox && (
          <div
            className={`absolute top-2.5 left-2.5 w-7 h-7 flex items-center justify-center shadow-sm transition-colors ${
              selected
                ? "bg-[#A30A2B] border-2 border-[#A30A2B]"
                : "bg-white/85 backdrop-blur-sm border-2 border-white"
            }`}
            aria-hidden
          >
            <Check
              className={`h-4 w-4 text-white transition-opacity ${selected ? "opacity-100" : "opacity-0"}`}
              strokeWidth={3}
            />
          </div>
        )}

        {/* check verde costante quando selezionato anche in browse, per non perdere riscontro */}
        {!showCheckbox && selected && mode !== "readonly" && (
          <div className="absolute top-2.5 right-2.5 w-7 h-7 flex items-center justify-center bg-[#729128] shadow-sm">
            <Check className="h-4 w-4 text-white" strokeWidth={3} />
          </div>
        )}

        {/* badge stato in modalità sola lettura */}
        {showFrozenBadge && (
          <div className="absolute top-2.5 left-2.5">
            {status === "confirmed" ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest bg-[#729128] text-white">
                <Check className="h-3 w-3" /> Confermato
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest bg-[#A30A2B] text-white">
                Scartato
              </span>
            )}
          </div>
        )}
      </div>

      {/* footer info */}
      <div className="px-3 py-3">
        <h3 className="font-tenor text-sm sm:text-base uppercase tracking-wider leading-tight truncate">
          {talent.nome}
        </h3>
        <p className="text-[11px] font-dm text-[#666] mt-0.5 truncate">
          {talent.citta ?? "—"}
        </p>
      </div>
    </button>
  );
}
