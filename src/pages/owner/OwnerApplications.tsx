import { it } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search, Filter, MoreVertical } from "lucide-react";

const mockApplications = [
  {
    id: "1",
    talent: { name: "Giulia Rossi", avatar: "" },
    casting: "Modella per Campagna Beauty",
    status: "submitted",
    submittedAt: "2025-02-04",
  },
  {
    id: "2",
    talent: { name: "Marco Bianchi", avatar: "" },
    casting: "Attore per Spot Fashion",
    status: "shortlisted",
    submittedAt: "2025-02-03",
  },
  {
    id: "3",
    talent: { name: "Sara Verdi", avatar: "" },
    casting: "Ballerina per Spot Fitness",
    status: "hold",
    submittedAt: "2025-02-03",
  },
  {
    id: "4",
    talent: { name: "Luca Ferrari", avatar: "" },
    casting: "Modello per Campagna Beauty",
    status: "rejected",
    submittedAt: "2025-02-02",
  },
];

const statusColors: Record<string, string> = {
  submitted: "bg-info/20 text-info",
  shortlisted: "bg-success/20 text-success",
  rejected: "bg-destructive/20 text-destructive",
  hold: "bg-warning/20 text-warning",
  callback: "bg-secondary/20 text-secondary",
  booked: "bg-primary/20 text-primary",
};

export const OwnerApplications = () => {
  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {it.backoffice.applications}
        </h1>
        <p className="text-muted-foreground mt-1">
          Gestisci tutte le candidature ricevute
        </p>
      </div>

      {/* Search and filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca candidature..."
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          {it.common.filter}
        </Button>
      </div>

      {/* Applications list */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {mockApplications.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-muted text-foreground text-sm">
                      {app.talent.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">
                      {app.talent.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {app.casting}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Badge className={statusColors[app.status]}>
                    {it.applications.status[app.status as keyof typeof it.applications.status]}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(app.submittedAt).toLocaleDateString("it-IT")}
                  </span>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OwnerApplications;
