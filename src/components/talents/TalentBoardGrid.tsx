import { useMemo, type ReactNode } from "react";
import { TalentWithAttributes } from "@/hooks/useTalents";
import { useTalentsMainPhotos } from "@/hooks/useTalentsMainPhotos";
import { TalentBoardCard } from "./TalentBoardCard";

interface Props {
  talents: TalentWithAttributes[];
  onSelectTalent: (t: TalentWithAttributes) => void;
  /** Modalità selezione: id selezionati (se assente, comportamento standard). */
  selectedIds?: Set<string>;
  renderBadge?: (t: TalentWithAttributes) => ReactNode;
  /** Avvolge ogni scheda (es. per il trascinamento). */
  wrapCard?: (t: TalentWithAttributes, card: ReactNode) => ReactNode;
}

export const TalentBoardGrid = ({ talents, onSelectTalent, selectedIds, renderBadge, wrapCard }: Props) => {
  const ids = useMemo(() => talents.map((t) => t.id), [talents]);
  const { data: photosMap } = useTalentsMainPhotos(ids);

  return (
    <div className="@container">
      <div className="grid grid-cols-2 @[440px]:grid-cols-3 @[960px]:grid-cols-4 @[1280px]:grid-cols-5 gap-2">
        {talents.map((t) => {
          const card = (
            <TalentBoardCard
              key={t.id}
              talent={t}
              photos={photosMap?.get(t.id) || []}
              onClick={() => onSelectTalent(t)}
              selected={selectedIds ? selectedIds.has(t.id) : undefined}
              extraBadge={renderBadge?.(t)}
            />
          );
          return wrapCard ? <div key={t.id}>{wrapCard(t, card)}</div> : card;
        })}
      </div>
    </div>
  );
};
