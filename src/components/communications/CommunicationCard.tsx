import { useRef } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, Check, CheckCheck, Link2, Loader2, Upload, X } from "lucide-react";
import { format } from "date-fns";
import { it as itLocale } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

const ACTION_CHIP: Record<string, { icon: typeof Upload; label: string }> = {
  upload: { icon: Upload, label: "Materiale richiesto" },
  link: { icon: Link2, label: "Rimando al profilo" },
  availability: { icon: CalendarClock, label: "Disponibilità richiesta" },
};

/**
 * Comunicazione ricevuta, resa come bolla di chat in arrivo (allineata a sinistra),
 * con lo stesso stile della chat lato agenzia.
 */
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
  const chip = communication.action_type ? ACTION_CHIP[communication.action_type] : undefined;
  const ChipIcon = chip?.icon;

  return (
    <div className="flex max-w-[80%] gap-2">
      <Avatar className="mt-0.5 h-8 w-8 shrink-0">
        <AvatarFallback className="bg-white text-xs text-foreground">
          <Icon className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>

      <article
        onMouseEnter={() => isUnread && onOpen(communication)}
        onFocus={() => isUnread && onOpen(communication)}
        tabIndex={0}
        className={cn(
          "min-w-0 rounded-2xl rounded-tl-sm bg-muted px-4 py-2 outline-none",
          isUnread && "ring-1 ring-primary/20",
          pending && "ring-1 ring-primary/40",
          overdue && "ring-1 ring-destructive/50"
        )}
      >
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {getCommunicationTypeLabel(communication.type)}
        </p>
        <p
          className={cn(
            "text-sm leading-5",
            isUnread ? "font-medium text-foreground" : "text-foreground/85"
          )}
        >
          {communication.title}
        </p>

        {communication.body && (
          <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-5 text-muted-foreground">
            {communication.body}
          </p>
        )}

        {communication.action_type === "availability" && payload.period_start && (
          <p className="mt-1 text-sm text-foreground/80">
            Periodo:{" "}
            {formatPeriod(payload.period_start as string, payload.period_end as string)}
          </p>
        )}

        {communication.action_type === "upload" && payload.material && (
          <p className="mt-1 text-sm text-foreground/80">Serve: {String(payload.material)}</p>
        )}

        {communication.deadline && !answered && (
          <p className={cn("mt-1 text-sm", overdue ? "text-destructive" : "text-foreground/80")}>
            entro il {format(new Date(communication.deadline), "d MMMM", { locale: itLocale })}
          </p>
        )}

        {chip && ChipIcon && !answered && (
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-background px-2.5 py-1 text-[11px] text-foreground/80">
            <ChipIcon className="h-3 w-3" />
            {chip.label}
          </span>
        )}

        {answered && (
          <p className="mt-2 flex items-start gap-1.5 text-sm text-foreground/80">
            <CheckCheck className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              {communication.response === "available" && "Hai risposto: disponibile"}
              {communication.response === "unavailable" && "Hai risposto: non disponibile"}
              {communication.response === "uploaded" &&
                `Materiale inviato${payload.file_name ? `: ${payload.file_name}` : ""}`}{" "}
              ·{" "}
              {format(new Date(communication.responded_at!), "d MMMM, HH:mm", {
                locale: itLocale,
              })}
            </span>
          </p>
        )}

        {/* Azioni */}
        {!answered && communication.action_type && (
          <div className="mt-3 flex flex-wrap gap-2">
            {communication.action_type === "link" && (
              <Button asChild size="sm" onClick={() => onOpen(communication)}>
                <Link to={resolveHref(communication)}>{(payload.label as string) || "Apri"}</Link>
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
                  {upload.isPending ? <Loader2 className="animate-spin" /> : <Upload />}
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

        <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
          {format(new Date(communication.created_at), "HH:mm")}
          {isUnread ? (
            <span aria-label="Non letta" className="h-1.5 w-1.5 rounded-full bg-primary" />
          ) : (
            <CheckCheck className="h-3 w-3" />
          )}
        </p>
      </article>
    </div>
  );
};
