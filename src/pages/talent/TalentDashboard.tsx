import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, CheckCircle, Calendar, MessageSquare, ArrowRight, ChevronRight, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { it } from "@/lib/i18n";
import { FEATURE_FLAGS } from "@/lib/featureFlags";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import { TalentInvitationsSection } from "@/components/invitations/TalentInvitationsSection";
import { useTalentApplications } from "@/hooks/useTalentApplications";
import { useThreads } from "@/hooks/useMessages";
import { format } from "date-fns";
import { it as itLocale } from "date-fns/locale";

// Lazy imports for explore castings (kept but conditionally used)
import { useExploreCastings, type ExploreCasting } from "@/hooks/useExploreCastings";
import { ApplyToCastingDialog } from "@/components/castings/ApplyToCastingDialog";
import { CastingDetailDialog } from "@/components/castings/CastingDetailDialog";

import castingBeauty from "@/assets/casting-beauty.jpg";
import castingFashion from "@/assets/casting-fashion.jpg";
import castingFitness from "@/assets/casting-fitness.jpg";

const fallbackImages = [castingBeauty, castingFashion, castingFitness];

export const TalentDashboard = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const completion = useProfileCompletion();
  const { data: applications } = useTalentApplications();
  const { data: threads } = useThreads();

  // Explore castings state (only used when flag is on)
  const [searchQuery, setSearchQuery] = useState("");
  const [applyingTo, setApplyingTo] = useState<ExploreCasting | null>(null);
  const [viewingCasting, setViewingCasting] = useState<ExploreCasting | null>(null);
  const { data: castings, isLoading: castingsLoading } = useExploreCastings(
    FEATURE_FLAGS.TALENT_EXPLORE_CASTINGS ? searchQuery : ""
  );

  const firstName = profile?.first_name || user?.email?.split("@")[0] || "Utente";

  // Confirmed castings (booked applications)
  const confirmedCastings = applications?.filter(a => a.status === "booked") || [];

  // Recent messages (last 3 threads)
  const recentThreads = (threads || []).slice(0, 3);

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
      {/* Header */}
      <div>
        <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">{it.dashboard.welcome}</p>
        <h1 className="text-2xl sm:text-4xl text-foreground break-words">{firstName}</h1>
      </div>

      {/* Invitations */}
      <TalentInvitationsSection />

      {/* Profile Completion */}
      {!completion.isLoading && completion.percentage < 100 && (
        <Card>
          <CardContent className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{completion.emoji}</span>
                <h2 className="text-sm uppercase tracking-wider text-muted-foreground">
                  {it.dashboard.profileCompletion}
                </h2>
              </div>
              <span className="text-2xl font-light text-foreground">{completion.percentage}%</span>
            </div>

            <Progress value={completion.percentage} className="h-2" />

            <p className="text-sm text-muted-foreground">{completion.message}</p>

            {completion.missingSections.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Sezioni da completare:
                </p>
                <div className="flex flex-wrap gap-2">
                  {completion.missingSections.map((section) => (
                    <Link
                      key={section.key}
                      to={`/talent/profile#${section.anchor}`}
                      className="inline-flex items-center gap-1 text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full hover:bg-secondary/80 transition-colors"
                    >
                      {section.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <Link to="/talent/profile">
              <Button variant="outline" size="sm" className="gap-1 mt-2">
                {it.dashboard.goToProfile}
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Confirmed Castings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <h2 className="text-sm uppercase tracking-wider">Prossimi casting confermati</h2>
          </div>
          {confirmedCastings.length > 0 && (
            <Link to="/talent/applications" className="text-sm text-primary hover:underline">
              {it.common.seeAll}
            </Link>
          )}
        </div>

        {confirmedCastings.length > 0 ? (
          <div className="space-y-3">
            {confirmedCastings.slice(0, 3).map((app: any) => (
              <Card key={app.id}>
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0 space-y-1">
                    <h3 className="font-medium text-foreground truncate">
                      {app.casting?.title || "Casting"}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      {app.casting?.company?.name && (
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {app.casting.company.name}
                        </span>
                      )}
                      {app.casting?.start_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(app.casting.start_date), "d MMM yyyy", { locale: itLocale })}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge variant="default" className="flex-shrink-0">
                    {it.applications.status.booked}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground text-sm">
              Nessun casting confermato al momento.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Messages */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <h2 className="text-sm uppercase tracking-wider">Messaggi recenti</h2>
          </div>
          {recentThreads.length > 0 && (
            <Link to="/talent/messages" className="text-sm text-primary hover:underline">
              {it.common.seeAll}
            </Link>
          )}
        </div>

        {recentThreads.length > 0 ? (
          <div className="space-y-3">
            {recentThreads.map((thread) => {
              const otherName = thread.otherParticipant?.first_name
                ? `${thread.otherParticipant.first_name} ${thread.otherParticipant.last_name || ""}`.trim()
                : "dotCasting";
              const preview = thread.lastMessage?.body || "";
              const date = thread.lastMessage?.created_at || thread.created_at;

              return (
                <Link key={thread.id} to="/talent/messages">
                  <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground truncate">{otherName}</p>
                          {thread.unreadCount > 0 && (
                            <Badge variant="default" className="text-[10px] h-5 px-1.5">
                              {thread.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate mt-0.5">{preview}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(date), "d MMM", { locale: itLocale })}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground text-sm">
              {it.messages.empty}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Explore Castings — Feature flagged */}
      {FEATURE_FLAGS.TALENT_EXPLORE_CASTINGS && (
        <>
          <div className="space-y-4">
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground">{it.dashboard.castingsForYou}</h2>

            <div className="relative max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={it.dashboard.searchPlaceholder}
                className="pl-11 bg-card border-0 h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-4 mt-6">
              {castingsLoading ? (
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
                        <div className="sm:w-40 h-32 sm:h-auto flex-shrink-0">
                          <img
                            src={getCastingImage(casting, index)}
                            alt={casting.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
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

          <ApplyToCastingDialog
            open={!!applyingTo}
            onOpenChange={(open) => !open && setApplyingTo(null)}
            casting={applyingTo}
          />
          <CastingDetailDialog
            open={!!viewingCasting}
            onOpenChange={(open) => !open && setViewingCasting(null)}
            casting={viewingCasting}
          />
        </>
      )}
    </div>
  );
};

export default TalentDashboard;
