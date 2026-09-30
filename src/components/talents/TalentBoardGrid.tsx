import { useMemo } from "react";
import { TalentWithAttributes } from "@/hooks/useTalents";
import { useTalentsMainPhotos } from "@/hooks/useTalentsMainPhotos";
import { TalentBoardCard } from "./TalentBoardCard";

interface Props {
  talents: TalentWithAttributes[];
  onSelectTalent: (t: TalentWithAttributes) => void;
}

export const TalentBoardGrid = ({ talents, onSelectTalent }: Props) => {
  const ids = useMemo(() => talents.map((t) => t.id), [talents]);
  const { data: photosMap } = useTalentsMainPhotos(ids);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
      {talents.map((t) => (
        <TalentBoardCard
          key={t.id}
          talent={t}
          photos={photosMap?.get(t.id) || []}
          onClick={() => onSelectTalent(t)}
        />
      ))}
    </div>
  );
};
