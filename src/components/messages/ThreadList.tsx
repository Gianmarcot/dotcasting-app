import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { MessageThread } from "@/hooks/useMessages";

interface ThreadListProps {
  threads: MessageThread[];
  selectedThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  isLoading?: boolean;
}

export const ThreadList = ({
  threads,
  selectedThreadId,
  onSelectThread,
  isLoading,
}: ThreadListProps) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Ieri";
    } else if (diffDays < 7) {
      return date.toLocaleDateString("it-IT", { weekday: "short" });
    }
    return date.toLocaleDateString("it-IT", { day: "numeric", month: "short" });
  };

  if (isLoading) {
    return (
      <div className="space-y-2 p-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground p-8 text-center">
        <p>Nessuna conversazione</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {threads.map((thread) => {
        const participant = thread.otherParticipant;
        const name = participant
          ? `${participant.first_name || ""} ${participant.last_name || ""}`.trim() || "Utente"
          : "Utente";
        const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2);
        const lastMsgDate = thread.lastMessage?.created_at || thread.created_at;

        return (
          <button
            key={thread.id}
            onClick={() => onSelectThread(thread.id)}
            className={cn(
              "w-full flex items-start gap-3 p-4 text-left hover:bg-muted/50 transition-colors",
              selectedThreadId === thread.id && "bg-muted"
            )}
          >
            <Avatar className="h-12 w-12 shrink-0">
              <AvatarImage src={participant?.profile_photo_url || undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className={cn(
                  "font-medium truncate",
                  thread.unreadCount > 0 && "font-semibold"
                )}>
                  {name}
                </span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatDate(lastMsgDate)}
                </span>
              </div>
              {thread.casting && (
                <p className="text-xs text-primary truncate">
                  {thread.casting.title}
                </p>
              )}
              <p className={cn(
                "text-sm truncate mt-0.5",
                thread.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"
              )}>
                {thread.lastMessage?.body || "Nessun messaggio"}
              </p>
            </div>
            {thread.unreadCount > 0 && (
              <Badge className="shrink-0 rounded-full min-w-[20px] h-5 flex items-center justify-center">
                {thread.unreadCount}
              </Badge>
            )}
          </button>
        );
      })}
    </div>
  );
};
