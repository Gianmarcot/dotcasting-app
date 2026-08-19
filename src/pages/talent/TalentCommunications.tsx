import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useCommunications,
  useMarkAllCommunicationsRead,
  useMarkCommunicationRead,
} from "@/hooks/useCommunications";
import { CommunicationCard } from "@/components/communications/CommunicationCard";
import type { Communication } from "@/lib/communications";

type Filter = "all" | "unread";

const EmptyState = () => (
  <div className="dc-card flex flex-col items-center gap-6 p-12">
    <p className="text-center font-display text-2xl uppercase leading-snug text-[#1a1a1a]">
      Nessuna comunicazione 📣
      <br />
      Qui arriveranno gli avvisi dell'agenzia.
    </p>
  </div>
);

export const TalentCommunications = () => {
  const { data: communications, isLoading } = useCommunications();
  const markRead = useMarkCommunicationRead();
  const markAll = useMarkAllCommunicationsRead();
  const [filter, setFilter] = useState<Filter>("all");

  const unreadCount = (communications ?? []).filter((c) => !c.read_at).length;
  const list = useMemo(
    () =>
      filter === "unread"
        ? (communications ?? []).filter((c) => !c.read_at)
        : communications ?? [],
    [communications, filter]
  );

  const handleOpen = (comm: Communication) => {
    if (!comm.read_at && !markRead.isPending) markRead.mutate(comm.id);
  };

  return (
    <div className="mx-auto w-full max-w-[1040px] animate-fade-up space-y-6 pb-28">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl uppercase text-foreground">Comunicazioni</h1>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={() => markAll.mutate()}>
            <Check />
            Segna tutte come lette
          </Button>
        )}
      </header>

      <div className="flex items-center gap-2">
        {([
          { key: "all" as Filter, label: "Tutte" },
          { key: "unread" as Filter, label: `Da leggere${unreadCount ? ` (${unreadCount})` : ""}` },
        ]).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={cn(
              "h-10 rounded-full border px-5 text-[15px] transition-colors",
              filter === tab.key
                ? "border-transparent bg-primary text-primary-foreground"
                : "border-border bg-white/30 text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-3xl" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {list.map((comm) => (
            <CommunicationCard key={comm.id} communication={comm} onOpen={handleOpen} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TalentCommunications;
