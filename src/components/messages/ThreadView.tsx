import { useEffect, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import type { Message } from "@/hooks/useMessages";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

const MessageBubble = ({ message, isOwn }: MessageBubbleProps) => {
  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const senderName = message.sender
    ? `${message.sender.first_name || ""} ${message.sender.last_name || ""}`.trim()
    : "";
  const initials = senderName.split(" ").map(n => n[0]).join("").slice(0, 2) || "?";

  return (
    <div className={cn("flex gap-2 max-w-[80%]", isOwn ? "ml-auto flex-row-reverse" : "")}>
      {!isOwn && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={message.sender?.profile_photo_url || undefined} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "rounded-2xl px-4 py-2",
          isOwn
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-muted rounded-tl-sm"
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.body}</p>
        <p
          className={cn(
            "text-[10px] mt-1",
            isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          {formatTime(message.created_at)}
        </p>
      </div>
    </div>
  );
};

interface ThreadViewProps {
  messages: Message[];
  isLoading?: boolean;
}

export const ThreadView = ({ messages, isLoading }: ThreadViewProps) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.created_at).toLocaleDateString("it-IT", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  if (isLoading) {
    return (
      <div className="flex-1 p-4 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={cn("flex gap-2", i % 2 === 0 ? "" : "flex-row-reverse")}
          >
            {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full" />}
            <Skeleton className={cn("h-16 rounded-2xl", i % 2 === 0 ? "w-48" : "w-36")} />
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>Inizia la conversazione!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {Object.entries(groupedMessages).map(([date, msgs]) => (
        <div key={date} className="space-y-3">
          <div className="flex items-center justify-center">
            <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full capitalize">
              {date}
            </span>
          </div>
          <div className="space-y-3">
            {msgs.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender_user_id === user?.id}
              />
            ))}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};
