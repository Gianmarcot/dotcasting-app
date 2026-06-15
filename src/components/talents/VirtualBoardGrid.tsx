import { useEffect, useRef, useState } from "react";
import { TalentBoardCard, type MaterialIndicators } from "./TalentBoardCard";
import { useTalentsMainPhotos } from "@/hooks/useTalentsMainPhotos";
import type { TalentWithAttributes } from "@/hooks/useTalents";

interface Props {
  talents: TalentWithAttributes[];
  onSelectTalent: (t: TalentWithAttributes) => void;
  materialBy?: Map<string, MaterialIndicators>;
  pageSize?: number;
}

/**
 * Lightweight virtualization: progressively reveal more cards as the
 * sentinel scrolls into view. Avoids rendering hundreds of cards at once
 * without introducing a new dependency.
 */
export const VirtualBoardGrid = ({
  talents,
  onSelectTalent,
  materialBy,
  pageSize = 30,
}: Props) => {
  const [visible, setVisible] = useState(pageSize);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVisible(pageSize);
  }, [talents, pageSize]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible((v) => Math.min(v + pageSize, talents.length));
          }
        }
      },
      { rootMargin: "600px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [talents.length, pageSize]);

  const shown = talents.slice(0, visible);
  const ids = shown.map((t) => t.id);
  const { data: photosMap } = useTalentsMainPhotos(ids);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-[10px]">
        {shown.map((t) => (
          <TalentBoardCard
            key={t.id}
            talent={t}
            photos={photosMap?.get(t.id) || []}
            materialIndicators={materialBy?.get(t.id)}
            onClick={() => onSelectTalent(t)}
          />
        ))}
      </div>
      {visible < talents.length && (
        <div ref={sentinelRef} className="h-10 w-full" aria-hidden />
      )}
    </>
  );
};
