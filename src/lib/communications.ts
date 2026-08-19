import {
  Bell,
  CalendarClock,
  CalendarCheck,
  Camera,
  FileText,
  Megaphone,
  Upload,
  UserCog,
  type LucideIcon,
} from "lucide-react";

export type CommunicationActionType = "link" | "upload" | "availability" | "whatsapp" | null;

export interface CommunicationActionPayload {
  href?: string;
  label?: string;
  /** categoria foto o gruppo profilo di destinazione */
  target?: string;
  /** richiesta materiale */
  material?: string;
  file_path?: string;
  file_name?: string;
  /** richiesta disponibilità */
  period_start?: string;
  period_end?: string;
  [key: string]: unknown;
}

export interface Communication {
  id: string;
  talent_user_id: string;
  thread_id: string | null;
  message_id: string | null;
  batch_id: string | null;
  type: string;
  title: string;
  body: string | null;
  severity: string;
  action_type: CommunicationActionType;
  action_payload: CommunicationActionPayload;
  deadline: string | null;
  response: string | null;
  response_note: string | null;
  responded_at: string | null;
  resolved_at: string | null;
  dedupe_key: string | null;
  read_at: string | null;
  created_by_user_id: string | null;
  created_at: string;
  updated_at: string;
}

export const COMMUNICATION_ICONS: Record<string, LucideIcon> = {
  profile_incomplete: UserCog,
  photos_missing: Camera,
  documents: FileText,
  engagement_new: CalendarCheck,
  engagement_updated: CalendarClock,
  agency_message: Megaphone,
  material_request: Upload,
  availability_request: CalendarClock,
};

export const getCommunicationIcon = (comm: Communication): LucideIcon => {
  if (comm.action_type === "upload") return COMMUNICATION_ICONS.material_request;
  if (comm.action_type === "availability") return COMMUNICATION_ICONS.availability_request;
  return COMMUNICATION_ICONS[comm.type] ?? Bell;
};

export const COMMUNICATION_TYPE_LABELS: Record<string, string> = {
  profile_incomplete: "Profilo",
  photos_missing: "Fotografie",
  documents: "Documenti",
  engagement_new: "Ingaggio",
  engagement_updated: "Ingaggio",
  agency_message: "Agenzia",
};

export const getCommunicationTypeLabel = (type: string) =>
  COMMUNICATION_TYPE_LABELS[type] ?? "Comunicazione";

/** Una comunicazione con scadenza resta in evidenza finché non è evasa. */
export const isPending = (comm: Communication) =>
  !!comm.deadline && !comm.resolved_at && !comm.responded_at;

export const isOverdue = (comm: Communication) =>
  isPending(comm) && !!comm.deadline && new Date(comm.deadline).getTime() < Date.now();

/** Ordina: prima le comunicazioni da evadere, poi per data decrescente. */
export const sortCommunications = (list: Communication[]) =>
  [...list].sort((a, b) => {
    const pa = isPending(a) ? 1 : 0;
    const pb = isPending(b) ? 1 : 0;
    if (pa !== pb) return pb - pa;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

/** Sezioni del profilo indirizzabili da un'azione. */
export const PROFILE_TARGETS: { value: string; label: string; href: string }[] = [
  { value: "head", label: "Dati principali", href: "/talent/profile#section-head" },
  { value: "contacts", label: "Contatti", href: "/talent/profile#section-contacts" },
  { value: "address", label: "Indirizzi", href: "/talent/profile#section-address" },
  { value: "documents", label: "Documenti e fiscalità", href: "/talent/profile#section-documents" },
  { value: "media", label: "Galleria e media", href: "/talent/profile#section-media" },
  { value: "physical", label: "Misure e caratteristiche", href: "/talent/profile#section-physical" },
  { value: "roles", label: "Ruoli", href: "/talent/profile#section-roles" },
  { value: "bio", label: "Biografia", href: "/talent/profile#section-bio" },
  { value: "work", label: "Lavoro e trasferte", href: "/talent/profile#section-work" },
];

export const getProfileTargetHref = (target?: string) =>
  PROFILE_TARGETS.find((t) => t.value === target)?.href ?? "/talent/profile";

export const formatPeriod = (start?: string, end?: string) => {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
  if (start && end) return `dal ${fmt(start)} al ${fmt(end)}`;
  if (start) return `dal ${fmt(start)}`;
  return "";
};
