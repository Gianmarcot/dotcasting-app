import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, MapPin, Info } from "lucide-react";
import { format } from "date-fns";
import { it as itLocale } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppSettings } from "@/hooks/useAppSettings";
import { useTalentEngagement, useMarkEngagementOpened } from "@/hooks/useTalentEngagements";

const buildIcs = (title: string, start: Date, address: string | null) => {
  const stamp = (d: Date) => format(d, "yyyyMMdd'T'HHmmss");
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${title}`,
    address ? `LOCATION:${address}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
};

export const TalentCastingDetail = () => {
  const { engagementId } = useParams<{ engagementId: string }>();
  const navigate = useNavigate();
  const { data: engagement, isLoading } = useTalentEngagement(engagementId);
  const { data: settings } = useAppSettings();
  const markOpened = useMarkEngagementOpened();
  const marked = useRef<string | null>(null);

  useEffect(() => {
    if (engagementId && marked.current !== engagementId) {
      marked.current = engagementId;
      markOpened.mutate(engagementId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engagementId]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1040px] animate-fade-up space-y-6 pb-28">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  if (!engagement) {
    return (
      <div className="mx-auto w-full max-w-[1040px] animate-fade-up space-y-6 pb-28">
        <BackLink onClick={() => navigate("/talent/applications")} />
        <p className="mt-8 text-[#686868]">Ingaggio non trovato.</p>
      </div>
    );
  }

  const date = engagement.dateISO ? new Date(engagement.dateISO) : null;
  const address = engagement.venueAddress;
  const phone = settings?.contact_phone?.replace(/[^\d+]/g, "") ?? null;

  const addToCalendar = () => {
    if (!date) return;
    const blob = new Blob([buildIcs(engagement.title, date, address)], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${engagement.title}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const waHref = phone
    ? `https://wa.me/${phone.replace(/^\+/, "")}?text=${encodeURIComponent(
        `Ciao, scrivo per "${engagement.title}"${
          date ? ` del ${format(date, "d MMMM yyyy", { locale: itLocale })}` : ""
        }.`,
      )}`
    : null;

  return (
    <div className="mx-auto w-full max-w-[1040px] animate-fade-up space-y-6 pb-28">
      <BackLink onClick={() => navigate("/talent/applications")} />

      <h1 className="mt-6 font-display uppercase text-2xl md:text-3xl tracking-wide text-[#1a1a1a]">
        {engagement.title}
      </h1>
      {engagement.clientName && (
        <p className="mt-2 text-[15px] text-[#686868]">{engagement.clientName}</p>
      )}

      <div className="mt-8 flex flex-col lg:flex-row gap-4">
        {/* Left column */}
        <div className="flex-1 lg:max-w-[688px] space-y-4">
          {date && (
            <section className="bg-white rounded-3xl p-8 flex flex-col md:flex-row md:items-center gap-8">
              <CalendarDays className="h-16 w-16 shrink-0 stroke-[0.75] text-[#1a1a1a]" />
              <div className="flex-1 flex flex-col gap-2">
                <span className="text-[15px] text-[#686868]">Quando</span>
                <span className="font-display uppercase text-base text-[#1a1a1a]">
                  {format(date, "d MMMM yyyy", { locale: itLocale })}
                </span>
                {engagement.hasTime && (
                  <span className="text-base text-[#1a1a1a]">
                    Ore {format(date, "HH.mm")}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={addToCalendar}
                className="h-12 shrink-0 rounded-full border border-[#c7c7c7] bg-white/30 backdrop-blur-[4px] pl-7 pr-8 text-[15px] font-medium text-[#1a1a1a]"
              >
                Aggiungi al calendario
              </button>
            </section>
          )}

          {address && (
            <section className="bg-white rounded-3xl p-8">
              <div className="flex items-start gap-8">
                <MapPin className="h-16 w-16 shrink-0 stroke-[0.75] text-[#1a1a1a]" />
                <div className="flex flex-col gap-2 min-w-0">
                  <span className="text-[15px] text-[#686868]">Location</span>
                  {engagement.venueName && (
                    <span className="font-display uppercase text-base text-[#1a1a1a]">
                      {engagement.venueName}
                    </span>
                  )}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-base text-[#1a1a1a] underline break-words"
                  >
                    {address}
                  </a>
                </div>
              </div>
              <div className="mt-8 rounded-2xl overflow-hidden">
                <iframe
                  title="Mappa della location"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
                  className="w-full h-[300px] border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </section>
          )}
        </div>

        {/* Right column */}
        {(engagement.instructions || waHref) && (
          <div className="w-full lg:w-[336px] shrink-0">
            <section className="bg-white rounded-3xl p-8 flex flex-col gap-8">
              <Info className="h-16 w-16 stroke-[0.75] text-[#1a1a1a]" />
              {engagement.instructions && (
                <div className="flex flex-col gap-2">
                  <span className="text-[15px] text-[#686868]">Istruzioni</span>
                  <p className="text-base text-[#1a1a1a] whitespace-pre-wrap">
                    {engagement.instructions}
                  </p>
                </div>
              )}
              {waHref && (
                <>
                  <div className="h-px bg-divider" />
                  <p className="text-base text-[#1a1a1a]">
                    Per qualsiasi dubbio scrivici su WhatsApp.
                  </p>
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noreferrer"
                    className="h-12 w-full rounded-full bg-[#40a961] pl-7 pr-8 flex items-center justify-center gap-2 text-[15px] font-medium text-white"
                  >
                    <WhatsAppIcon />
                    {settings?.contact_phone}
                  </a>
                </>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

const BackLink = ({ onClick }: { onClick: () => void }) => (
  <button type="button" onClick={onClick} className="flex items-center gap-3 text-[#1a1a1a]">
    <ArrowLeft className="h-5 w-5" />
    <span className="underline text-[15px]">Tutti i casting</span>
  </button>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.347-.347.52-.52.174-.174.232-.298.347-.497.116-.198.058-.372-.03-.52-.087-.15-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z" />
    <path d="M20.52 3.449A11.86 11.86 0 0 0 12.05 0C5.495 0 .16 5.334.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.86 11.86 0 0 0 5.744 1.463h.005c6.554 0 11.89-5.335 11.892-11.893a11.82 11.82 0 0 0-3.426-8.467zM12.055 21.785h-.004a9.86 9.86 0 0 1-5.024-1.376l-.36-.214-3.741.981.999-3.648-.235-.374a9.83 9.83 0 0 1-1.51-5.26c.002-5.45 4.437-9.884 9.887-9.884a9.82 9.82 0 0 1 6.988 2.898 9.82 9.82 0 0 1 2.892 6.994c-.003 5.45-4.438 9.883-9.892 9.883z" />
  </svg>
);

export default TalentCastingDetail;
