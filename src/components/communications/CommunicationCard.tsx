import { useRef } from "react";
import { Link } from "react-router-dom";
import { Check, Loader2, Upload, X } from "lucide-react";
import { formatDistanceToNow, format, differenceInDays } from "date-fns";
import { it as itLocale } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  formatPeriod,
  getCommunicationIcon,
  getCommunicationTypeLabel,
  getProfileTargetHref,
  isOverdue,
  isPending,
  type Communication,
} from "@/lib/communications";
import {
  useRespondAvailability,
  useUploadCommunicationMaterial,
} from "@/hooks/useCommunications";

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return differenceInDays(new Date(), d) < 7
    ? formatDistanceToNow(d, { addSuffix: true, locale: itLocale })
    : format(d, "d MMMM yyyy", { locale: itLocale });
};

const resolveHref = (comm: Communication): string => {
  const p = comm.action_payload || {};
  if (typeof p.href === "string" && p.href) return p.href;
  const base = getProfileTargetHref(p.target as string | undefined);
  if (p.photos_category) {
    const [path, hash] = base.split("#");
    return `${path}?photos=${p.photos_category}${hash ? `#${hash}` : ""}`;
  }
  return base;
};

export const CommunicationCard = ({
  communication,
  onOpen,
}: {
  communication: Communication;
  onOpen: (comm: Communication) => void;
}) => {
  const Icon = getCommunicationIcon(communication);
  const isUnread = !communication.read_at;
  const pending = isPending(communication);
  const overdue = isOverdue(communication);
  const respond = useRespondAvailability();
  const upload = useUploadCommunicationMaterial();
  const fileRef = useRef<HTMLInputElement>(null);
  const payload = communication.action_payload || {};

  const answered = !!communication.responded_at;

  return (
    <article
      onMouseEnter={() => isUnread && onOpen(communication)}
      onFocus={() => isUnread && onOpen(communication)}
      className={cn(
        "dc-card p-5 transition-shadow",
        pending && "ring-1 ring-primary/30",
        overdue && "ring-1 ring-destructive/40"
      )}
    >
      <div className="flex gap-4">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            isUnread ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p
              className={cn(
                "text-[15px] leading-5",
                isUnread ? "font-medium text-foreground" : "text-foreground/80"
              )}
            >
              {communication.title}
            </p>
            {isUnread && (
              <span
                aria-label="Non letta"
                className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
              />
            )}
          </div>

          {communication.body && (
            <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">
              {communication.body}
            </p>
          )}

          {communication.action_type === "availability" && payload.period_start && (
            <p className="mt-1 text-sm text-foreground/80">
              Periodo: {formatPeriod(payload.period_start as string, payload.period_end as string)}
            </p>
          )}

          {communication.action_type === "upload" && payload.material && (
            <p className="mt-1 text-sm text-foreground/80">Serve: {String(payload.material)}</p>
          )}

          <p className="mt-2 text-xs text-muted-foreground">
            {getCommunicationTypeLabel(communication.type)} ·{" "}
            {formatDate(communication.created_at)}
            {communication.deadline && !answered && (
              <>
                {" · "}
                <span className={cn(overdue && "text-destructive")}>
                  entro il{" "}
                  {format(new Date(communication.deadline), "d MMMM", { locale: itLocale })}
                </span>
              </>
            )}
          </p>

          {answered && (
            <p className="mt-2 text-sm text-foreground/80">
              {communication.response === "available" && "Hai risposto: disponibile"}
              {communication.response === "unavailable" && "Hai risposto: non disponibile"}
              {communication.response === "uploaded" &&
                `Materiale inviato${payload.file_name ? `: ${payload.file_name}` : ""}`}{" "}
              ·{" "}
              {format(new Date(communication.responded_at!), "d MMMM yyyy, HH:mm", {
                locale: itLocale,
              })}
            </p>
          )}

          {/* Azioni */}
          {!answered && communication.action_type && (
            <div className="mt-4 flex flex-wrap gap-2">
              {communication.action_type === "link" && (
                <Button asChild size="sm" onClick={() => onOpen(communication)}>
                  <Link to={resolveHref(communication)}>
                    {(payload.label as string) || "Apri"}
                  </Link>
                </Button>
              )}

              {communication.action_type === "upload" && (
                <>
                  <input
                    ref={fileRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (file) upload.mutate({ communication, file });
                    }}
                  />
                  <Button
                    size="sm"
                    disabled={upload.isPending}
                    onClick={() => fileRef.current?.click()}
                  >
                    {upload.isPending ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Upload />
                    )}
                    Carica il materiale
                  </Button>
                </>
              )}

              {communication.action_type === "availability" && (
                <>
                  <Button
                    size="sm"
                    disabled={respond.isPending}
                    onClick={() => respond.mutate({ communication, response: "available" })}
                  >
                    <Check />
                    Disponibile
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={respond.isPending}
                    onClick={() => respond.mutate({ communication, response: "unavailable" })}
                  >
                    <X />
                    Non disponibile
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
