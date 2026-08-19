import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Lock } from "lucide-react";
import { format, isSameDay, isToday, isYesterday } from "date-fns";
import { it as itLocale } from "date-fns/locale";
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

const dayLabel = (iso: string) => {
  const d = new Date(iso);
  if (isToday(d)) return "Oggi";
  if (isYesterday(d)) return "Ieri";
  return format(d, "EEEE d MMMM", { locale: itLocale });
};

const EmptyState = () => (
  <div className="flex flex-1 flex-col items-center justify-center gap-6 py-16">
    <p className="text-center font-display text-2xl uppercase leading-snug text-[#1a1a1a]">
      Nessuna comunicazione 📣
      <br />
      Qui arriveranno gli avvisi dell'agenzia.
    </p>
  </div>
);

const DaySeparator = ({ label }: { label: string }) => (
  <div className="flex items-center justify-center py-2">
    <span className="rounded-full bg-muted px-3 py-1 text-xs capitalize text-muted-foreground">
      {label}
    </span>
  </div>
);

const UnreadSeparator = () => (
  <div className="flex items-center gap-3 py-2">
    <span className="h-px flex-1 bg-primary/30" />
    <span className="text-xs uppercase tracking-wide text-primary">Non letti</span>
    <span className="h-px flex-1 bg-primary/30" />
  </div>
);

export const TalentCommunications = () => {
  const { data: communications, isLoading } = useCommunications();
  const markRead = useMarkCommunicationRead();
  const markAll = useMarkAllCommunicationsRead();
  const [filter, setFilter] = useState<Filter>("all");
  const bottomRef = useRef<HTMLDivElement>(null);
  const didScroll = useRef(false);

  const unreadCount = (communications ?? []).filter((c) => !c.read_at).length;

  // Ordine cronologico crescente: la conversazione si legge dall'alto verso il basso.
  const list = useMemo(() => {
    const base =
      filter === "unread"
        ? (communications ?? []).filter((c) => !c.read_at)
        : communications ?? [];
    return [...base].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, [communications, filter]);

  const firstUnreadId = useMemo(() => list.find((c) => !c.read_at)?.id ?? null, [list]);

  useEffect(() => {
    if (didScroll.current || isLoading || list.length === 0) return;
    didScroll.current = true;
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [isLoading, list.length]);

  const handleOpen = (comm: Communication) => {
    if (!comm.read_at && !markRead.isPending) markRead.mutate(comm.id);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1040px] animate-fade-up flex-col pb-28">
      {/* Header stile chat */}
      <header className="sticky top-0 z-10 -mx-1 flex flex-col gap-3 bg-background/90 px-1 pb-4 pt-1 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl uppercase text-foreground">Comunicazioni</h1>
          <div className="flex items-center gap-2">
            {([
              { key: "all" as Filter, label: "Tutte" },
              {
                key: "unread" as Filter,
                label: `Da leggere${unreadCount ? ` (${unreadCount})` : ""}`,
              },
            ]).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={cn(
                  "h-9 rounded-full border px-4 text-sm transition-colors",
                  filter === tab.key
                    ? "border-transparent bg-primary text-primary-foreground"
                    : "border-border bg-white/30 text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={() => markAll.mutate()}>
            <Check />
            Segna tutte come lette
          </Button>
        )}
      </header>

      {/* Conversazione */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-[75%] rounded-3xl" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-2">
          {list.map((comm, i) => {
            const prev = list[i - 1];
            const newDay =
              !prev || !isSameDay(new Date(prev.created_at), new Date(comm.created_at));
            return (
              <div key={comm.id} className="flex flex-col gap-2">
                {newDay && <DaySeparator label={dayLabel(comm.created_at)} />}
                {comm.id === firstUnreadId && filter === "all" && prev && <UnreadSeparator />}
                <CommunicationCard communication={comm} onOpen={handleOpen} />
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Nota al posto del composer: il talent non scrive */}
      <div className="pointer-events-none sticky bottom-4 mt-6 flex justify-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs text-muted-foreground shadow-sm backdrop-blur">
          <Lock className="h-3.5 w-3.5" />
          Le comunicazioni arrivano dall'agenzia: non è possibile rispondere qui.
        </span>
      </div>
    </div>
  );
};

export default TalentCommunications;
