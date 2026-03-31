import { useState } from "react";
import { Search, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { it } from "@/lib/i18n";
import { useAuth } from "@/contexts/AuthContext";
import { TalentInvitationsSection } from "@/components/invitations/TalentInvitationsSection";
import { useExploreCastings, type ExploreCasting } from "@/hooks/useExploreCastings";
import { useTalentApplications } from "@/hooks/useTalentApplications";
import { ApplyToCastingDialog } from "@/components/castings/ApplyToCastingDialog";
import { CastingDetailDialog } from "@/components/castings/CastingDetailDialog";
import { format } from "date-fns";
import { it as itLocale } from "date-fns/locale";

import castingBeauty from "@/assets/casting-beauty.jpg";
import castingFashion from "@/assets/casting-fashion.jpg";
import castingFitness from "@/assets/casting-fitness.jpg";

// Fallback images for castings without cover images
const fallbackImages = [castingBeauty, castingFashion, castingFitness];

export const TalentDashboard = () => {
  const { user } = useAuth();
  const userName = user?.email?.split("@")[0] || "Utente";
  const [searchQuery, setSearchQuery] = useState("");
  const [applyingTo, setApplyingTo] = useState<ExploreCasting | null>(null);
  const [viewingCasting, setViewingCasting] = useState<ExploreCasting | null>(null);
  
  const { data: castings, isLoading: castingsLoading } = useExploreCastings(searchQuery);
  const { data: applications } = useTalentApplications();
  
  const activeApplicationsCount = applications?.filter(a => a.status !== "withdrawn").length || 0;
  const profileCompletion = 90;

  const getCastingImage = (casting: ExploreCasting, index: number) => {
    return casting.cover_image_url || fallbackImages[index % fallbackImages.length];
  };

  const formatCastingDates = (casting: ExploreCasting) => {
    if (!casting.start_date && !casting.end_date) return null;
    const start = casting.start_date 
      ? format(new Date(casting.start_date), "dd/MM/yyyy", { locale: itLocale })
      : "";
    const end = casting.end_date 
      ? format(new Date(casting.end_date), "dd/MM/yyyy", { locale: itLocale })
      : "";
    if (start && end) return `${start} - ${end}`;
    return start || end;
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header with stats */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        {/* Welcome */}
        <div className="flex-shrink-0 min-w-0">
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">{it.dashboard.welcome}</p>
          <h1 className="text-2xl sm:text-4xl text-foreground break-words">{userName}</h1>
        </div>

        {/* Stats cards */}
        <div className="flex flex-col sm:flex-row flex-1 gap-4 lg:justify-end">
          {/* Active applications */}
          <Card className="bg-secondary text-secondary-foreground flex-1 max-w-xs border-0">
            <CardContent className="p-5 flex justify-between items-center">
              <div>
                <p className="text-xs uppercase tracking-wider opacity-80 mb-1">
                  {it.dashboard.activeApplications.split(" ").map((w, i) => (
                    <span key={i} className="block">
                      {w}
                    </span>
                  ))}
                </p>
                <button className="text-sm underline underline-offset-2 opacity-80 hover:opacity-100 transition-opacity">
                  {it.dashboard.view}
                </button>
              </div>
              <span className="text-5xl font-light">{activeApplicationsCount}</span>
            </CardContent>
          </Card>

          {/* Profile completion */}
          <Card className="bg-charcoal text-charcoal-foreground flex-1 max-w-sm border-0">
            <CardContent className="p-5 flex justify-between items-center">
              <div>
                <p className="text-xs uppercase tracking-wider opacity-80 mb-1">{it.dashboard.profileCompletion}</p>
                <p className="text-xs opacity-70 mb-2 max-w-[180px]">{it.dashboard.profileCompletionHint}</p>
                <button className="text-sm underline underline-offset-2 opacity-80 hover:opacity-100 transition-opacity">
                  {it.dashboard.goToProfile}
                </button>
              </div>
              <span className="text-5xl font-light">{profileCompletion}%</span>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Invitations section */}
      <TalentInvitationsSection />

      {/* Castings section */}
      <div className="space-y-4">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground">{it.dashboard.castingsForYou}</h2>

        {/* Search */}
        <div className="relative max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={it.dashboard.searchPlaceholder} 
            className="pl-11 bg-card border-0 h-12"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Casting list */}
        <div className="space-y-4 mt-6">
          {castingsLoading ? (
            // Loading skeletons
            [1, 2, 3].map((i) => (
              <Card key={i} className="border-0 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    <Skeleton className="sm:w-40 h-32 sm:h-auto" />
                    <div className="flex-1 p-5 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : castings && castings.length > 0 ? (
            castings.map((casting, index) => (
              <Card key={casting.id} className="border-0 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    {/* Image */}
                    <div className="sm:w-40 h-32 sm:h-auto flex-shrink-0">
                      <img 
                        src={getCastingImage(casting, index)} 
                        alt={casting.title} 
                        className="w-full h-full object-cover" 
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl text-foreground">{casting.title}</h3>
                          {casting.category && (
                            <Badge variant="outline" className="text-xs">
                              {casting.category}
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          {casting.compensation_amount && (
                            <p>
                              <span className="font-medium text-foreground">{it.dashboard.budget}:</span>{" "}
                              {casting.compensation_amount} {casting.currency || "EUR"}
                            </p>
                          )}
                          {casting.locations && casting.locations.length > 0 && (
                            <p>
                              <span className="font-medium text-foreground">{it.dashboard.location}:</span>{" "}
                              {casting.locations.join(", ")}
                            </p>
                          )}
                          {formatCastingDates(casting) && (
                            <p>
                              <span className="font-medium text-foreground">{it.dashboard.period}:</span>{" "}
                              {formatCastingDates(casting)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                        <button 
                          className="text-sm text-foreground underline underline-offset-2 hover:text-primary transition-colors"
                          onClick={() => setViewingCasting(casting)}
                        >
                          {it.dashboard.viewDetails}
                        </button>
                        {casting.hasApplied ? (
                          <Button variant="outline" size="default" disabled className="gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Candidato
                          </Button>
                        ) : (
                          <Button 
                            variant="castingAction" 
                            size="default"
                            onClick={() => setApplyingTo(casting)}
                          >
                            {it.dashboard.applyNow}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? "Nessun casting trovato per la tua ricerca."
                    : "Non ci sono casting attivi al momento. Torna presto!"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Apply Dialog */}
      <ApplyToCastingDialog
        open={!!applyingTo}
        onOpenChange={(open) => !open && setApplyingTo(null)}
        casting={applyingTo}
      />

      {/* View Casting Detail Dialog */}
      <CastingDetailDialog
        open={!!viewingCasting}
        onOpenChange={(open) => !open && setViewingCasting(null)}
        casting={viewingCasting}
      />
    </div>
  );
};

export default TalentDashboard;
