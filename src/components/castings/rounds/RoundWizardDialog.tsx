import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FullscreenSheet } from "@/components/ui/fullscreen-sheet";
import { TalentSelectionPanel, type SelectionItem } from "@/components/talents/TalentSelectionPanel";
import { useTalents, type TalentWithAttributes } from "@/hooks/useTalents";
import { roleTalentStatusBadge } from "@/lib/casting/roleTalentStatus";
import { writeRoundPositions } from "@/hooks/useUpdateRound";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FloatingInput, FloatingSelect } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import {
  FIELD_REGISTRY, GROUP_LABELS, FieldGroup,
} from "@/lib/casting/talentFields";
import {
  PRESET_ESSENZIALE, PRESET_COMPLETO, RoundPreset, resolveCard,
} from "@/lib/casting/roundPreset";
import { fetchRoundTalents } from "@/lib/casting/fetchRoundTalents";
import { generateRoundPdfs } from "@/lib/casting/generateRound";
import { TalentCardWeb } from "@/lib/casting/TalentCardWeb";
import { useCreateRound } from "@/hooks/useCastingRounds";
import { useRoleTalentsForRound, RoleTalentRow } from "@/hooks/useRoleConfirmedTalents";
import { useUpdateRound } from "@/hooks/useUpdateRound";
import { ChevronLeft, ChevronRight, Loader2, Search } from "lucide-react";

type StatusFilterKey =
  | "company_confirmed"
  | "talent_confirmed"
  | "both_confirmed"
  | "talent_invited"
  | "company_pending";

const STATUS_FILTERS: {
  key: StatusFilterKey;
  label: string;
  match: (r: RoleTalentRow) => boolean;
}[] = [
  { key: "company_confirmed", label: "Confermati azienda", match: (r) => r.companyStatus === "confirmed" },
  { key: "talent_confirmed", label: "Confermati talent", match: (r) => r.talentStatus === "confirmed" },
  {
    key: "both_confirmed",
    label: "Confermati su entrambi i lati",
    match: (r) => r.companyStatus === "confirmed" && r.talentStatus === "confirmed",
  },
  { key: "talent_invited", label: "Invitati", match: (r) => r.talentStatus === "invited" },
  { key: "company_pending", label: "In attesa azienda", match: (r) => r.companyStatus === "pending" },
];

type WizardMode = "create" | "edit";

interface BaseProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  castingId: string;
  roleId: string;
  roleName?: string;
}

interface CreateProps extends BaseProps {
  mode?: "create";
  defaultLabel?: string;
  defaultRoundNumber?: number;
}

interface EditProps extends BaseProps {
  mode: "edit";
  roundId: string;
  initialLabel: string;
  initialPreset: RoundPreset;
  initialRoleTalentIds: string[];
  pdfPathByRoleTalentId: Record<string, string | null>;
}

type Props = CreateProps | EditProps;

const photoOptions = [
  { value: "3", label: "3 foto" },
  { value: "6", label: "6 foto" },
  { value: "all", label: "Tutte le foto" },
];
const photoCountToValue = (n: number | null | undefined) => (n == null ? "all" : String(n));
const valueToPhotoCount = (v: string): number | null => (v === "all" ? null : parseInt(v, 10));

const presetEqual = (a: RoundPreset, b: RoundPreset) => {
  if ((a.photoCount ?? null) !== (b.photoCount ?? null)) return false;
  if ((a.showAgencyContact !== false) !== (b.showAgencyContact !== false)) return false;
  const sa = [...a.fields].sort();
  const sb = [...b.fields].sort();
  if (sa.length !== sb.length) return false;
  return sa.every((v, i) => v === sb[i]);
};

const STEP_LABELS = ["Talent", "Campi", "Conferma"];

export const RoundWizardDialog = (props: Props) => {
  const { open, onOpenChange, castingId, roleId, roleName } = props;
  const mode: WizardMode = props.mode === "edit" ? "edit" : "create";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const createRound = useCreateRound();
  const updateRound = useUpdateRound();

  const [step, setStep] = useState(0);
  const [label, setLabel] = useState("");
  const [preset, setPreset] = useState<RoundPreset>(PRESET_ESSENZIALE);
  const [selected, setSelected] = useState<string[]>([]);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isBusy, setIsBusy] = useState(false);

  const initialPreset = mode === "edit" ? (props as EditProps).initialPreset : null;
  const initialRoleTalentIds = mode === "edit" ? (props as EditProps).initialRoleTalentIds : null;

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setProgress(null);
    setErrors([]);
    if (mode === "edit") {
      const e = props as EditProps;
      setLabel(e.initialLabel);
      setPreset(e.initialPreset);
      setSelected([...e.initialRoleTalentIds]);
    } else {
      const c = props as CreateProps;
      const n = c.defaultRoundNumber ?? 1;
      setLabel(c.defaultLabel || `${n}° invio${roleName ? ` - ${roleName}` : ""}`);
      setPreset(PRESET_ESSENZIALE);
      setSelected([]);
    }
    setSearch("");
    setStatusFilters(new Set());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const [search, setSearch] = useState("");
  const [statusFilters, setStatusFilters] = useState<Set<StatusFilterKey>>(new Set());

  const { data: roleTalents = [], isLoading: roleTalentsLoading } =
    useRoleTalentsForRound(roleId, open);
  // Profili completi per le schede fotografiche, uniti alle righe della shortlist
  const { data: allTalents = [], isLoading: talentsLoading } = useTalents({});
  const profileById = useMemo(() => new Map(allTalents.map((t) => [t.id, t])), [allTalents]);

  const rowById = useMemo(() => new Map(roleTalents.map((r) => [r.roleTalentId, r])), [roleTalents]);
  const lookup = useMemo(() => {
    const m = new Map<string, SelectionItem>();
    for (const r of roleTalents) {
      const talent =
        profileById.get(r.profileId) ??
        ({ id: r.profileId, stage_name: r.name, first_name: null, last_name: null, profile_photo_url: r.photoUrl, attributes: null } as unknown as TalentWithAttributes);
      m.set(r.roleTalentId, { id: r.roleTalentId, talent });
    }
    return m;
  }, [roleTalents, profileById]);

  const visibleItems = useMemo(() => {
    const active = STATUS_FILTERS.filter((f) => statusFilters.has(f.key));
    const q = search.trim().toLowerCase();
    return roleTalents
      .filter((r) => active.length === 0 || active.some((f) => f.match(r)))
      .filter((r) => !q || r.name.toLowerCase().includes(q))
      .map((r) => lookup.get(r.roleTalentId)!)
      .filter(Boolean);
  }, [roleTalents, statusFilters, search, lookup]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const selectAllVisible = () =>
    setSelected((prev) => {
      const have = new Set(prev);
      return [...prev, ...visibleItems.map((i) => i.id).filter((id) => !have.has(id))];
    });
  const toggleFilter = (key: StatusFilterKey) =>
    setStatusFilters((prev) => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });

  const firstSelected = selected[0];
  const { data: previewTalent } = useQuery({
    queryKey: ["round-preview", firstSelected],
    enabled: !!firstSelected && step >= 1,
    queryFn: async () => {
      const r = await fetchRoundTalents([firstSelected!]);
      return r[0]?.talent ?? null;
    },
  });
  const previewCard = previewTalent ? resolveCard(previewTalent, preset) : null;

  const toggleField = (key: string, checked: boolean) =>
    setPreset((p) => ({
      ...p,
      fields: checked ? [...p.fields, key] : p.fields.filter((f) => f !== key),
    }));

  const groupedFields = useMemo(() => {
    const g: Record<FieldGroup, typeof FIELD_REGISTRY> = {
      anagrafica: [], fisico: [], misure: [], competenze: [], contatti: [],
    };
    FIELD_REGISTRY.forEach((f) => g[f.group].push(f));
    return g;
  }, []);

  const canNext =
    (step === 0 && selected.length > 0) ||
    (step === 1 && label.trim().length > 0 && preset.fields.length > 0) ||
    step === 2;

  const handleSubmit = async () => {
    setIsBusy(true);
    setErrors([]);
    try {
      if (mode === "create") {
        const round = await createRound.mutateAsync({
          castingId, castingRoleId: roleId, label, preset,
        });
        const items = await fetchRoundTalents(selected);
        setProgress({ done: 0, total: items.length });
        const localErrors: string[] = [];
        const localPhotoWarnings: { talentName: string; expected: number; included: number }[] = [];
        for (let i = 0; i < items.length; i++) {
          try {
            const out = await generateRoundPdfs({
              castingId, roundId: round.id, items: [items[i]], preset,
              onProgress: () => {},
            });
            out.photoWarnings.forEach((w) =>
              localPhotoWarnings.push({ talentName: w.talentName, expected: w.expected, included: w.included })
            );
          } catch (e: any) {
            localErrors.push(`${items[i].talent.nome}: ${e?.message ?? "errore"}`);
          }
          setProgress({ done: i + 1, total: items.length });
        }
        await writeRoundPositions(round.id, selected).catch(() => {});
        setErrors(localErrors);
        qc.invalidateQueries({ queryKey: ["casting-rounds", castingId] });
        qc.invalidateQueries({ queryKey: ["rounds-by-role", castingId] });
        if (localErrors.length === 0) {
          toast({ title: "Invio creato", description: `${items.length} comp card generate` });
          if (localPhotoWarnings.length > 0) {
            toast({
              title: "Alcune foto non incluse nei PDF",
              description: `${localPhotoWarnings.length} talent con foto mancanti: ${localPhotoWarnings.map(w => `${w.talentName} (${w.included}/${w.expected})`).join(", ")}`,
              variant: "destructive",
            });
          }
          onOpenChange(false);
          navigate(`/owner/castings/${castingId}/rounds/${round.id}`);
        } else {
          toast({
            title: "Creato con errori",
            description: `${localErrors.length} talent falliti su ${items.length}`,
            variant: "destructive",
          });
        }
      } else {
        const e = props as EditProps;
        const presetChanged = !initialPreset || !presetEqual(initialPreset, preset);
        const selectedIds = selected;
        const toRegen = presetChanged
          ? selectedIds.length
          : selectedIds.filter((id) => !initialRoleTalentIds!.includes(id)).length;
        setProgress({ done: 0, total: toRegen });
        const res = await updateRound.mutateAsync({
          roundId: e.roundId,
          castingId,
          label,
          preset,
          selectedRoleTalentIds: selectedIds,
          currentRoleTalentIds: initialRoleTalentIds!,
          pdfPathByRoleTalentId: e.pdfPathByRoleTalentId,
          presetChanged,
          onProgress: (done, total) => setProgress({ done, total }),
        });
        setErrors(res.errors);
        if (res.errors.length === 0) {
          toast({
            title: "Invio aggiornato",
            description: `${res.added} aggiunti · ${res.removed} rimossi`,
          });
          if (res.photoWarnings.length > 0) {
            toast({
              title: "Alcune foto non incluse nei PDF",
              description: `${res.photoWarnings.length} talent con foto mancanti: ${res.photoWarnings.map(w => `${w.talentName} (${w.included}/${w.expected})`).join(", ")}`,
              variant: "destructive",
            });
          }
          onOpenChange(false);
        } else {
          toast({
            title: "Aggiornato con errori",
            description: `${res.errors.length} PDF falliti`,
            variant: "destructive",
          });
        }
      }
    } catch (err: any) {
      toast({ title: "Errore", description: err?.message ?? "Operazione fallita", variant: "destructive" });
    } finally {
      setIsBusy(false);
    }
  };


  // ----- step content
  const Step1 = (
    <TalentSelectionPanel
      sourceLabel="Shortlist"
      sourceTabLabel="Shortlist"
      items={visibleItems}
      lookup={lookup}
      isLoading={roleTalentsLoading || talentsLoading}
      emptyText={roleTalents.length === 0 ? "Nessun talent in questo ruolo." : "Nessun talent corrisponde ai filtri."}
      toolbar={
        <>
          <div className="relative">
            <FloatingInput label="Cerca per nome" value={search} onChange={setSearch} />
            <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {STATUS_FILTERS.map((f) => {
              const active = statusFilters.has(f.key);
              const count = roleTalents.filter((r) => f.match(r)).length;
              return (
                <button
                  key={f.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleFilter(f.key)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm transition-colors",
                    active ? "bg-ink text-white" : "bg-card text-foreground hover:bg-muted"
                  )}
                >
                  {f.label} <span className="opacity-60">· {count}</span>
                </button>
              );
            })}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={selectAllVisible}
              disabled={visibleItems.every((i) => selectedSet.has(i.id))}
            >
              Seleziona tutti i risultati
            </Button>
          </div>
        </>
      }
      renderBadge={(item) => {
        const r = rowById.get(item.id);
        const badge = r ? roleTalentStatusBadge(r) : null;
        return badge ? (
          <span className={cn("inline-flex items-center rounded-full px-2 py-1 text-[12px] font-medium leading-[1.2] whitespace-nowrap", badge.tone)}>
            {badge.label}
          </span>
        ) : null;
      }}
      selected={selected}
      onSelectedChange={setSelected}
      initialSelectedIds={initialRoleTalentIds ?? []}
      selectionLabel="Invio"
      reorderable
    />
  );

  const FieldsPanel = (
    <div className="space-y-5">
      <FloatingInput label="Etichetta invio" value={label} onChange={setLabel} maxLength={160} />

      <div className="space-y-2">
        <Label>Preset rapidi</Label>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setPreset({ ...PRESET_ESSENZIALE })}>
            Essenziale
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setPreset({ ...PRESET_COMPLETO })}>
            Completo
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Campi visibili</Label>
        <div className="space-y-4 max-h-72 overflow-y-auto pr-2 border rounded-lg p-3">
          {(Object.keys(groupedFields) as FieldGroup[]).map((group) => (
            <div key={group} className="space-y-2">
              <p className="text-xs uppercase text-muted-foreground tracking-wide">
                {GROUP_LABELS[group]}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {groupedFields[group].map((f) => (
                  <label key={f.key} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={preset.fields.includes(f.key)}
                      onCheckedChange={(c) => toggleField(f.key, !!c)}
                    />
                    {f.label}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FloatingSelect
          label="Foto extra"
          value={photoCountToValue(preset.photoCount)}
          onValueChange={(v) => setPreset((p) => ({ ...p, photoCount: valueToPhotoCount(v) }))}
          options={photoOptions}
        />
        <div className="space-y-2">
          <Label>Contatto agenzia</Label>
          <div className="flex items-center gap-2 h-10">
            <Switch
              checked={preset.showAgencyContact !== false}
              onCheckedChange={(c) => setPreset((p) => ({ ...p, showAgencyContact: c }))}
            />
            <span className="text-sm text-muted-foreground">
              {preset.showAgencyContact !== false ? "Visibile" : "Nascosto"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const PreviewPanel = (
    <div className="border rounded-lg p-3 bg-muted/30 max-h-[600px] overflow-y-auto">
      {previewCard ? (
        <TalentCardWeb card={previewCard} />
      ) : (
        <p className="text-sm text-muted-foreground text-center py-12">
          Seleziona almeno un talent per vedere l'anteprima
        </p>
      )}
    </div>
  );

  const Step2 = (
    <>
      <div className="hidden lg:grid grid-cols-2 gap-6">
        {FieldsPanel}
        <div className="space-y-2">
          <Label>Anteprima</Label>
          {PreviewPanel}
        </div>
      </div>
      <div className="lg:hidden">
        <Tabs defaultValue="config">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="config">Configurazione</TabsTrigger>
            <TabsTrigger value="preview">Anteprima</TabsTrigger>
          </TabsList>
          <TabsContent value="config" className="mt-4">{FieldsPanel}</TabsContent>
          <TabsContent value="preview" className="mt-4">{PreviewPanel}</TabsContent>
        </Tabs>
      </div>
    </>
  );

  const presetChanged = mode === "edit" && initialPreset ? !presetEqual(initialPreset, preset) : false;
  const addedCount =
    mode === "edit" && initialRoleTalentIds
      ? selected.filter((id) => !initialRoleTalentIds.includes(id)).length
      : selected.length;
  const removedCount =
    mode === "edit" && initialRoleTalentIds
      ? initialRoleTalentIds.filter((id) => !selectedSet.has(id)).length
      : 0;
  const regenCount = mode === "edit" ? (presetChanged ? selected.length : addedCount) : selected.length;

  const Step3 = (
    <div className="space-y-4">
      <div className="rounded-lg border p-4 space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-muted-foreground">Ruolo</span><span className="font-medium">{roleName ?? "—"}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Etichetta</span><span className="font-medium truncate ml-3">{label || "—"}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Talent inclusi</span><span className="font-medium">{selected.length}</span></div>
        {mode === "edit" && (
          <>
            <div className="flex justify-between"><span className="text-muted-foreground">Aggiunti</span><span className="font-medium">{addedCount}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Rimossi</span><span className="font-medium">{removedCount}</span></div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Preset</span>
              <span className="font-medium">{presetChanged ? "modificato" : "invariato"}</span>
            </div>
          </>
        )}
        <div className="flex justify-between"><span className="text-muted-foreground">Campi visibili</span><span className="font-medium">{preset.fields.length}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Foto</span><span className="font-medium">{preset.photoCount == null ? "Tutte" : preset.photoCount}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">PDF da {mode === "edit" ? "rigenerare" : "generare"}</span><span className="font-medium">{regenCount}</span></div>
      </div>

      {removedCount > 0 && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-muted-foreground">
          {removedCount} talent verranno rimossi dall'invio e i loro PDF eliminati dallo storage.
        </div>
      )}

      {progress && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Generazione PDF…</span>
            <span>{progress.done} / {progress.total}</span>
          </div>
          <Progress value={(progress.done / Math.max(progress.total, 1)) * 100} />
        </div>
      )}

      {errors.length > 0 && (
        <div className="p-3 border border-destructive/30 rounded-lg bg-destructive/5 text-sm">
          <p className="font-medium text-destructive mb-1">Errori:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            {errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}
    </div>
  );

  const stepper = (
    <div className="mt-4 flex max-w-3xl items-center gap-2">
      {STEP_LABELS.map((lbl, i) => (
        <div key={lbl} className="flex items-center gap-2 flex-1">
          <div
            className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium ${
              i === step
                ? "bg-primary text-primary-foreground"
                : i < step
                ? "bg-primary/20 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {i + 1}
          </div>
          <span className={`text-xs ${i === step ? "text-foreground font-medium" : "text-muted-foreground"}`}>
            {lbl}
          </span>
          {i < STEP_LABELS.length - 1 && <div className="flex-1 h-px bg-border" />}
        </div>
      ))}
    </div>
  );

  return (
    <FullscreenSheet
      open={open}
      onRequestClose={() => !isBusy && onOpenChange(false)}
      title={
        <>
          {mode === "edit" ? "Modifica invio" : "Nuovo invio"}
          {roleName && <span className="text-muted-foreground"> — {roleName}</span>}
        </>
      }
      headerExtra={stepper}
    >
      {step === 0 ? (
        Step1
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-8 lg:px-10">
          {step === 1 && Step2}
          {step === 2 && Step3}
        </div>
      )}

      <div className="flex items-center justify-between gap-4 border-t border-border bg-background px-6 py-4 lg:px-10">
        <Button
          variant="ghost"
          onClick={() => (step === 0 ? onOpenChange(false) : setStep(step - 1))}
          disabled={isBusy}
        >
          {step === 0 ? "Annulla" : (<><ChevronLeft className="h-4 w-4 mr-1" />Indietro</>)}
        </Button>

        <div className="flex items-center gap-4">
          {step === 0 && (
            <span className="text-sm font-medium">
              {selected.length} {selected.length === 1 ? "selezionato" : "selezionati"}
            </span>
          )}
          {step < 2 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canNext}>
              Avanti<ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isBusy || selected.length === 0}>
              {isBusy && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "edit" ? "Salva modifiche" : "Crea invio e genera PDF"}
            </Button>
          )}
        </div>
      </div>
    </FullscreenSheet>
  );
};
