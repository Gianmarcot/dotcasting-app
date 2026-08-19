import { useEffect, useMemo, useRef } from "react";
import { format, isSameDay, isToday, isYesterday } from "date-fns";
import { it as itLocale } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppSettings } from "@/hooks/useAppSettings";
import {
  useCommunications,
  useMarkCommunicationRead,
} from "@/hooks/useCommunications";
import { CommunicationCard } from "@/components/communications/CommunicationCard";
import type { Communication } from "@/lib/communications";

const dayLabel = (iso: string) => {
  const d = new Date(iso);
  if (isToday(d)) return "Oggi";
  if (isYesterday(d)) return "Ieri";
  return format(d, "d MMMM yyyy", { locale: itLocale });
};

const Pill = ({ children }: { children: React.ReactNode }) => (
  <div className="flex justify-center py-2">
    <span className="dc-comm-pill text-center">{children}</span>
  </div>
);

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.966 1.164-.198.199-.396.223-.693.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.174-.297-.019-.458.13-.606.134-.133.347-.446.52-.669.174-.223.232-.38.347-.63.116-.246.058-.462-.02-.61-.077-.149-.664-1.6-.91-2.19-.24-.577-.485-.5-.665-.51-.174-.008-.372-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347zM12.05 21.785h-.004a9.87 9.87 0 01-5.03-1.378l-.36-.214-3.742.982.998-3.648-.235-.375a9.86 9.86 0 01-1.51-5.26c.002-5.45 4.437-9.884 9.89-9.884a9.82 9.82 0 016.988 2.896 9.82 9.82 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884zM20.52 3.449A11.78 11.78 0 0012.05.001C5.495 0 .16 5.334.157 11.892c0 2.096.548 4.142 1.588 5.945L0 24l6.305-1.654a11.88 11.88 0 005.74 1.463h.005c6.554 0 11.89-5.335 11.892-11.893a11.82 11.82 0 00-3.422-8.467z" />
  </svg>
);

export const TalentCommunications = () => {
  const { data: communications, isLoading } = useCommunications();
  const { data: settings } = useAppSettings();
  const markRead = useMarkCommunicationRead();
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastCount = useRef(0);

  const phone = (settings?.contact_phone || "").replace(/[^\d]/g, "");
  const waHref = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent("Ciao, ti scrivo da dotCasting.")}`
    : null;

  // Ordine cronologico crescente: la conversazione si legge dall'alto verso il basso.
  const list = useMemo(
    () =>
      [...(communications ?? [])].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ),
    [communications]
  );

  // All'apertura (e quando arrivano nuove comunicazioni) la vista resta sull'ultimo messaggio.
  useEffect(() => {
    if (isLoading || list.length === 0 || list.length === lastCount.current) return;
    lastCount.current = list.length;
    const id = requestAnimationFrame(() =>
      bottomRef.current?.scrollIntoView({ block: "end" })
    );
    return () => cancelAnimationFrame(id);
  }, [isLoading, list.length]);

  const handleOpen = (comm: Communication) => {
    if (!comm.read_at && !markRead.isPending) markRead.mutate(comm.id);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1040px] animate-fade-up flex-col pb-16">
      {/* Intestazione fissa */}
      <header className="sticky top-0 z-20 -mx-4 flex h-[126px] shrink-0 items-center justify-between bg-background px-4 md:-mx-8 md:px-8">
        <h1 className="font-display text-[21px] uppercase text-[#1a1a1a]">Comunicazioni</h1>
        {waHref && (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Scrivici su WhatsApp"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-[hsl(var(--whatsapp))] px-4 text-[15px] font-medium text-[hsl(var(--whatsapp-foreground))] transition-opacity hover:opacity-90 sm:pl-7 sm:pr-8"
          >
            <WhatsAppIcon className="h-6 w-6 shrink-0" />
            <span className="hidden sm:inline">Scrivici su WhatsApp</span>
          </a>
        )}
      </header>

      {/* Sfumatura sotto l'intestazione */}
      <div className="pointer-events-none sticky top-[126px] z-10 -mx-4 -mb-24 h-24 bg-gradient-to-b from-background to-transparent md:-mx-8" />

      {isLoading ? (
        <div className="space-y-3 pt-24">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full max-w-[632px] rounded-3xl" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 py-24">
          <p className="text-center font-display text-2xl uppercase leading-snug text-[#1a1a1a]">
            Nessuna comunicazione
            <br />
            Qui arriveranno gli avvisi dell'agenzia.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6 pt-24">
          {list.map((comm, i) => {
            const prev = list[i - 1];
            const newDay =
              !prev || !isSameDay(new Date(prev.created_at), new Date(comm.created_at));
            return (
              <div key={comm.id} className="flex flex-col gap-6">
                {newDay && <Pill>{dayLabel(comm.created_at)}</Pill>}
                <CommunicationCard
                  communication={comm}
                  agencyName={settings?.agency_name}
                  agencyLogoUrl={settings?.agency_logo_url}
                  agencyPhone={settings?.contact_phone}
                  onOpen={handleOpen}
                />
              </div>
            );
          })}
          <Pill>
            Le comunicazioni arrivano da {settings?.agency_name || "dotCasting"}: non è possibile
            rispondere qui.
          </Pill>
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
};

export default TalentCommunications;
