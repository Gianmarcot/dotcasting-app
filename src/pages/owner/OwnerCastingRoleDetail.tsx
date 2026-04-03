import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, Plus, MoreVertical, Send, MessageSquare, Trash2, RotateCcw } from "lucide-react";
import { useCastingRole } from "@/hooks/useCastingRoles";
import {
  useRoleTalents,
  useUpdateRoleTalentStatus,
  useRemoveRoleTalent,
  ROLE_TALENT_STATUSES,
  TALENT_FLOW_STEPS,
  type RoleTalentStatus,
  type RoleTalentWithProfile,
} from "@/hooks/useRoleTalents";
import { AddTalentToRoleDialog } from "@/components/castings/AddTalentToRoleDialog";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { it as itLocale } from "date-fns/locale";

const phaseLabels: Record<string, string> = {
  talent_search: "Ricerca talent",
  in_management: "In gestione",
  completed: "Completato",
};

const PHASES = ["talent_search", "in_management", "completed"];

function getAge(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function getStatusInfo(status: string) {
  return ROLE_TALENT_STATUSES.find((s) => s.value === status) || ROLE_TALENT_STATUSES[0];
}

function getFlowProgress(status: string): number {
  const idx = TALENT_FLOW_STEPS.indexOf(status as any);
  if (idx === -1) return 0;
  return ((idx + 1) / TALENT_FLOW_STEPS.length) * 100;
}

function getActions(status: RoleTalentStatus): { label: string; nextStatus: RoleTalentStatus; icon: typeof Send }[] {
  switch (status) {
    case "shortlisted":
      return [{ label: "Invia invito", nextStatus: "invited", icon: Send }];
    case "invited":
      return [{ label: "Reinvia invito", nextStatus: "invited", icon: RotateCcw }];
    case "confirmed_talent":
      return [{ label: "Invia ad azienda", nextStatus: "sent_to_company", icon: Send }];
    case "sent_to_company":
      return [
        { label: "Confermato dall'azienda", nextStatus: "confirmed_company", icon: Send },
        { label: "Scartato dall'azienda", nextStatus: "rejected_company", icon: Trash2 },
      ];
    case "rejected_talent":
      return [{ label: "Reinvita", nextStatus: "invited", icon: RotateCcw }];
    default:
      return [];
  }
}

export const OwnerCastingRoleDetail = () => {
  const { castingId, roleId } = useParams<{ castingId: string; roleId: string }>();
  const navigate = useNavigate();
  const [addTalentOpen, setAddTalentOpen] = useState(false);

  const { data: role, isLoading: roleLoading } = useCastingRole(roleId);
  const { data: talents = [], isLoading: talentsLoading } = useRoleTalents(roleId);
  const updateStatus = useUpdateRoleTalentStatus();
  const removeTalent = useRemoveRoleTalent();

  const handleStatusChange = async (rt: RoleTalentWithProfile, newStatus: RoleTalentStatus) => {
    try {
      await updateStatus.mutateAsync({ id: rt.id, status: newStatus, roleId: roleId! });
      toast({ title: "Stato aggiornato" });
    } catch {
      toast({ title: "Errore", variant: "destructive" });
    }
  };

  const handleRemove = async (rt: RoleTalentWithProfile) => {
    try {
      await removeTalent.mutateAsync({ id: rt.id, roleId: roleId! });
      toast({ title: "Talent rimosso" });
    } catch {
      toast({ title: "Errore", variant: "destructive" });
    }
  };

  const confirmedTalents = talents.filter((t) => t.status === "confirmed_company");

  if (roleLoading) {
    return (
      <div className="space-y-6 animate-fade-up">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!role) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Ruolo non trovato</p>
      </div>
    );
  }

  const currentPhaseIdx = PHASES.indexOf(role.phase || "talent_search");

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => navigate(`/owner/castings/${castingId}`)} className="-ml-2">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Torna al casting
      </Button>

      {/* Role Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl text-foreground">{role.name}</h1>
          {role.description && <p className="text-muted-foreground">{role.description}</p>}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {role.gender && (
          <Card><CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Sesso</p>
            <p className="font-medium text-sm">{role.gender}</p>
          </CardContent></Card>
        )}
        {(role.age_min || role.age_max) && (
          <Card><CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Età</p>
            <p className="font-medium text-sm">
              {role.age_min && role.age_max ? `${role.age_min}-${role.age_max}` : role.age_min || role.age_max}
            </p>
          </CardContent></Card>
        )}
        {role.budget && (
          <Card><CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Budget</p>
            <p className="font-medium text-sm">€{role.budget}</p>
          </CardContent></Card>
        )}
        {role.location && (
          <Card><CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Luogo</p>
            <p className="font-medium text-sm">{role.location}</p>
          </CardContent></Card>
        )}
      </div>

      {/* Phase stepper — 3 phases */}
      <div className="flex items-center gap-0">
        {PHASES.map((phase, idx) => (
          <div key={phase} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                  idx <= currentPhaseIdx
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {idx + 1}
              </div>
              <span className="text-[10px] mt-1 text-muted-foreground text-center">
                {phaseLabels[phase]}
              </span>
            </div>
            {idx < PHASES.length - 1 && (
              <div className={`h-0.5 flex-1 -mt-4 ${idx < currentPhaseIdx ? "bg-primary" : "bg-muted"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Talent Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Talent ({talents.length})</h2>
          <Button size="sm" onClick={() => setAddTalentOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Aggiungi talent
          </Button>
        </div>

        {talentsLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : talents.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nessun talent aggiunto</p>
            <Button variant="link" onClick={() => setAddTalentOpen(true)}>
              Aggiungi il primo talent
            </Button>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium text-muted-foreground">Talent</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Stato</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Progressione</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {talents.map((rt) => {
                      const statusInfo = getStatusInfo(rt.status);
                      const actions = getActions(rt.status as RoleTalentStatus);
                      const age = getAge(rt.profile?.birth_date ?? null);
                      const canRemove = ["shortlisted", "invited", "confirmed_talent", "rejected_talent"].includes(rt.status);

                      return (
                        <tr key={rt.id} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                {rt.profile?.profile_photo_url && (
                                  <AvatarImage src={rt.profile.profile_photo_url} />
                                )}
                                <AvatarFallback className="text-xs">
                                  {rt.profile?.first_name?.[0]}{rt.profile?.last_name?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {rt.profile?.first_name} {rt.profile?.last_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {[age ? `${age} anni` : null, rt.profile?.city].filter(Boolean).join(" · ")}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="space-y-1">
                              <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                              <p className="text-[10px] text-muted-foreground">
                                {format(new Date(rt.status_changed_at), "d MMM HH:mm", { locale: itLocale })}
                              </p>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${getFlowProgress(rt.status)}%` }}
                              />
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {actions.map((a) => (
                                  <DropdownMenuItem
                                    key={a.nextStatus + a.label}
                                    onClick={() => handleStatusChange(rt, a.nextStatus)}
                                  >
                                    <a.icon className="h-4 w-4 mr-2" />
                                    {a.label}
                                  </DropdownMenuItem>
                                ))}
                                <DropdownMenuItem onClick={() => navigate(`/owner/messages`)}>
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Messaggio
                                </DropdownMenuItem>
                                {canRemove && (
                                  <DropdownMenuItem
                                    onClick={() => handleRemove(rt)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Rimuovi
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Definitive List */}
      {confirmedTalents.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-medium">Lista definitiva ({confirmedTalents.length})</h2>
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {confirmedTalents.map((rt) => (
                  <div key={rt.id} className="flex items-center gap-3 p-2 rounded-lg bg-emerald-50">
                    <Avatar className="h-10 w-10">
                      {rt.profile?.profile_photo_url && (
                        <AvatarImage src={rt.profile.profile_photo_url} />
                      )}
                      <AvatarFallback>
                        {rt.profile?.first_name?.[0]}{rt.profile?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">
                        {rt.profile?.first_name} {rt.profile?.last_name}
                      </p>
                      <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">{role.name}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <AddTalentToRoleDialog
        open={addTalentOpen}
        onOpenChange={setAddTalentOpen}
        roleId={roleId!}
        castingRoleId={roleId!}
        existingProfileIds={talents.map((t) => t.profile_id)}
      />
    </div>
  );
};

export default OwnerCastingRoleDetail;
