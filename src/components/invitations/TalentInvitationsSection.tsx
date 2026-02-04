import { Check, X, Mail, Building2, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCastingInvitations, useRespondToInvitation } from "@/hooks/useCastingInvitations";
import { useAuth } from "@/contexts/AuthContext";
import { it } from "@/lib/i18n";
import { format } from "date-fns";
import { it as itLocale } from "date-fns/locale";

export const TalentInvitationsSection = () => {
  const { user } = useAuth();
  const { data: invitations, isLoading } = useCastingInvitations(user?.id);
  const respondMutation = useRespondToInvitation();

  const pendingInvitations = invitations?.filter((inv) => inv.status === "pending") || [];

  const handleRespond = (invitationId: string, status: "accepted" | "declined") => {
    respondMutation.mutate({ invitationId, status });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground">
          {it.dashboard.invitations}
        </h2>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (pendingInvitations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-primary" />
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground">
          {it.dashboard.invitations}
        </h2>
        <Badge variant="secondary" className="ml-2">
          {pendingInvitations.length}
        </Badge>
      </div>

      <div className="space-y-3">
        {pendingInvitations.map((invitation) => (
          <Card key={invitation.id} className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-medium text-foreground">
                    {invitation.casting?.title || "Casting"}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    {invitation.casting?.company?.name && (
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {invitation.casting.company.name}
                      </span>
                    )}
                    {invitation.casting?.category && (
                      <Badge variant="outline" className="text-xs">
                        {invitation.casting.category}
                      </Badge>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(invitation.created_at), "d MMM yyyy", {
                        locale: itLocale,
                      })}
                    </span>
                  </div>
                  {invitation.message && (
                    <p className="text-sm text-muted-foreground mt-2 italic">
                      "{invitation.message}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRespond(invitation.id, "declined")}
                    disabled={respondMutation.isPending}
                    className="gap-1"
                  >
                    <X className="h-4 w-4" />
                    {it.common.decline}
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleRespond(invitation.id, "accepted")}
                    disabled={respondMutation.isPending}
                    className="gap-1"
                  >
                    <Check className="h-4 w-4" />
                    {it.common.accept}
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
