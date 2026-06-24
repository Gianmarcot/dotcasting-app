import { useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useNotifications,
  useMarkNotificationAsRead,
} from "@/hooks/useNotifications";
import {
  getNotificationIcon,
  getNotificationTitle,
  getNotificationDescription,
  getNotificationTypeLabel,
  getNotificationActionHref,
} from "@/lib/notifications";
import { format } from "date-fns";
import { it as itLocale } from "date-fns/locale";

export const OwnerNotificationDetail = () => {
  const { notificationId } = useParams<{ notificationId: string }>();
  const navigate = useNavigate();
  const { data: notifications, isLoading } = useNotifications();
  const markAsRead = useMarkNotificationAsRead();

  const notification = useMemo(
    () => notifications?.find((n) => n.id === notificationId),
    [notifications, notificationId]
  );

  useEffect(() => {
    if (notification && !notification.read_at) {
      markAsRead.mutate(notification.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notification?.id]);

  if (isLoading) {
    return (
      <div className="max-w-3xl space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="max-w-3xl space-y-6 animate-fade-up">
        <Button variant="ghost" size="sm" onClick={() => navigate("/owner/notifications")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Tutte le notifiche
        </Button>
        <div className="dc-card p-12 text-center text-muted-foreground">
          Notifica non trovata
        </div>
      </div>
    );
  }

  const Icon = getNotificationIcon(notification.type);
  const title = getNotificationTitle(notification);
  const description = getNotificationDescription(notification);
  const action = getNotificationActionHref(notification, "/owner");
  const payload = notification.payload_json as Record<string, unknown> | null;
  const sentAt = new Date(notification.sent_at);

  const payloadEntries = payload
    ? Object.entries(payload).filter(([, v]) => v !== null && v !== undefined && v !== "")
    : [];

  return (
    <div className="max-w-3xl space-y-6 animate-fade-up">
      <Button variant="ghost" size="sm" onClick={() => navigate("/owner/notifications")}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Tutte le notifiche
      </Button>

      <div className="dc-card p-8 space-y-6">
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-tenor uppercase tracking-widest text-xs text-muted-foreground">
              {getNotificationTypeLabel(notification.type)}
            </p>
            <h1 className="font-tenor uppercase tracking-wide text-2xl md:text-3xl text-foreground mt-1">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              {format(sentAt, "EEEE d MMMM yyyy 'alle' HH:mm", { locale: itLocale })}
            </p>
          </div>
        </div>

        {description && (
          <div className="border-t border-border pt-6">
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {description}
            </p>
          </div>
        )}

        {payloadEntries.length > 0 && (
          <div className="border-t border-border pt-6">
            <h2 className="font-tenor uppercase tracking-widest text-xs text-muted-foreground mb-3">
              Dettagli
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-x-4 gap-y-2 text-sm">
              {payloadEntries.map(([key, value]) => (
                <div key={key} className="contents">
                  <dt className="text-muted-foreground capitalize">
                    {key.replace(/_/g, " ")}
                  </dt>
                  <dd className="text-foreground break-words">{String(value)}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {action && (
          <div className="border-t border-border pt-6">
            <Button asChild>
              <Link to={action.href}>
                {action.label}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerNotificationDetail;
