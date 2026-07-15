import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

type SelectionMode = "by_status" | "manual";
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

const statusBadge = (r: RoleTalentRow): { label: string; tone: string } | null => {
  if (r.companyStatus === "confirmed" && r.talentStatus === "confirmed")
    return { label: "Conf. entrambi", tone: "bg-[#729128]/15 text-[#729128]" };
  if (r.companyStatus === "confirmed")
    return { label: "Conf. azienda", tone: "bg-[#729128]/15 text-[#729128]" };
  if (r.talentStatus === "confirmed")
    return { label: "Conf. talent", tone: "bg-[#729128]/15 text-[#729128]" };
  if (r.companyStatus === "pending")
    return { label: "In attesa azienda", tone: "bg-[#C88500]/15 text-[#C88500]" };
  if (r.talentStatus === "invited")
    return { label: "Invitato", tone: "bg-[#C88500]/15 text-[#C88500]" };
  if (r.talentStatus === "rejected")
    return { label: "Rifiutato", tone: "bg-[#A30A2B]/15 text-[#A30A2B]" };
  return null;
};

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
  const [selected, setSelected] = useState<Set<string>>(new Set());
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
      setSelected(new Set(e.initialRoleTalentIds));
    } else {
      const c = props as CreateProps;
      const n = c.defaultRoundNumber ?? 1;
      setLabel(c.defaultLabel || `${n}° invio${roleName ? ` - ${roleName}` : ""}`);
      setPreset(PRESET_ESSENZIALE);
      setSelected(new Set());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const [selectionMode, setSelectionMode] = useState<SelectionMode>("by_status");
  const [statusFilters, setStatusFilters] = useState<Set<StatusFilterKey>>(
    new Set(["company_confirmed"]),
  );

  useEffect(() => {
    if (!open) return;
    if (mode === "edit") {
      setSelectionMode("manual");
    } else {
      setSelectionMode("by_status");
      setStatusFilters(new Set(["company_confirmed"]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const { data: roleTalents = [], isLoading: roleTalentsLoading } =
    useRoleTalentsForRound(roleId, open);

  // Derive selection when filters change (by_status mode only)
  useEffect(() => {
    if (selectionMode !== "by_status") return;
    const active = STATUS_FILTERS.filter((f) => statusFilters.has(f.key));
    if (active.length === 0) {
      setSelected(new Set());
      return;
    }
    const next = new Set<string>();
    roleTalents.forEach((r) => {
      if (active.some((f) => f.match(r))) next.add(r.roleTalentId);
    });
    setSelected(next);
  }, [selectionMode, statusFilters, roleTalents]);

  const allSelected = roleTalents.length > 0 && roleTalents.every((t) => selected.has(t.roleTalentId));
  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(roleTalents.map((t) => t.roleTalentId)));
  };
  const toggle = (id: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const toggleFilter = (key: StatusFilterKey) =>
    setStatusFilters((prev) => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });

  const firstSelected = useMemo(() => Array.from(selected)[0], [selected]);
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
    (step === 0 && selected.size > 0) ||
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
        const items = await fetchRoundTalents(Array.from(selected));
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
        const selectedIds = Array.from(selected);
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
    } catch (err: any) {
      toast({ title: "Errore", description: err?.message ?? "Operazione fallita", variant: "destructive" });
    } finally {
      setIsBusy(false);
    }
  };

  const initials = (name: string) =>
    name.split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("");

  // ----- step content
  const Step1 = (
    <div className="space-y-4">
      {/* Mode switch */}
      <div className="inline-flex rounded-full bg-muted p-1 text-sm">
        <button
          type="button"
          onClick={() => setSelectionMode("by_status")}
          className={`px-4 py-1.5 rounded-full transition-colors ${
            selectionMode === "by_status" ? "bg-white shadow-sm" : "text-muted-foreground"
          }`}
        >
          Per stato
        </button>
        <button
          type="button"
          onClick={() => setSelectionMode("manual")}
          className={`px-4 py-1.5 rounded-full transition-colors ${
            selectionMode === "manual" ? "bg-white shadow-sm" : "text-muted-foreground"
          }`}
        >
          Manuale
        </button>
      </div>

      {selectionMode === "by_status" && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Includi talent con
          </p>
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((f) => {
              const active = statusFilters.has(f.key);
              const count = roleTalents.filter((r) => f.match(r)).length;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => toggleFilter(f.key)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    active
                      ? "bg-foreground text-background border-foreground"
                      : "bg-white text-foreground border-border hover:border-foreground/40"
                  }`}
                >
                  {f.label} <span className="opacity-60">· {count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {selectionMode === "by_status"
            ? "Talent inclusi automaticamente dai filtri"
            : "Spunta i talent da includere"}
        </p>
        {selectionMode === "manual" && roleTalents.length > 0 && (
          <Button type="button" variant="ghost" size="sm" onClick={toggleAll}>
            {allSelected ? "Deseleziona tutti" : "Seleziona tutti"}
          </Button>
        )}
      </div>

      <div className="border rounded-lg max-h-[380px] overflow-y-auto divide-y">
        {roleTalentsLoading && (
          <div className="p-6 text-sm text-muted-foreground text-center">Caricamento…</div>
        )}
        {!roleTalentsLoading && roleTalents.length === 0 && (
          <div className="p-8 text-sm text-muted-foreground text-center">
            Nessun talent in questo ruolo.
          </div>
        )}
        {(selectionMode === "by_status"
          ? roleTalents.filter((r) => selected.has(r.roleTalentId))
          : roleTalents
        ).map((t) => {
          const checked = selected.has(t.roleTalentId);
          const badge = statusBadge(t);
          const isManual = selectionMode === "manual";
          const Row = (
            <div className="flex items-center gap-3 px-3 py-2 w-full">
              {isManual && (
                <Checkbox checked={checked} onCheckedChange={() => toggle(t.roleTalentId)} />
              )}
              <Avatar className="h-10 w-10">
                {t.photoUrl && <AvatarImage src={t.photoUrl} alt={t.name} />}
                <AvatarFallback className="text-xs">{initials(t.name) || "?"}</AvatarFallback>
              </Avatar>
              <span className="text-sm flex-1 truncate">{t.name}</span>
              {badge && (
                <Badge
                  variant="secondary"
                  className={`text-[11px] font-normal pointer-events-none ${badge.tone}`}
                >
                  {badge.label}
                </Badge>
              )}
            </div>
          );
          return isManual ? (
            <label key={t.roleTalentId} className="flex cursor-pointer hover:bg-muted/40">
              {Row}
            </label>
          ) : (
            <div key={t.roleTalentId}>{Row}</div>
          );
        })}
        {selectionMode === "by_status" && !roleTalentsLoading && selected.size === 0 && roleTalents.length > 0 && (
          <div className="p-6 text-sm text-muted-foreground text-center">
            Nessun talent corrisponde ai filtri selezionati.
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{selected.size} talent selezionati</p>
    </div>
  );


  const FieldsPanel = (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Etichetta invio</Label>
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="es. 1° invio - Donna 25-35"
        />
      </div>

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
        <div className="space-y-2">
          <Label>Foto extra</Label>
          <Select
            value={photoCountToValue(preset.photoCount)}
            onValueChange={(v) => setPreset((p) => ({ ...p, photoCount: valueToPhotoCount(v) }))}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {photoOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
      ? Array.from(selected).filter((id) => !initialRoleTalentIds.includes(id)).length
      : selected.size;
  const removedCount =
    mode === "edit" && initialRoleTalentIds
      ? initialRoleTalentIds.filter((id) => !selected.has(id)).length
      : 0;
  const regenCount = mode === "edit" ? (presetChanged ? selected.size : addedCount) : selected.size;

  const Step3 = (
    <div className="space-y-4">
      <div className="rounded-lg border p-4 space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-muted-foreground">Ruolo</span><span className="font-medium">{roleName ?? "—"}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Etichetta</span><span className="font-medium truncate ml-3">{label || "—"}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Talent inclusi</span><span className="font-medium">{selected.size}</span></div>
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

  return (
    <Dialog open={open} onOpenChange={(o) => !isBusy && onOpenChange(o)}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Modifica invio" : "Nuovo invio"}
            {roleName && <span className="text-muted-foreground font-normal"> — {roleName}</span>}
          </DialogTitle>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center gap-2 pb-2">
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

        <div className="min-h-[300px]">
          {step === 0 && Step1}
          {step === 1 && Step2}
          {step === 2 && Step3}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="ghost"
            onClick={() => (step === 0 ? onOpenChange(false) : setStep(step - 1))}
            disabled={isBusy}
          >
            {step === 0 ? "Annulla" : (<><ChevronLeft className="h-4 w-4 mr-1" />Indietro</>)}
          </Button>

          {step < 2 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canNext}>
              Avanti<ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isBusy || selected.size === 0}>
              {isBusy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {mode === "edit" ? "Salva modifiche" : "Crea invio e genera PDF"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
