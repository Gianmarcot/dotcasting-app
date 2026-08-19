import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { PersistentNotice } from "@/components/talent/castings/PersistentNotice";
import { EngagementCard } from "@/components/talent/castings/EngagementCard";
import { useTalentEngagements, type TalentEngagement } from "@/hooks/useTalentEngagements";
import emptyIllustration from "@/assets/empty-state-castings.png.asset.json";
import { cn } from "@/lib/utils";

type TabKey = "upcoming" | "past";

const isUpcoming = (e: TalentEngagement) => {
  if (!e.dateISO) return true;
  const d = new Date(e.dateISO);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d.getTime() >= today.getTime();
};

export const TalentCastings = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>("upcoming");
  const { data: engagements = [], isLoading } = useTalentEngagements();

  const { upcoming, past } = useMemo(() => {
    const up = engagements
      .filter(isUpcoming)
      .sort((a, b) => (a.dateISO ?? "").localeCompare(b.dateISO ?? ""));
    const pa = engagements
      .filter((e) => !isUpcoming(e))
      .sort((a, b) => (b.dateISO ?? "").localeCompare(a.dateISO ?? ""));
    return { upcoming: up, past: pa };
  }, [engagements]);

  const list = tab === "upcoming" ? upcoming : past;

  return (
    <div className="w-full max-w-[1040px] animate-fade-up">
      {/* Header + persistent notice */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <h1 className="font-display uppercase text-2xl tracking-wide text-[#1a1a1a]">
          I miei casting
        </h1>
        <PersistentNotice />
      </div>

      {/* Tabs */}
      <div className="mt-8 flex">
        <Tab
          label="In programma"
          count={upcoming.length}
          active={tab === "upcoming"}
          onClick={() => setTab("upcoming")}
        />
        <Tab
          label="Passati"
          count={past.length}
          active={tab === "past"}
          onClick={() => setTab("past")}
        />
      </div>

      {/* List */}
      <div className="mt-8">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-36 w-full rounded-3xl" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {list.map((e) => (
              <EngagementCard
                key={e.id}
                engagement={e}
                isNew={!e.openedAt}
                onOpen={(en) => navigate(`/talent/applications/${en.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Tab = ({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "h-12 px-4 text-[15px] text-[#1a1a1a] transition-colors",
      active
        ? "font-medium border-b-[3px] border-[#a30a2b]"
        : "border-b border-[#c7c7c7] text-[#1a1a1a]",
    )}
  >
    {label} · {count}
  </button>
);

const EmptyState = () => (
  <div className="flex flex-col items-center gap-8 py-16">
    <img
      src={emptyIllustration.url}
      alt="Nessun casting in agenda"
      width={266}
      height={174}
      className="w-[266px] h-[174px] object-contain"
      loading="lazy"
    />
    <p className="font-display uppercase text-2xl text-center text-[#1a1a1a] leading-snug">
      Nessun ciak in agenda 🎬
      <br />
      Qui compariranno date, luogo e istruzioni.
    </p>
  </div>
);

export default TalentCastings;
