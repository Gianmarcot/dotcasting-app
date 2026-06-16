import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Film, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useActiveCastingsWithProgress } from "@/hooks/useOwnerDashboard";

export const ActiveCastingsList = () => {
  const navigate = useNavigate();
  const { data: castings = [], isLoading } = useActiveCastingsWithProgress();

  return (
    <Card className="dc-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Film className="h-5 w-5" />
          Casting attivi
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/owner/castings")}
          className="text-muted-foreground"
        >
          Vedi tutti
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        ) : castings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Film className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>Nessun casting attivo</p>
          </div>
        ) : (
          <div className="space-y-5">
            {castings.map((c) => (
              <div
                key={c.id}
                onClick={() => navigate(`/owner/castings/${c.id}`)}
                className="cursor-pointer rounded-xl p-3 -mx-3 hover:bg-muted/40 transition-colors"
              >
                <p className="font-medium text-foreground">{c.title}</p>
                {c.roles.length === 0 ? (
                  <p className="text-xs text-muted-foreground mt-1">Nessun ruolo</p>
                ) : (
                  <div className="mt-2 space-y-2">
                    {c.roles.map((r) => {
                      const pct = r.total > 0 ? (r.confirmed / r.total) * 100 : 0;
                      return (
                        <div key={r.id} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-foreground truncate">{r.name}</span>
                            <span className="text-muted-foreground shrink-0 ml-2">
                              {r.confirmed}/{r.total} confermati
                            </span>
                          </div>
                          <Progress value={pct} className="h-1.5" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
