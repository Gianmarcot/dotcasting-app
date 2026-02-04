import { it } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export const OwnerSettings = () => {
  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {it.backoffice.settings}
        </h1>
        <p className="text-muted-foreground mt-1">
          Configura la piattaforma
        </p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-12 text-center">
          <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Le impostazioni saranno disponibili a breve
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OwnerSettings;
