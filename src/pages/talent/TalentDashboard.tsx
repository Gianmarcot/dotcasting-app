import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { it } from "@/lib/i18n";
import { useAuth } from "@/contexts/AuthContext";

import castingBeauty from "@/assets/casting-beauty.jpg";
import castingFashion from "@/assets/casting-fashion.jpg";
import castingFitness from "@/assets/casting-fitness.jpg";

// Mock data for castings
const mockCastings = [
  {
    id: "1",
    title: "Modella per Campagna Beauty",
    budget: "900 €",
    location: "Milano, Italia",
    period: "12/03/2025 - 14/03/2025",
    image: castingBeauty,
  },
  {
    id: "2",
    title: "Attrice per Spot Fashion",
    budget: "1.200 €",
    location: "Milano, Italia",
    period: "12/03/2025 - 14/03/2025",
    image: castingFashion,
  },
  {
    id: "3",
    title: "Ballerina per Spot Fitness",
    budget: "1.500 €",
    location: "Milano, Italia",
    period: "12/03/2025 - 14/03/2025",
    image: castingFitness,
  },
];

export const TalentDashboard = () => {
  const { user } = useAuth();
  const userName = user?.email?.split("@")[0] || "Utente";
  const activeApplications = 1;
  const profileCompletion = 90;

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header with stats */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        {/* Welcome */}
        <div className="flex-shrink-0">
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">
            {it.dashboard.welcome}
          </p>
          <h1 className="text-4xl text-foreground capitalize">
            {userName}
          </h1>
        </div>

        {/* Stats cards */}
        <div className="flex flex-1 gap-4 lg:justify-end">
          {/* Active applications */}
          <Card className="bg-secondary text-secondary-foreground flex-1 max-w-xs border-0">
            <CardContent className="p-5 flex justify-between items-center">
              <div>
                <p className="text-xs uppercase tracking-wider opacity-80 mb-1">
                  {it.dashboard.activeApplications.split(" ").map((w, i) => (
                    <span key={i} className="block">{w}</span>
                  ))}
                </p>
                <button className="text-sm underline underline-offset-2 opacity-80 hover:opacity-100 transition-opacity">
                  {it.dashboard.view}
                </button>
              </div>
              <span className="text-5xl font-light">{activeApplications}</span>
            </CardContent>
          </Card>

          {/* Profile completion */}
          <Card className="bg-charcoal text-charcoal-foreground flex-1 max-w-sm border-0">
            <CardContent className="p-5 flex justify-between items-center">
              <div>
                <p className="text-xs uppercase tracking-wider opacity-80 mb-1">
                  {it.dashboard.profileCompletion}
                </p>
                <p className="text-xs opacity-70 mb-2 max-w-[180px]">
                  {it.dashboard.profileCompletionHint}
                </p>
                <button className="text-sm underline underline-offset-2 opacity-80 hover:opacity-100 transition-opacity">
                  {it.dashboard.goToProfile}
                </button>
              </div>
              <span className="text-5xl font-light">{profileCompletion}%</span>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Castings section */}
      <div className="space-y-4">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground">
          {it.dashboard.castingsForYou}
        </h2>

        {/* Search */}
        <div className="relative max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={it.dashboard.searchPlaceholder}
            className="pl-11 bg-card border-0 h-12"
          />
        </div>

        {/* Casting list */}
        <div className="space-y-4 mt-6">
          {mockCastings.map((casting) => (
            <Card key={casting.id} className="border-0 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  <div className="sm:w-40 h-32 sm:h-auto flex-shrink-0">
                    <img
                      src={casting.image}
                      alt={casting.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <h3 className="text-xl text-foreground">
                        {casting.title}
                      </h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>
                          <span className="font-medium text-foreground">{it.dashboard.budget}:</span>{" "}
                          {casting.budget}
                        </p>
                        <p>
                          <span className="font-medium text-foreground">{it.dashboard.location}:</span>{" "}
                          {casting.location}
                        </p>
                        <p>
                          <span className="font-medium text-foreground">{it.dashboard.period}:</span>{" "}
                          {casting.period}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                      <button className="text-sm text-foreground underline underline-offset-2 hover:text-primary transition-colors">
                        {it.dashboard.viewDetails}
                      </button>
                      <Button variant="castingAction" size="default">
                        {it.dashboard.applyNow}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TalentDashboard;
