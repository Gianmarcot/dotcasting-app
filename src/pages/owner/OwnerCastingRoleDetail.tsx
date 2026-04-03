import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus, Send, RotateCcw, MessageSquare, Trash2 } from "lucide-react";
import { useCastingRole } from "@/hooks/useCastingRoles";
import {
  useRoleTalents,
  useUpdateRoleTalentTalentStatus,
  useUpdateRoleTalentCompanyStatus,
  useRemoveRoleTalent,
  TALENT_STATUS_OPTIONS,
  COMPANY_STATUS_OPTIONS,
  type TalentStatus,
  type CompanyStatus,
  type RoleTalentWithProfile,
} from "@/hooks/useRoleTalents";
import { AddTalentToRoleDialog } from "@/components/castings/AddTalentToRoleDialog";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { it as itLocale } from "date-fns/locale";

function getAge(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function getInitialColor(name: string): string {
  const colors = [
    "bg-rose-200 text-rose-700",
    "bg-sky-200 text-sky-700",
    "bg-amber-200 text-amber-700",
    "bg-emerald-200 text-emerald-700",
    "bg-violet-200 text-violet-700",
    "bg-teal-200 text-teal-700",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export const OwnerCastingRoleDetail = () => {
  const { castingId, roleId } = useParams<{ castingId: string; roleId: string }>();
  const navigate = useNavigate();
  const [addTalentOpen, setAddTalentOpen] = useState(false);

  const { data: role, isLoading: roleLoading } = useCastingRole(roleId);
  const { data: talents = [], isLoading: talentsLoading } = useRoleTalents(roleId);
  const updateTalentStatus = useUpdateRoleTalentTalentStatus();
  const updateCompanyStatus = useUpdateRoleTalentCompanyStatus();
  const removeTalent = useRemoveRoleTalent();

  const handleTalentStatusChange = async (rt: RoleTalentWithProfile, newStatus: TalentStatus) => {
    try {
      await updateTalentStatus.mutateAsync({ id: rt.id, talentStatus: newStatus, roleId: roleId! });
      toast({ title: "Stato aggiornato" });
    } catch {
      toast({ title: "Errore", variant: "destructive" });
    }
  };

  const handleCompanyStatusChange = async (rt: RoleTalentWithProfile, newStatus: CompanyStatus) => {
    try {
      await updateCompanyStatus.mutateAsync({ id: rt.id, companyStatus: newStatus, roleId: roleId! });
      toast({ title: "Stato aggiornato" });
    } catch {
      toast({ title: "Errore", variant: "destructive" });
    }
  };

  const handleSendInvite = async (rt: RoleTalentWithProfile) => {
    await handleTalentStatusChange(rt, "invited");
    toast({ title: "Invito inviato" });
  };

  const handleRemove = async (rt: RoleTalentWithProfile) => {
    try {
      await removeTalent.mutateAsync({ id: rt.id, roleId: roleId! });
      toast({ title: "Talent rimosso" });
    } catch {
      toast({ title: "Errore", variant: "destructive" });
    }
  };

  // Summary counts
  const talentStatusCounts = TALENT_STATUS_OPTIONS.reduce((acc, s) => {
    acc[s.value] = talents.filter((t) => (t as any).talent_status === s.value).length;
    return acc;
  }, {} as Record<string, number>);

  const companyStatusCounts = COMPANY_STATUS_OPTIONS.reduce((acc, s) => {
    acc[s.value] = talents.filter((t) => (t as any).company_status === s.value).length;
    return acc;
  }, {} as Record<string, number>);

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

  // Specs as pills
  const specs = [
    role.gender && { label: role.gender === "M" ? "Maschile" : role.gender === "F" ? "Femminile" : role.gender },
    (role.age_min || role.age_max) && { label: `${role.age_min || "?"}-${role.age_max || "?"} anni` },
    role.budget && { label: `€${role.budget}` },
    role.location && { label: role.location },
  ].filter(Boolean) as { label: string }[];

  // Add required_skills as pills
  if (role.required_skills && role.required_skills.length > 0) {
    for (const skill of role.required_skills) {
      specs.push({ label: skill });
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-6 animate-fade-up">
        {/* Back */}
        <Button variant="ghost" size="sm" onClick={() => navigate(`/owner/castings/${castingId}`)} className="-ml-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Torna al casting
        </Button>

        {/* Role Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl text-foreground">{role.name}</h1>
            {role.description && <p className="text-muted-foreground">{role.description}</p>}
            {specs.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {specs.map((s, i) => (
                  <span key={i} className="bg-muted text-foreground rounded-full px-3 py-1 text-sm">
                    {s.label}
                  </span>
                ))}
              </div>
            )}
          </div>
          <Button size="sm" onClick={() => setAddTalentOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Aggiungi talent
          </Button>
        </div>

        {/* Talent Table */}
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
                      <th className="text-left p-4 font-medium text-muted-foreground">Talent</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Con il talent</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Con l'azienda</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {talents.map((rt) => {
                      const age = getAge(rt.profile?.birth_date ?? null);
                      const talentSt = (rt as any).talent_status as TalentStatus || "none";
                      const companySt = (rt as any).company_status as CompanyStatus || "none";
                      const initials = `${rt.profile?.first_name?.[0] || ""}${rt.profile?.last_name?.[0] || ""}`;
                      const initialColor = getInitialColor(initials);
                      const showSendInvite = talentSt === "none" || talentSt === "rejected";
                      const showResendInvite = talentSt === "invited";

                      return (
                        <tr key={rt.id} className="border-b last:border-0">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                {rt.profile?.profile_photo_url ? (
                                  <AvatarImage src={rt.profile.profile_photo_url} className="object-cover" />
                                ) : null}
                                <AvatarFallback className={`text-xs font-medium ${initialColor}`}>
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {rt.profile?.first_name} {rt.profile?.last_name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {[age ? `${age} anni` : null, rt.profile?.city].filter(Boolean).join(" · ")}
                                  {" · "}
                                  <span className="text-muted-foreground/60">
                                    {format(new Date(rt.created_at), "d MMM", { locale: itLocale })}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <TalentStatusSelect
                              value={talentSt}
                              onChange={(v) => handleTalentStatusChange(rt, v)}
                            />
                          </td>
                          <td className="p-4">
                            <CompanyStatusSelect
                              value={companySt}
                              onChange={(v) => handleCompanyStatusChange(rt, v)}
                            />
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-1">
                              {/* Primary action */}
                              {showSendInvite && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="icon"
                                      className="h-8 w-8 bg-primary hover:bg-primary/90"
                                      onClick={() => handleSendInvite(rt)}
                                    >
                                      <Send className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Invia invito</TooltipContent>
                                </Tooltip>
                              )}
                              {showResendInvite && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="icon"
                                      className="h-8 w-8 bg-primary hover:bg-primary/90"
                                      onClick={() => handleSendInvite(rt)}
                                    >
                                      <RotateCcw className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Reinvia invito</TooltipContent>
                                </Tooltip>
                              )}

                              {(showSendInvite || showResendInvite) && (
                                <Separator orientation="vertical" className="h-6 mx-1" />
                              )}

                              {/* Secondary actions */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => navigate(`/owner/messages`)}
                                  >
                                    <MessageSquare className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Messaggio</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => handleRemove(rt)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Rimuovi</TooltipContent>
                              </Tooltip>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Summary row */}
              <div className="border-t px-4 py-4 flex flex-wrap gap-6 text-sm text-muted-foreground">
                <div className="space-y-1.5">
                  <p className="font-medium text-foreground text-sm">Con il talent</p>
                  <div className="flex flex-wrap gap-1.5">
                    {TALENT_STATUS_OPTIONS.map((s) => (
                      talentStatusCounts[s.value] > 0 && (
                        <Badge key={s.value} className={`${s.color} text-xs`}>
                          {s.label} {talentStatusCounts[s.value]}
                        </Badge>
                      )
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="font-medium text-foreground text-sm">Con l'azienda</p>
                  <div className="flex flex-wrap gap-1.5">
                    {COMPANY_STATUS_OPTIONS.map((s) => (
                      companyStatusCounts[s.value] > 0 && (
                        <Badge key={s.value} className={`${s.color} text-xs`}>
                          {s.label} {companyStatusCounts[s.value]}
                        </Badge>
                      )
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <AddTalentToRoleDialog
          open={addTalentOpen}
          onOpenChange={setAddTalentOpen}
          roleId={roleId!}
          castingRoleId={roleId!}
          existingProfileIds={talents.map((t) => t.profile_id)}
        />
      </div>
    </TooltipProvider>
  );
};

// --- Styled status selects ---

function TalentStatusSelect({ value, onChange }: { value: TalentStatus; onChange: (v: TalentStatus) => void }) {
  const current = TALENT_STATUS_OPTIONS.find((s) => s.value === value) || TALENT_STATUS_OPTIONS[0];
  return (
    <Select value={value} onValueChange={(v) => onChange(v as TalentStatus)}>
      <SelectTrigger className={`h-8 w-[130px] border-0 text-sm font-semibold rounded-full px-3 ${current.color}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {TALENT_STATUS_OPTIONS.map((s) => (
          <SelectItem key={s.value} value={s.value} className="focus:bg-[#333333]/5 cursor-pointer">
            {s.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function CompanyStatusSelect({ value, onChange }: { value: CompanyStatus; onChange: (v: CompanyStatus) => void }) {
  const current = COMPANY_STATUS_OPTIONS.find((s) => s.value === value) || COMPANY_STATUS_OPTIONS[0];
  return (
    <Select value={value} onValueChange={(v) => onChange(v as CompanyStatus)}>
      <SelectTrigger className={`h-8 w-[130px] border-0 text-sm font-semibold rounded-full px-3 ${current.color}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {COMPANY_STATUS_OPTIONS.map((s) => (
          <SelectItem key={s.value} value={s.value} className="focus:bg-[#333333]/5 cursor-pointer">
            {s.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default OwnerCastingRoleDetail;
