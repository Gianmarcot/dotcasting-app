import { it } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const mockApplications = [
  {
    id: "1",
    castingTitle: "Modella per Campagna Beauty",
    status: "submitted",
    submittedAt: "2025-02-01",
    company: "Beauty Brand",
  },
  {
    id: "2",
    castingTitle: "Attrice per Spot Fashion",
    status: "shortlisted",
    submittedAt: "2025-01-28",
    company: "Fashion House",
  },
  {
    id: "3",
    castingTitle: "Ballerina per Spot Fitness",
    status: "hold",
    submittedAt: "2025-01-25",
    company: "Fitness Co",
  },
];

const statusColors: Record<string, string> = {
  submitted: "bg-info text-info-foreground",
  shortlisted: "bg-success text-success-foreground",
  rejected: "bg-destructive text-destructive-foreground",
  hold: "bg-warning text-warning-foreground",
  callback: "bg-secondary text-secondary-foreground",
  booked: "bg-primary text-primary-foreground",
};

export const TalentApplications = () => {
  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {it.applications.title}
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitora lo stato delle tue candidature
        </p>
      </div>

      <div className="space-y-4">
        {mockApplications.map((app) => (
          <Card key={app.id} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium text-foreground">
                    {app.castingTitle}
                  </h3>
                  <p className="text-sm text-muted-foreground">{app.company}</p>
                  <p className="text-xs text-muted-foreground">
                    Inviata il {new Date(app.submittedAt).toLocaleDateString("it-IT")}
                  </p>
                </div>
                <Badge className={statusColors[app.status]}>
                  {it.applications.status[app.status as keyof typeof it.applications.status]}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TalentApplications;
