import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Camera, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TalentWithAttributes } from "@/hooks/useTalents";
import { useTalentsMainPhotos, TalentMainPhoto } from "@/hooks/useTalentsMainPhotos";
import { FiscalPill } from "@/components/talents/TalentStatusPill";
import { buildDisplayName, buildMeta } from "@/components/talents/TalentBoardCard";
import { cn } from "@/lib/utils";

interface Props {
  talents: TalentWithAttributes[];
  onSelectTalent: (t: TalentWithAttributes) => void;
}

/** Conteggio foto/video per profilo in un'unica query. */
const useMediaCounts = (ids: string[]) => {
  const sorted = [...ids].sort();
  return useQuery({
    queryKey: ["owner-talents-media-counts", sorted],
    enabled: sorted.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("talent_media")
        .select("profile_id, media_type")
        .in("profile_id", sorted);
      if (error) throw error;
      const map = new Map<string, { photos: number; videos: number }>();
      (data || []).forEach((r: any) => {
        const c = map.get(r.profile_id) || { photos: 0, videos: 0 };
        if (r.media_type === "photo") c.photos++;
        else if (r.media_type === "video") c.videos++;
        map.set(r.profile_id, c);
      });
      return map;
    },
  });
};

/** Cella anteprima; `hideBelow` nasconde le celle oltre la seconda sotto md. */
const PhotoGrid = ({ photos, name }: { photos: TalentMainPhoto[]; name: string }) => {
  const renderCell = (i: number, slots: number, extraClass: string) => {
    const p = photos[i];
    const remaining = photos.length - slots;
    const isLast = i === slots - 1 && remaining > 0;
    return (
      <div key={`${slots}-${i}`} className={cn("relative overflow-hidden rounded-lg", extraClass)} style={{ aspectRatio: "2 / 3" }}>
        {p && (
          <>
            <img src={p.thumbnail_url || p.url} alt={name} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
            {isLast && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <span className="text-2xl font-medium text-white">+ {remaining}</span>
              </div>
            )}
          </>
        )}
      </div>
    );
  };
  return (
    <>
      <div className="hidden md:grid flex-1 grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((i) => renderCell(i, 4, ""))}
      </div>
      <div className="grid md:hidden grid-cols-2 gap-2">
        {[0, 1].map((i) => renderCell(i, 2, ""))}
      </div>
    </>
  );
};

export const TalentPortfolioList = ({ talents, onSelectTalent }: Props) => {
  const ids = useMemo(() => talents.map((t) => t.id), [talents]);
  const { data: photosMap } = useTalentsMainPhotos(ids);
  const { data: counts } = useMediaCounts(ids);

  return (
    <div className="flex flex-col gap-4">
      {talents.map((t) => {
        const photos = photosMap?.get(t.id) || [];
        const name = buildDisplayName(t);
        const meta = buildMeta(t);
        const c = counts?.get(t.id) || { photos: 0, videos: 0 };

        return (
          <div
            key={t.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelectTalent(t)}
            onKeyDown={(e) => { if (e.key === "Enter") onSelectTalent(t); }}
            className="flex flex-col md:flex-row md:justify-between gap-6 rounded-3xl bg-white p-8 shadow-sm cursor-pointer transition-shadow hover:shadow-md"
          >
            <div className="flex flex-col justify-between gap-6 md:w-[260px] md:shrink-0">
              <div className="flex flex-col items-start gap-4">
                <div>
                  <h3 className="font-display uppercase text-xl leading-tight text-[#1a1a1a]">{name}</h3>
                  {meta && <p className="mt-1 text-sm text-[#686868]">{meta}</p>}
                </div>
                <FiscalPill profile={t} />
                {t.talent_categories && t.talent_categories.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {t.talent_categories.map((cat) => (
                      <span key={cat} className="rounded-full bg-[#f4f0ec] px-3 py-1.5 text-[12px] font-medium text-[#1a1a1a]">
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                <span className="inline-flex items-center gap-[5px] rounded-full border border-[#c7c7c7] bg-white px-3 py-1.5 text-[12px] font-medium text-[#1a1a1a]">
                  <Camera className="h-5 w-5" strokeWidth={1.5} />
                  {c.photos} foto
                </span>
                <span className="inline-flex items-center gap-[5px] rounded-full border border-[#c7c7c7] bg-white px-3 py-1.5 text-[12px] font-medium text-[#1a1a1a]">
                  <Play className="h-5 w-5" strokeWidth={1.5} />
                  {c.videos} video
                </span>
              </div>
            </div>
            <PhotoGrid photos={photos} name={name} />
          </div>
        );
      })}
    </div>
  );
};
