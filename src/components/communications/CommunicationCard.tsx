import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Check, Loader2, Upload, X } from "lucide-react";
import { format } from "date-fns";
import { getProfileTargetHref, type Communication } from "@/lib/communications";
import {
  useRespondAvailability,
  useUploadCommunicationMaterial,
} from "@/hooks/useCommunications";
import {
  ActionPill,
  AgencyAvatar,
  CommunicationBubble,
  renderBody,
} from "./CommunicationBubble";

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

/** Comunicazione ricevuta: immagine agenzia + bolla, senza spunte di lettura. */
export const CommunicationCard = ({
  communication,
  agencyName,
  agencyLogoUrl,
  agencyPhone,
  isNew,
  onOpen,
}: {
  communication: Communication;
  agencyName?: string | null;
  agencyLogoUrl?: string | null;
  agencyPhone?: string | null;
  isNew?: boolean;
  onOpen: (comm: Communication) => void;
}) => {
  const navigate = useNavigate();
  const respond = useRespondAvailability();
  const upload = useUploadCommunicationMaterial();
  const fileRef = useRef<HTMLInputElement>(null);
  const payload = communication.action_payload || {};
  const answered = !!communication.responded_at;

  const waNumber = ((payload.phone as string) || agencyPhone || "").replace(/[^\d]/g, "");

  const action = (() => {
    if (communication.action_type === "whatsapp" && waNumber) {
      const text = encodeURIComponent((payload.wa_text as string) || "");
      return (
        <ActionPill
          onClick={() => {
            onOpen(communication);
            window.open(`https://wa.me/${waNumber}?text=${text}`, "_blank", "noopener");
          }}
        >
          <ArrowUpRight className="h-5 w-5" />
          {(payload.label as string) || "Scrivici su WhatsApp"}
        </ActionPill>
      );
    }

    if (communication.action_type === "link") {
      return (
        <ActionPill
          onClick={() => {
            onOpen(communication);
            navigate(resolveHref(communication));
          }}
        >
          <ArrowUpRight className="h-5 w-5" />
          {(payload.label as string) || "Apri"}
        </ActionPill>
      );
    }

    if (communication.action_type === "upload" && !answered) {
      return (
        <>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) upload.mutate({ communication, file });
              e.target.value = "";
            }}
          />
          <ActionPill disabled={upload.isPending} onClick={() => fileRef.current?.click()}>
            {upload.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Upload className="h-5 w-5" />
            )}
            {(payload.label as string) || "Carica il materiale"}
          </ActionPill>
        </>
      );
    }

    if (communication.action_type === "availability" && !answered) {
      return (
        <div className="flex flex-wrap gap-2">
          <ActionPill
            disabled={respond.isPending}
            onClick={() => respond.mutate({ communication, response: "available" })}
          >
            <Check className="h-5 w-5" />
            Disponibile
          </ActionPill>
          <ActionPill
            disabled={respond.isPending}
            onClick={() => respond.mutate({ communication, response: "unavailable" })}
          >
            <X className="h-5 w-5" />
            Non disponibile
          </ActionPill>
        </div>
      );
    }

    return null;
  })();

  const bodyText = [
    communication.body ?? "",
    answered
      ? communication.response === "available"
        ? "\nHai risposto: disponibile"
        : communication.response === "unavailable"
          ? "\nHai risposto: non disponibile"
          : communication.response === "uploaded"
            ? `\nMateriale inviato${payload.file_name ? `: ${payload.file_name}` : ""}`
            : ""
      : "",
  ]
    .join("")
    .trim();

  return (
    <div
      className="flex w-full items-start gap-3"
      onMouseEnter={() => !communication.read_at && onOpen(communication)}
    >
      <AgencyAvatar logoUrl={agencyLogoUrl} name={agencyName} />
      <CommunicationBubble
        label={communication.title}
        body={renderBody(bodyText)}
        time={format(new Date(communication.created_at), "HH:mm")}
        isNew={isNew}
        action={action}
      />
    </div>
  );
};
