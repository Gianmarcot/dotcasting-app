import { Bell, Check, Mail, Calendar, FileText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  useNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  Notification,
} from "@/hooks/useNotifications";
import { it } from "@/lib/i18n";
import { format, formatDistanceToNow } from "date-fns";
import { it as itLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";

const getNotificationIcon = (type: string) => {
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

const getNotificationTitle = (notification: Notification): string => {
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

const getNotificationDescription = (notification: Notification): string => {
  const payload = notification.payload_json as Record<string, string> | null;
  return payload?.message || payload?.description || "";
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

const NotificationItem = ({ notification, onMarkAsRead }: NotificationItemProps) => {
  const Icon = getNotificationIcon(notification.type);
  const isUnread = !notification.read_at;
  const title = getNotificationTitle(notification);
  const description = getNotificationDescription(notification);

  return (
    <div
      className={cn(
        "p-3 hover:bg-muted/50 transition-colors cursor-pointer",
        isUnread && "bg-primary/5"
      )}
      onClick={() => isUnread && onMarkAsRead(notification.id)}
    >
      <div className="flex gap-3">
        <div
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
            isUnread ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p
              className={cn(
                "text-sm truncate",
                isUnread ? "font-medium text-foreground" : "text-muted-foreground"
              )}
            >
              {title}
            </p>
            {isUnread && (
              <span className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-1.5" />
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {description}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(notification.sent_at), {
              addSuffix: true,
              locale: itLocale,
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export const NotificationBell = () => {
  const { data: notifications, isLoading } = useNotifications();
  const unreadCount = useUnreadNotificationsCount();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9"
          aria-label="Notifiche"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold text-sm">
            {it.notifications?.title || "Notifiche"}
          </h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto py-1 px-2 text-xs"
              onClick={handleMarkAllAsRead}
            >
              <Check className="h-3 w-3 mr-1" />
              {it.notifications?.markAllRead || "Segna tutte come lette"}
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {it.common.loading}
            </div>
          ) : notifications && notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {it.notifications?.empty || "Nessuna notifica"}
              </p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
