import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, MessageSquare, ArrowRight, ChevronRight, Building2, MapPin, Clock, Check, X, Search, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { it } from "@/lib/i18n";
import { FEATURE_FLAGS } from "@/lib/featureFlags";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import { useCastingInvitations, useRespondToInvitation } from "@/hooks/useCastingInvitations";
import { useTalentApplications } from "@/hooks/useTalentApplications";
import { useThreads } from "@/hooks/useMessages";
import { format } from "date-fns";
import { it as itLocale } from "date-fns/locale";

// Lazy imports for explore castings (kept but conditionally used)
import { useExploreCastings, type ExploreCasting } from "@/hooks/useExploreCastings";
import { ApplyToCastingDialog } from "@/components/castings/ApplyToCastingDialog";
import { CastingDetailDialog } from "@/components/castings/CastingDetailDialog";

export const TalentDashboard = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const completion = useProfileCompletion();
  const { data: applications } = useTalentApplications();
  const { data: threads } = useThreads();
  const { data: invitations, isLoading: invitationsLoading } = useCastingInvitations(user?.id);
  const respondMutation = useRespondToInvitation();

  // Explore castings state (only used when flag is on)
  const [searchQuery, setSearchQuery] = useState("");
  const [applyingTo, setApplyingTo] = useState<ExploreCasting | null>(null);
  const [viewingCasting, setViewingCasting] = useState<ExploreCasting | null>(null);
  const { data: castings, isLoading: castingsLoading } = useExploreCastings(
    FEATURE_FLAGS.TALENT_EXPLORE_CASTINGS ? searchQuery : ""
  );

  const firstName = profile?.first_name || user?.email?.split("@")[0] || "Utente";
  const pendingInvitations = invitations?.filter((inv) => inv.status === "pending") || [];
  const confirmedCastings = applications?.filter(a => a.status === "booked") || [];
  const recentThreads = (threads || []).slice(0, 3);

  const handleRespond = (invitationId: string, status: "accepted" | "declined") => {
    respondMutation.mutate({ invitationId, status });
  };

  // Importance mapping for missing sections
  const importantKeys = new Set(["photo", "name", "roles", "media", "bio"]);

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
          Ciao, {firstName}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ecco un riepilogo della tua attività su dotCasting
        </p>
      </div>

      {/* Row 1: Invitations + Profile Completion (1:1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Invitations Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">
                Inviti ai Casting
              </CardTitle>
              {pendingInvitations.length > 0 && (
                <Badge variant="default" className="text-xs">
                  {pendingInvitations.length} nuovo{pendingInvitations.length > 1 ? "i" : ""}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {invitationsLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : pendingInvitations.length > 0 ? (
              <div className="space-y-3">
                {pendingInvitations.slice(0, 2).map((invitation) => (
                  <div
                    key={invitation.id}
                    className="bg-muted/50 rounded-lg p-4 space-y-3"
                  >
                    <div className="space-y-2">
                      {invitation.casting?.start_date && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(invitation.casting.start_date), "d MMMM yyyy", { locale: itLocale })}
                          {invitation.casting?.end_date && (
                            <span> — {format(new Date(invitation.casting.end_date), "d MMMM yyyy", { locale: itLocale })}</span>
                          )}
                        </div>
                      )}
                      <h3 className="font-medium text-sm text-foreground">
                        {invitation.casting?.title || "Casting"}
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {invitation.casting?.company?.name && (
                          <Badge variant="muted" className="text-xs font-normal gap-1">
                            <Building2 className="h-2.5 w-2.5" />
                            {invitation.casting.company.name}
                          </Badge>
                        )}
                        {invitation.casting?.locations && invitation.casting.locations.length > 0 && (
                          <Badge variant="muted" className="text-xs font-normal gap-1">
                            <MapPin className="h-2.5 w-2.5" />
                            {invitation.casting.locations[0]}
                          </Badge>
                        )}
                        {invitation.casting?.category && (
                          <Badge variant="muted" className="text-xs font-normal">
                            {invitation.casting.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleRespond(invitation.id, "accepted")}
                        disabled={respondMutation.isPending}
                        className="flex-1 bg-[#729128] hover:bg-[#729128]/90 text-white gap-1"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Confermo la partecipazione
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRespond(invitation.id, "declined")}
                        disabled={respondMutation.isPending}
                        className="gap-1"
                      >
                        <X className="h-3.5 w-3.5" />
                        Non posso
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-6 text-center">
                Nessun invito in attesa di risposta.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Profile Completion Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">
                Completezza del Profilo
              </CardTitle>
              {!completion.isLoading && (
                <span className="text-3xl font-light text-foreground">
                  {completion.percentage}%
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {completion.isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <>
                <Progress value={completion.percentage} className="h-2.5 bg-muted" />

                <ul className="space-y-1.5">
                  {completion.completedSections.map((section) => (
                    <li key={section.key} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-3.5 w-3.5 text-[#729128] flex-shrink-0" />
                      <span className="line-through opacity-60">{section.label}</span>
                    </li>
                  ))}
                  {completion.missingSections.map((section) => (
                    <li key={section.key} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span
                        className={`h-2 w-2 rounded-full flex-shrink-0 ${
                          importantKeys.has(section.key)
                            ? "bg-destructive"
                            : "bg-[#C88500]"
                        }`}
                      />
                      {section.label}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/talent/profile"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                >
                  Vai al profilo per completarlo
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Confirmed Castings (2/3) + Messages (1/3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Confirmed Castings */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">
                Prossimi casting confermati
              </CardTitle>
              {confirmedCastings.length > 0 && (
                <Link to="/talent/applications" className="text-sm text-primary hover:underline">
                  {it.common.seeAll}
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {confirmedCastings.length > 0 ? (
              <div className="divide-y divide-border">
                {confirmedCastings.slice(0, 5).map((app: any) => {
                  const startDate = app.casting?.start_date
                    ? new Date(app.casting.start_date)
                    : null;

                  return (
                    <div key={app.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                      {/* Date column */}
                      {startDate ? (
                        <div className="flex flex-col items-center w-12 flex-shrink-0">
                          <span className="text-xs text-muted-foreground uppercase">
                            {format(startDate, "MMM", { locale: itLocale })}
                          </span>
                          <span className="text-xl font-semibold text-foreground leading-tight">
                            {format(startDate, "dd")}
                          </span>
                        </div>
                      ) : (
                        <div className="w-12 flex-shrink-0 text-center text-xs text-muted-foreground">
                          TBD
                        </div>
                      )}

                      {/* Separator */}
                      <div className="w-px h-10 bg-border flex-shrink-0" />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {app.casting?.title || "Casting"}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          {app.casting?.company?.name && (
                            <span>{app.casting.company.name}</span>
                          )}
                          {app.casting?.locations?.[0] && (
                            <>
                              <span>·</span>
                              <span>{app.casting.locations[0]}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Badge */}
                      <Badge variant="success" className="flex-shrink-0 text-xs">
                        Confermato
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-6 text-center">
                Nessun casting confermato al momento.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">
                Messaggi recenti
              </CardTitle>
              {recentThreads.length > 0 && (
                <Link to="/talent/messages" className="text-sm text-primary hover:underline">
                  {it.common.seeAll}
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {recentThreads.length > 0 ? (
              <div className="divide-y divide-border">
                {recentThreads.map((thread) => {
                  const otherName = thread.otherParticipant?.first_name
                    ? `${thread.otherParticipant.first_name} ${thread.otherParticipant.last_name || ""}`.trim()
                    : "dotCasting";
                  const initials = otherName === "dotCasting"
                    ? "DC"
                    : otherName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
                  const preview = thread.lastMessage?.body || "";
                  const date = thread.lastMessage?.created_at || thread.created_at;

                  return (
                    <Link key={thread.id} to="/talent/messages" className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 hover:bg-accent/30 -mx-2 px-2 rounded transition-colors">
                      {/* Unread dot */}
                      <div className="w-2 flex-shrink-0">
                        {thread.unreadCount > 0 && (
                          <span className="block h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground truncate">{otherName}</p>
                          <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-2">
                            {format(new Date(date), "d MMM", { locale: itLocale })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{preview}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-6 text-center">
                {it.messages.empty}
              </p>
            )}
          </CardContent>
        </Card>
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
                  <Skeleton key={i} className="h-32 w-full" />
                ))
              ) : castings && castings.length > 0 ? (
                castings.map((casting) => (
                  <Card key={casting.id}>
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-medium text-foreground">{casting.title}</h3>
                        {casting.category && (
                          <Badge variant="outline" className="text-xs mt-1">{casting.category}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="text-sm underline hover:text-primary"
                          onClick={() => setViewingCasting(casting)}
                        >
                          {it.dashboard.viewDetails}
                        </button>
                        {casting.hasApplied ? (
                          <Button variant="outline" size="sm" disabled className="gap-1">
                            <CheckCircle className="h-4 w-4" />
                            Candidato
                          </Button>
                        ) : (
                          <Button variant="castingAction" size="sm" onClick={() => setApplyingTo(casting)}>
                            {it.dashboard.applyNow}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    {searchQuery ? "Nessun casting trovato." : "Non ci sono casting attivi al momento."}
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
