import { useMemo, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ChevronDown, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PillTabs } from "@/components/ui/pill-tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCastingRole, useDeleteCastingRole } from "@/hooks/useCastingRoles";
import {
  useRoleTalents,
  useRemoveRoleTalent,
  useAddRoleTalent,
  useSetRoleTalentsExcluded,
  isEngaged,
  type RoleTalentWithProfile,
} from "@/hooks/useRoleTalents";
import { useRoundsByRole } from "@/hooks/useRoundsByRole";
import { useToggleEngagementPublished } from "@/hooks/useTalentEngagements";
import { TalentPicker } from "@/components/talents/TalentPicker";
import { TalentPreviewDrawer } from "@/components/talents/TalentPreviewDrawer";
import type { TalentWithAttributes } from "@/hooks/useTalents";
import { RoleEngagementsPanel, engagementRows } from "@/components/castings/engagements/RoleEngagementsPanel";
import { RoleRoundsPanel } from "@/components/castings/rounds/RoleRoundsPanel";
import { RoundWizardDialog } from "@/components/castings/rounds/RoundWizardDialog";
import { CastingSidePanel, useCastingDetailsPanel } from "@/components/castings/CastingSidePanel";
import { CastingBreadcrumbs } from "@/components/castings/CastingBreadcrumbs";
import { AddRoleDialog } from "@/components/castings/AddRoleDialog";
import { RoleShortlistRow } from "@/components/castings/role/RoleShortlistRow";
import { RoleDetailsPanel } from "@/components/castings/role/RoleDetailsPanel";
import { EngageDialog } from "@/components/castings/role/EngageDialog";
import { BulkMessageDialog } from "@/components/castings/role/BulkMessageDialog";
import { compareRequirements, evaluateRequirements, toRequirementSubject } from "@/lib/roleMatch";
import { readRoleRequirements } from "@/lib/roleRequirements";
import type { RoundPreset } from "@/lib/casting/roundPreset";
import { toast } from "sonner";

const TABS = ["shortlist", "selezioni", "ingaggi"] as const;
type Tab = (typeof TABS)[number];
const parseTab = (v: string | null): Tab => ((TABS as readonly string[]).includes(v ?? "") ? (v as Tab) : "shortlist");

type EditTarget = {
  roundId: string;
  label: string;
  preset: RoundPreset;
  currentIds: string[];
  pdfPaths: Record<string, string | null>;
};

export const OwnerCastingRoleDetail = () => {
  const { castingId, roleId } = useParams<{ castingId: string; roleId: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = parseTab(searchParams.get("scheda"));
  const setTab = (next: Tab) => {
    const params = new URLSearchParams(searchParams);
    params.set("scheda", next);
    setSearchParams(params, { replace: true });
  };

  const panel = useCastingDetailsPanel({ storageKey: "dc-role-details-panel-open" });
  const [addTalentOpen, setAddTalentOpen] = useState(false);
  const [editRoleOpen, setEditRoleOpen] = useState(false);
  const [deleteRoleOpen, setDeleteRoleOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [newRoundIds, setNewRoundIds] = useState<string[] | null>(null);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [engageOpen, setEngageOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [removeIds, setRemoveIds] = useState<string[] | null>(null);

  const { data: role, isLoading: roleLoading } = useCastingRole(roleId);
  const { data: talents = [], isLoading: talentsLoading } = useRoleTalents(roleId);
  const { data: roundsByRole } = useRoundsByRole(castingId);
  const rounds = useMemo(() => roundsByRole?.get(roleId ?? "") ?? [], [roundsByRole, roleId]);
  const roundIds = rounds.map((r) => r.id);

  const addRoleTalent = useAddRoleTalent();
  const removeTalent = useRemoveRoleTalent();
  const setExcluded = useSetRoleTalentsExcluded();
  const togglePublished = useToggleEngagementPublished();
  const deleteRole = useDeleteCastingRole();

  // Presenza di ogni talent nelle selezioni del ruolo
  const { data: membership = [] } = useQuery({
    queryKey: ["role-round-membership", roleId, roundIds.join(",")],
    enabled: roundIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("casting_round_talents")
        .select("round_id, role_talent_id, pdf_path")
        .in("round_id", roundIds);
      if (error) throw error;
      return data ?? [];
    },
  });
  const roundsCountOf = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of membership) m.set(r.role_talent_id, (m.get(r.role_talent_id) ?? 0) + 1);
    return m;
  }, [membership]);
  const roundSize = (id: string) => membership.filter((m) => m.round_id === id).length;

  const active = talents.filter((t) => !t.excluded);
  const excluded = talents.filter((t) => t.excluded);
  const selectedRows = talents.filter((t) => selected.has(t.id));
  const [targetIds, setTargetIds] = useState<string[] | null>(null);
  const targetRows = targetIds ? talents.filter((t) => targetIds.includes(t.id)) : selectedRows;
  const allSelectedExcluded = selectedRows.length > 0 && selectedRows.every((t) => t.excluded);
  const setOne = (id: string, v: boolean) =>
    setSelected((prev) => {
      const n = new Set(prev);
      v ? n.add(id) : n.delete(id);
      return n;
    });
  const clearSelection = () => setSelected(new Set());

  const previewTalents = useMemo(
    () =>
      talents
        .filter((t) => t.profile)
        .map((t) => ({ ...t.profile!, attributes: null }) as unknown as TalentWithAttributes),
    [talents],
  );
  const previewTalent = previewTalents.find((t) => t.id === previewId) ?? null;

  const pickerAdd = async (profileId: string) => {
    await addRoleTalent.mutateAsync({ castingRoleId: roleId!, profileId });
  };
  const pickerRemove = async (profileId: string) => {
    const { error } = await supabase.from("role_talents").delete().eq("casting_role_id", roleId!).eq("profile_id", profileId);
    if (error) throw error;
    qc.invalidateQueries({ queryKey: ["role-talents", roleId] });
    qc.invalidateQueries({ queryKey: ["casting-roles"] });
  };

  const getRemovalWarning = (profileId: string) => {
    const rt = talents.find((t) => t.profile_id === profileId);
    if (!rt) return null;
    const losses: string[] = [];
    if (isEngaged(rt)) losses.push("l'ingaggio pubblicato");
    if (roundsCountOf.has(rt.id)) losses.push("la sua presenza nelle selezioni già create");
    return losses.length ? `Togliendolo dalla shortlist perderai ${losses.join(", ")}.` : null;
  };

  const withoutExcluded = (ids: string[]) => {
    const kept = ids.filter((id) => !talents.find((t) => t.id === id)?.excluded);
    const skipped = ids.length - kept.length;
    if (skipped > 0)
      toast.error(`${skipped} ${skipped === 1 ? "talent escluso è stato saltato" : "talent esclusi sono stati saltati"}`);
    return kept;
  };

  const startNewRound = (only?: string[]) => {
    const ids = withoutExcluded(only ?? [...selected]);
    if (ids.length === 0) return;
    setNewRoundIds(ids);
  };

  const addToRound = async (roundId: string, only?: string[]) => {
    const ids = withoutExcluded(only ?? [...selected]);
    const round = rounds.find((r) => r.id === roundId);
    if (!round || ids.length === 0) return;
    const rows = membership.filter((m) => m.round_id === roundId);
    setEditTarget({
      roundId,
      label: round.label,
      preset: (round as any).field_preset as RoundPreset,
      currentIds: rows.map((r) => r.role_talent_id),
      pdfPaths: Object.fromEntries(rows.map((r) => [r.role_talent_id, r.pdf_path])),
    });
    setNewRoundIds(ids);
  };

  const toggleExcluded = async (ids: string[], value: boolean) => {
    try {
      await setExcluded.mutateAsync({ ids, excluded: value, roleId: roleId! });
      toast.success(value ? "Escluso dal ruolo" : "Reintegrato nel ruolo", {
        description: ids.length > 1 ? `${ids.length} talent` : undefined,
      });
      clearSelection();
    } catch {
      toast.error("Errore");
    }
  };

  const doEngage = async () => {
    const targets = targetRows.filter((t) => !isEngaged(t));
    try {
      for (const t of targets) await togglePublished.mutateAsync({ id: t.id, published: true, roleId: roleId! });
      toast.success(`${targets.length} ${targets.length === 1 ? "ingaggio pubblicato" : "ingaggi pubblicati"}`);
      if (!targetIds) clearSelection();
      setTargetIds(null);
    } catch {
      toast.error("Errore durante l'ingaggio");
    }
    setEngageOpen(false);
  };

  const doRemove = async () => {
    if (!removeIds) return;
    try {
      for (const id of removeIds) await removeTalent.mutateAsync({ id, roleId: roleId! });
      toast.success(removeIds.length === 1 ? "Talent rimosso dalla shortlist" : `${removeIds.length} talent rimossi dalla shortlist`);
      setSelected((prev) => new Set([...prev].filter((id) => !removeIds.includes(id))));
    } catch {
      toast.error("Errore");
    }
    setRemoveIds(null);
  };

  const doDeleteRole = async () => {
    try {
      await deleteRole.mutateAsync({ id: roleId!, castingId: castingId! });
      toast.success("Ruolo eliminato");
      navigate(`/owner/castings/${castingId}`);
    } catch {
      toast.error("Errore", { description: "Impossibile eliminare il ruolo" });
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
    return <p className="py-12 text-center text-muted-foreground">Ruolo non trovato</p>;
  }

  const roleReqs = readRoleRequirements(role);
  const requirementsOf = (rt: RoleTalentWithProfile) =>
    evaluateRequirements(toRequirementSubject(rt.profile), roleReqs);

  const renderRow = (rt: RoleTalentWithProfile) => (
    <RoleShortlistRow
      key={rt.id}
      rt={rt}
      requirements={requirementsOf(rt)}
      roundsCount={roundsCountOf.get(rt.id) ?? 0}
      selected={selected.has(rt.id)}
      onSelectedChange={(v) => setOne(rt.id, v)}
      onOpen={() => setPreviewId(rt.profile_id)}
      onToggleExcluded={() => toggleExcluded([rt.id], !rt.excluded)}
      onRemove={() => setRemoveIds([rt.id])}
      onNewRound={() => startNewRound([rt.id])}
      onEngage={() => {
        setTargetIds([rt.id]);
        setEngageOpen(true);
      }}
      onMessage={() => {
        setTargetIds([rt.id]);
        setMessageOpen(true);
      }}
      rounds={rounds.map((r) => ({ id: r.id, label: r.label, size: roundSize(r.id) }))}
      onAddToRound={(roundId) => addToRound(roundId, [rt.id])}
    />
  );

  const details = (
    <RoleDetailsPanel role={role} onEdit={() => setEditRoleOpen(true)} onDelete={() => setDeleteRoleOpen(true)} />
  );

  return (
    <div className="animate-fade-up md:-mb-8 md:-mt-16">
      <div className="flex items-start">
        <div className="min-w-0 flex-1 space-y-6 md:pt-16">
          <div className="space-y-6">
            <CastingBreadcrumbs castingId={castingId} trail={[{ label: role.name }]} />
            <div className="flex items-center gap-3">
              <h1 className="font-display text-[21px] uppercase text-foreground">{role.name}</h1>
              {!panel.open && (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setEditRoleOpen(true)}
                  className="ml-auto hidden md:inline-flex"
                >
                  Modifica ruolo
                </Button>
              )}
            </div>
          </div>

          <div className="rounded-3xl bg-cream-dark p-8 md:hidden">{details}</div>

          <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <PillTabs
              ariaLabel="Scheda del ruolo"
              className="w-max"
              value={tab}
              onChange={setTab}
              options={[
                { value: "shortlist", label: "Shortlist", count: talents.length },
                { value: "selezioni", label: "Selezioni", count: rounds.length },
                { value: "ingaggi", label: "Ingaggi", count: engagementRows(talents).length },
              ]}
            />
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-sm">
            {tab === "shortlist" && (
              <>
                {/* Intestazione: titolo e aggiunta, o conteggio e azioni in blocco */}
                <div className="mb-4 flex min-h-12 flex-wrap items-center justify-between gap-3">
                  {selected.size === 0 ? (
                    <>
                      <h2 className="font-display text-base uppercase text-foreground">Shortlist</h2>
                      <Button variant="secondary" size="md" iconPosition="left" onClick={() => setAddTalentOpen(true)}>
                        <Plus />
                        Aggiungi talent
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-foreground">{selected.size} selezionati</span>
                        <Button variant="ghost" size="sm" onClick={clearSelection}>
                          Deseleziona
                        </Button>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button size="md" onClick={() => startNewRound()}>
                          Nuova selezione
                        </Button>
                        <Button variant="secondary" size="md" onClick={() => setEngageOpen(true)}>
                          Ingaggia
                        </Button>
                        <Button variant="secondary" size="md" onClick={() => setMessageOpen(true)}>
                          Messaggio
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="md" iconPosition="right">
                              Altro
                              <ChevronDown />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-64">
                            <DropdownMenuLabel>Aggiungi a una selezione esistente</DropdownMenuLabel>
                            {rounds.length === 0 ? (
                              <DropdownMenuItem disabled>Nessuna selezione</DropdownMenuItem>
                            ) : (
                              rounds.map((r) => (
                                <DropdownMenuItem key={r.id} onSelect={() => addToRound(r.id)}>
                                  <span className="flex-1 truncate">{r.label}</span>
                                  <span className="opacity-50">{roundSize(r.id)}</span>
                                </DropdownMenuItem>
                              ))
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => toggleExcluded([...selected], !allSelectedExcluded)}>
                              {allSelectedExcluded ? "Reintegra" : "Escludi dal ruolo"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => setRemoveIds([...selected])}
                              className="text-destructive"
                            >
                              Rimuovi dalla shortlist
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </>
                  )}
                </div>

                {talentsLoading ? (
                  <Skeleton className="h-48 w-full" />
                ) : talents.length === 0 ? (
                  <div className="py-10 text-center text-muted-foreground">
                    <p>Nessun talent in shortlist</p>
                  </div>
                ) : (
                  <>
                    {[...active]
                      .map((rt) => ({ rt, r: requirementsOf(rt) }))
                      .sort((a, b) => compareRequirements(a.r, b.r))
                      .map(({ rt }) => renderRow(rt))}
                    {excluded.length > 0 && (
                      <>
                        <p className="mb-1 mt-6 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          {excluded.length} {excluded.length === 1 ? "escluso" : "esclusi"} dal ruolo
                        </p>
                        {excluded.map(renderRow)}
                      </>
                    )}
                  </>
                )}
              </>
            )}

            {tab === "selezioni" && (
              <RoleRoundsPanel castingId={castingId!} roleId={roleId!} roleName={role.name} rounds={rounds} />
            )}

            {tab === "ingaggi" && (
              <RoleEngagementsPanel
                castingId={castingId!}
                roleId={roleId!}
                roleName={role.name}
                roleLocation={role.location ?? null}
                talents={talents}
                isLoading={talentsLoading}
              />
            )}
          </div>
        </div>

        <CastingSidePanel open={panel.open} wide={panel.wide} onToggle={panel.toggle}>
          {details}
        </CastingSidePanel>
      </div>

      <TalentPicker
        open={addTalentOpen}
        onOpenChange={setAddTalentOpen}
        title="Aggiungi talent"
        roleId={roleId}
        shortlistIds={talents.map((t) => t.profile_id)}
        onAdd={pickerAdd}
        onRemove={pickerRemove}
        getRemovalWarning={getRemovalWarning}
      />

      <TalentPreviewDrawer
        talent={previewTalent}
        talents={previewTalents}
        open={!!previewTalent}
        onOpenChange={(o) => !o && setPreviewId(null)}
      />

      {newRoundIds && !editTarget && (
        <RoundWizardDialog
          open
          onOpenChange={(o) => {
            if (!o) {
              setNewRoundIds(null);
              clearSelection();
            }
          }}
          castingId={castingId!}
          roleId={roleId!}
          roleName={role.name}
          defaultRoundNumber={rounds.length + 1}
          initialSelectedIds={newRoundIds}
          startStep={1}
        />
      )}

      {newRoundIds && editTarget && (
        <RoundWizardDialog
          mode="edit"
          open
          onOpenChange={(o) => {
            if (!o) {
              setNewRoundIds(null);
              setEditTarget(null);
              clearSelection();
              qc.invalidateQueries({ queryKey: ["role-round-membership", roleId] });
            }
          }}
          castingId={castingId!}
          roleId={roleId!}
          roleName={role.name}
          roundId={editTarget.roundId}
          initialLabel={editTarget.label}
          initialPreset={editTarget.preset}
          initialRoleTalentIds={editTarget.currentIds}
          pdfPathByRoleTalentId={editTarget.pdfPaths}
          extraSelectedIds={newRoundIds}
          startStep={2}
        />
      )}

      <EngageDialog
        talents={targetRows}
        open={engageOpen}
        onOpenChange={(o) => {
          setEngageOpen(o);
          if (!o) setTargetIds(null);
        }}
        onConfirm={doEngage}
      />

      <BulkMessageDialog
        open={messageOpen}
        onOpenChange={(o) => {
          setMessageOpen(o);
          if (!o) setTargetIds(null);
        }}
        talents={targetRows}
        roleName={role.name}
        castingId={castingId!}
      />

      <AddRoleDialog open={editRoleOpen} onOpenChange={setEditRoleOpen} castingId={castingId!} editRole={role} />

      <AlertDialog open={!!removeIds} onOpenChange={(o) => !o && setRemoveIds(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Rimuovere {removeIds?.length === 1 ? "il talent" : `${removeIds?.length ?? 0} talent`} dalla shortlist?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Si perdono anche la presenza nelle selezioni e l'eventuale ingaggio. L'operazione non si può annullare.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={doRemove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Rimuovi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteRoleOpen} onOpenChange={setDeleteRoleOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare il ruolo?</AlertDialogTitle>
            <AlertDialogDescription>
              Shortlist, selezioni e ingaggi di questo ruolo verranno eliminati. L'operazione non si può annullare.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={doDeleteRole} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OwnerCastingRoleDetail;
