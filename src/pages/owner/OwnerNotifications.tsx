import { Link } from "react-router-dom";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useNotifications,
  useUnreadNotificationsCount,
  useMarkAllNotificationsAsRead,
  Notification,
} from "@/hooks/useNotifications";
import {
  getNotificationIcon,
  getNotificationTitle,
  getNotificationDescription,
  getNotificationTypeLabel,
} from "@/lib/notifications";
import { formatDistanceToNow, isToday, isYesterday, differenceInDays } from "date-fns";
import { it as itLocale } from "date-fns/locale";

const getGroupKey = (dateStr: string): string => {
  const d = new Date(dateStr);
  if (isToday(d)) return "Oggi";
  if (isYesterday(d)) return "Ieri";
  if (differenceInDays(new Date(), d) < 7) return "Questa settimana";
  return "Più vecchie";
};

const GROUP_ORDER = ["Oggi", "Ieri", "Questa settimana", "Più vecchie"];

const NotificationRow = ({ notification }: { notification: Notification }) => {
  const Icon = getNotificationIcon(notification.type);
  const isUnread = !notification.read_at;
  const title = getNotificationTitle(notification);
  const description = getNotificationDescription(notification);

  return (
    <Link
      to={`/owner/notifications/${notification.id}`}
      className={cn(
        "flex gap-4 p-4 rounded-2xl transition-colors border border-transparent hover:bg-muted/40 hover:border-border",
        isUnread && "bg-primary/5"
      )}
    >
      <div
        className={cn(
          "shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
          isUnread ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <p
            className={cn(
              "text-sm",
              isUnread ? "font-medium text-foreground" : "text-muted-foreground"
            )}
          >
            {title}
          </p>
          {isUnread && (
            <span className="shrink-0 w-2 h-2 bg-primary rounded-full mt-1.5" />
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>
        )}
        <p className="text-xs text-muted-foreground mt-2">
          {getNotificationTypeLabel(notification.type)} ·{" "}
          {formatDistanceToNow(new Date(notification.sent_at), {
            addSuffix: true,
            locale: itLocale,
          })}
        </p>
      </div>
    </Link>
  );
};

export const OwnerNotifications = () => {
  const { data: notifications, isLoading } = useNotifications();
  const unreadCount = useUnreadNotificationsCount();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const grouped: Record<string, Notification[]> = {};
  (notifications || []).forEach((n) => {
    const key = getGroupKey(n.sent_at);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(n);
  });

  return (
    <div className="space-y-6 animate-fade-up max-w-3xl">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-tenor uppercase tracking-wide text-2xl text-foreground">
            Notifiche
          </h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0
              ? `${unreadCount} non ${unreadCount === 1 ? "letta" : "lette"}`
              : "Sei in pari con le notifiche"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllAsRead.mutate()}>
            <Check className="h-4 w-4 mr-2" />
            Segna tutte come lette
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : !notifications || notifications.length === 0 ? (
        <div className="dc-card p-12 text-center">
          <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">Nessuna notifica</p>
        </div>
      ) : (
        <div className="space-y-8">
          {GROUP_ORDER.filter((g) => grouped[g]?.length).map((group) => (
            <section key={group}>
              <h2 className="font-tenor uppercase tracking-widest text-xs text-muted-foreground mb-3">
                {group}
              </h2>
              <div className="space-y-2">
                {grouped[group].map((n) => (
                  <NotificationRow key={n.id} notification={n} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnerNotifications;
