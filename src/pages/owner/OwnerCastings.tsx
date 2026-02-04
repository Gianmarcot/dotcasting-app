import { it } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreVertical, Calendar, MapPin, Euro } from "lucide-react";

const mockCastings = [
  {
    id: "1",
    title: "Modella per Campagna Beauty",
    company: "Beauty Brand Srl",
    status: "active",
    applicationsCount: 24,
    locations: ["Milano"],
    compensation: 900,
    dates: "12-14 Mar 2025",
  },
  {
    id: "2",
    title: "Attrice per Spot Fashion",
    company: "Fashion House",
    status: "active",
    applicationsCount: 18,
    locations: ["Milano"],
    compensation: 1200,
    dates: "20-22 Mar 2025",
  },
  {
    id: "3",
    title: "Ballerina per Spot Fitness",
    company: "Fitness Co",
    status: "draft",
    applicationsCount: 0,
    locations: ["Roma"],
    compensation: 1500,
    dates: "01-03 Apr 2025",
  },
];

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-success/20 text-success",
  closed: "bg-destructive/20 text-destructive",
};

export const OwnerCastings = () => {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {it.backoffice.castings}
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestisci i casting della piattaforma
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {it.backoffice.createCasting}
        </Button>
      </div>

      <div className="space-y-4">
        {mockCastings.map((casting) => (
          <Card key={casting.id} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-foreground text-lg">
                      {casting.title}
                    </h3>
                    <Badge className={statusColors[casting.status]}>
                      {it.casting[casting.status as keyof typeof it.casting]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {casting.company}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {casting.locations.join(", ")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {casting.dates}
                    </span>
                    <span className="flex items-center gap-1">
                      <Euro className="h-4 w-4" />
                      {casting.compensation}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-semibold text-foreground">
                      {casting.applicationsCount}
                    </p>
                    <p className="text-xs text-muted-foreground">candidature</p>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OwnerCastings;
