import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { PillTabs } from "@/components/ui/pill-tabs";
import { useRoundsByRole } from "@/hooks/useRoundsByRole";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Plus, Users, MapPin, Wallet } from "lucide-react";
import { useCastingRole } from "@/hooks/useCastingRoles";
import {
  useRoleTalents,
  useUpdateRoleTalentTalentStatus,
  useUpdateRoleTalentCompanyStatus,
  useRemoveRoleTalent,
  type TalentStatus,
  type CompanyStatus,
  type RoleTalentWithProfile,
} from "@/hooks/useRoleTalents";
import { AddTalentToRoleDialog } from "@/components/castings/AddTalentToRoleDialog";
import { RoleTalentRow } from "@/components/castings/RoleTalentRow";
import { toast } from "@/hooks/use-toast";

const PHASES = ["shortlist", "invii", "ingaggi"] as const;
type Phase = (typeof PHASES)[number];
const parsePhase = (v: string | null): Phase =>
  (PHASES as readonly string[]).includes(v ?? "") ? (v as Phase) : "shortlist";

export const OwnerCastingRoleDetail = () => {
  const { castingId, roleId } = useParams<{ castingId: string; roleId: string }>();
  const navigate = useNavigate();
  const [addTalentOpen, setAddTalentOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const phase = parsePhase(searchParams.get("fase"));
  const setPhase = (next: Phase) => {
    const params = new URLSearchParams(searchParams);
    params.set("fase", next);
    setSearchParams(params, { replace: true });
  };
  const { data: roundsByRole } = useRoundsByRole(castingId);
  const submissionsCount = roundsByRole?.get(roleId ?? "")?.length ?? 0;

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

  const handleMessage = () => {
    navigate(`/owner/messages`);
  };

  const handleRemove = async (rt: RoleTalentWithProfile) => {
    try {
      await removeTalent.mutateAsync({ id: rt.id, roleId: roleId! });
      toast({ title: "Talent rimosso" });
    } catch {
      toast({ title: "Errore", variant: "destructive" });
    }
  };

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

  const genderLabel =
    role.gender === "M" ? "Maschile" : role.gender === "F" ? "Femminile" : role.gender;
  const ageLabel =
    role.age_min || role.age_max ? `${role.age_min || "?"}-${role.age_max || "?"} anni` : null;

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Back */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(`/owner/castings/${castingId}`)}
        className="-ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Torna al casting
      </Button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="min-w-0 space-y-3">
          <h1 className="font-display uppercase text-3xl tracking-wide text-foreground">
            {role.name}
          </h1>

          {role.description && (
            <p className="text-sm text-muted-foreground max-w-3xl whitespace-pre-wrap">
              {role.description}
            </p>
          )}

          {/* Metadata row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            {genderLabel && (
              <span className="inline-flex items-center gap-1">
                <Users className="h-4 w-4" />
                {genderLabel}
              </span>
            )}
            {ageLabel && <span>{ageLabel}</span>}
            {role.budget && (
              <span className="inline-flex items-center gap-1">
                <Wallet className="h-4 w-4" />€{role.budget}
              </span>
            )}
            {role.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {role.location}
              </span>
            )}
            {role.required_skills && role.required_skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {role.required_skills.map((s, i) => (
                  <span
                    key={i}
                    className="bg-muted text-foreground rounded-full px-2.5 py-0.5 text-xs"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <PillTabs
          ariaLabel="Fase del ruolo"
          className="w-max"
          value={phase}
          onChange={setPhase}
          options={[
            { value: "shortlist", label: "Shortlist", count: talents.length },
            { value: "invii", label: "Invii", count: submissionsCount },
            {
              value: "ingaggi",
              label: "Ingaggi",
              count: talents.filter((t) => t.published_to_talent).length,
            },
          ]}
        />
      </div>

      <div className="border-t border-border" />

      {phase === "shortlist" && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button size="lg" iconPosition="left" onClick={() => setAddTalentOpen(true)}>
              <Plus />
              Aggiungi talent
            </Button>
          </div>
      {/* Talent list */}
      {talentsLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : talents.length === 0 ? (
        <div className="dc-card p-10 text-center text-muted-foreground">
          <p>Nessun talent aggiunto</p>
          <Button
            variant="secondary"
            size="md"
            className="mt-4"
            onClick={() => setAddTalentOpen(true)}
          >
            Aggiungi il primo talent
          </Button>
        </div>
      ) : (
        <div className="dc-card overflow-hidden p-6">
          <div className="grid grid-cols-[80px_1fr_160px_160px_140px] gap-4 px-4 pb-3 text-xs text-muted-foreground">
            <span />
            <span>Talent</span>
            <span>Con il talent</span>
            <span>Con l'azienda</span>
            <span />
          </div>
          {talents.map((rt) => (
            <RoleTalentRow
              key={rt.id}
              rt={rt}
              onTalentStatusChange={handleTalentStatusChange}
              onCompanyStatusChange={handleCompanyStatusChange}
              onSendInvite={handleSendInvite}
              onMessage={handleMessage}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}
        </div>
      )}

      {phase === "invii" && (
        <div className="dc-card p-10 text-center text-muted-foreground">
          <p>Nessun invio</p>
          <p className="mt-2 text-sm">
            Qui troverai le selezioni di talent inviate all'azienda per questo ruolo.
          </p>
        </div>
      )}

      {phase === "ingaggi" && (
        <div className="dc-card p-10 text-center text-muted-foreground">
          <p>Nessun ingaggio</p>
          <p className="mt-2 text-sm">
            Qui troverai i talent confermati e pubblicati come ingaggio per questo ruolo.
          </p>
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
