import { it } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Video } from "lucide-react";

const mockAuditions = [
  {
    id: "1",
    title: "Provino Campagna Beauty",
    casting: "Modella per Campagna Beauty",
    date: "2025-02-15T10:00:00",
    location: "Studio ABC, Via Roma 15, Milano",
    isVirtual: false,
    status: "confirmed",
  },
  {
    id: "2",
    title: "Video Call Spot Fashion",
    casting: "Attrice per Spot Fashion",
    date: "2025-02-18T14:30:00",
    location: null,
    isVirtual: true,
    virtualLink: "https://meet.google.com/abc-xyz",
    status: "invited",
  },
];

const statusColors: Record<string, string> = {
  invited: "bg-info text-info-foreground",
  confirmed: "bg-success text-success-foreground",
  declined: "bg-muted text-muted-foreground",
  reschedule_requested: "bg-warning text-warning-foreground",
};

export const TalentAuditions = () => {
  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {it.auditions.title}
        </h1>
        <p className="text-muted-foreground mt-1">
          I tuoi prossimi provini e appuntamenti
        </p>
      </div>

      <div className="space-y-4">
        {mockAuditions.map((audition) => (
          <Card key={audition.id} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">
                      {audition.title}
                    </h3>
                    <Badge className={statusColors[audition.status]}>
                      {it.auditions.status[audition.status as keyof typeof it.auditions.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {audition.casting}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(audition.date).toLocaleDateString("it-IT", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {audition.isVirtual ? (
                      <span className="flex items-center gap-1">
                        <Video className="h-4 w-4" />
                        {it.auditions.virtual}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {audition.location}
                      </span>
                    )}
                  </div>
                </div>

                {audition.status === "invited" && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      {it.auditions.decline}
                    </Button>
                    <Button size="sm">
                      {it.auditions.confirm}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TalentAuditions;
