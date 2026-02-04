import { it } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Target } from "lucide-react";

export const OwnerTargets = () => {
  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {it.backoffice.targets}
        </h1>
        <p className="text-muted-foreground mt-1">
          Crea target di ricerca e gestisci le shortlist
        </p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-12 text-center">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Seleziona un casting per gestire i target e le shortlist
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OwnerTargets;
