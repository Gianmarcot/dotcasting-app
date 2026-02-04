import { it } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, MapPin, Video, Clock } from "lucide-react";

const mockAuditions = [
  {
    id: "1",
    title: "Provino Campagna Beauty",
    casting: "Modella per Campagna Beauty",
    date: "2025-02-15",
    time: "09:00 - 18:00",
    location: "Studio ABC, Via Roma 15, Milano",
    isVirtual: false,
    slotsBooked: 12,
    slotsTotal: 20,
  },
  {
    id: "2",
    title: "Video Call Spot Fashion",
    casting: "Attrice per Spot Fashion",
    date: "2025-02-18",
    time: "14:00 - 17:00",
    location: null,
    isVirtual: true,
    slotsBooked: 8,
    slotsTotal: 10,
  },
];

export const OwnerAuditions = () => {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-foreground">
            {it.backoffice.auditionScheduling}
          </h1>
          <p className="text-muted-foreground mt-1">
            Programma e gestisci i provini
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuovo Provino
        </Button>
      </div>

      <div className="space-y-4">
        {mockAuditions.map((audition) => (
          <Card key={audition.id} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="text-foreground text-lg">
                    {audition.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {audition.casting}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(audition.date).toLocaleDateString("it-IT", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {audition.time}
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

                <div className="text-right">
                  <p className="text-2xl font-semibold text-foreground">
                    {audition.slotsBooked}/{audition.slotsTotal}
                  </p>
                  <p className="text-xs text-muted-foreground">slot prenotati</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OwnerAuditions;
