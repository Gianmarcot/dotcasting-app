import { it } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export const OwnerMessages = () => {
  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {it.backoffice.messagingCenter}
        </h1>
        <p className="text-muted-foreground mt-1">
          Comunicazioni con i talenti
        </p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-12 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{it.messages.empty}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OwnerMessages;
