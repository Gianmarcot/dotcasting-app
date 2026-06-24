import { Bell, Mail, Calendar, FileText, Users, LucideIcon } from "lucide-react";
import type { Notification } from "@/hooks/useNotifications";

export const getNotificationIcon = (type: string): LucideIcon => {
  switch (type) {
    case "invitation":
      return Mail;
    case "audition":
      return Calendar;
    case "application":
      return FileText;
    case "message":
      return Users;
    default:
      return Bell;
  }
};

export const getNotificationTypeLabel = (type: string): string => {
  switch (type) {
    case "invitation":
      return "Invito";
    case "audition":
      return "Provino";
    case "application":
      return "Candidatura";
    case "message":
      return "Messaggio";
    default:
      return "Notifica";
  }
};

export const getNotificationTitle = (notification: Notification): string => {
  const payload = notification.payload_json as Record<string, string> | null;
  switch (notification.type) {
    case "invitation":
      return payload?.casting_title
        ? `Invito al casting: ${payload.casting_title}`
        : "Nuovo invito a un casting";
    case "audition":
      return "Provino programmato";
    case "application":
      return payload?.status
        ? `Candidatura ${payload.status}`
        : "Aggiornamento candidatura";
    case "message":
      return "Nuovo messaggio";
    default:
      return "Notifica";
  }
};

export const getNotificationDescription = (notification: Notification): string => {
  const payload = notification.payload_json as Record<string, string> | null;
  return payload?.message || payload?.description || "";
};

export const getNotificationActionHref = (
  notification: Notification,
  basePath: "/owner" | "/talent" = "/owner"
): { href: string; label: string } | null => {
  const payload = notification.payload_json as Record<string, string> | null;
  if (!payload) return null;
  if (payload.casting_id) {
    return { href: `${basePath}/castings/${payload.casting_id}`, label: "Vai al casting" };
  }
  if (payload.thread_id) {
    return { href: `${basePath}/messages`, label: "Apri messaggi" };
  }
  if (payload.application_id) {
    return { href: `${basePath}/applications`, label: "Vedi candidature" };
  }
  return null;
};
