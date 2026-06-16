import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";
import { useTriageQueue, TriageTalent } from "@/hooks/useOwnerDashboard";
import { TriageTalentCard } from "./TriageTalentCard";
import { TalentPreviewDrawer } from "@/components/talents/TalentPreviewDrawer";
import type { TalentWithAttributes } from "@/hooks/useTalents";

const triageToDrawer = (t: TriageTalent): TalentWithAttributes => ({
  id: t.id,
  user_id: t.user_id,
  first_name: t.first_name,
  last_name: t.last_name,
  stage_name: t.stage_name,
  city: t.city,
  country: t.country,
  gender: null,
  birth_date: t.birth_date,
  profile_photo_url: t.profile_photo_url,
  talent_categories: null,
  bio: null,
  nationality: null,
  ethnicity: null,
  gender_identity: null,
  representation_type: null,
  has_vat_number: null,
  attributes: null,
});

export const TriageQueueStrip = () => {
  const { data: talents = [], isLoading } = useTriageQueue(20);
  const [openId, setOpenId] = useState<string | null>(null);

  const openTalent = useMemo(
    () => talents.find((t) => t.id === openId) || null,
    [talents, openId],
  );

  return (
    <Card className="dc-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Nuovi talent
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="shrink-0 w-40 md:w-44 rounded-2xl" style={{ aspectRatio: "5 / 7" }} />
            ))}
          </div>
        ) : talents.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <Sparkles className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>Nessun nuovo talent</p>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1">
            {talents.map((t) => (
              <TriageTalentCard
                key={t.id}
                talent={t}
                onOpen={() => setOpenId(t.id)}
              />
            ))}
          </div>
        )}
      </CardContent>

      <TalentPreviewDrawer
        talent={openTalent ? triageToDrawer(openTalent) : null}
        open={!!openTalent}
        onOpenChange={(o) => !o && setOpenId(null)}
      />
    </Card>
  );
};
