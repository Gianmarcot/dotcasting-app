import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Film, UserCheck, UserX, Share2, CheckCircle2 } from "lucide-react";
import { useOwnerRecentActivity, OwnerActivityItem } from "@/hooks/useOwnerDashboard";

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffHours < 1) return "Adesso";
  if (diffHours < 24) return `${diffHours}h fa`;
  if (diffDays === 1) return "Ieri";
  if (diffDays < 7) return `${diffDays}g fa`;
  return date.toLocaleDateString("it-IT", { day: "numeric", month: "short" });
};

const renderIcon = (item: OwnerActivityItem) => {
  if (item.type === "casting_created") return <Film className="h-4 w-4" />;
  if (item.type === "round_shared") return <Share2 className="h-4 w-4" />;
  if (item.type === "round_selection_confirmed") return <CheckCircle2 className="h-4 w-4" />;
  if (item.type === "invitation_response") {
    return item.title.includes("accettato") ? (
      <UserCheck className="h-4 w-4" />
    ) : (
      <UserX className="h-4 w-4" />
    );
  }
  return <Clock className="h-4 w-4" />;
};

export const RecentActivityFeed = () => {
  const { data: items = [], isLoading } = useOwnerRecentActivity(10);

  return (
    <Card className="dc-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Attività recente
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>Nessuna attività recente</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((it) => (
              <div
                key={it.id}
                className="flex items-start gap-3 py-2 border-b border-border last:border-0"
              >
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 text-foreground">
                  {renderIcon(it)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{it.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{it.description}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatDate(it.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
