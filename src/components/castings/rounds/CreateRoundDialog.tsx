import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
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
import { TALENT_STATUS_OPTIONS, COMPANY_STATUS_OPTIONS } from "@/hooks/useRoleTalents";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  castingId: string;
}

interface RoleGroup {
  roleId: string;
  roleName: string;
  talents: {
    roleTalentId: string;
    profileId: string;
    name: string;
    talent_status: string;
    company_status: string;
  }[];
}

const photoOptions = [
  { value: "3", label: "3 foto" },
  { value: "6", label: "6 foto" },
  { value: "all", label: "Tutte le foto" },
];

const photoCountToValue = (n: number | null | undefined) =>
  n == null ? "all" : String(n);
const valueToPhotoCount = (v: string): number | null =>
  v === "all" ? null : parseInt(v, 10);

export const CreateRoundDialog = ({ open, onOpenChange, castingId }: Props) => {
  const [label, setLabel] = useState("");
  const [preset, setPreset] = useState<RoundPreset>(PRESET_ESSENZIALE);
  const [selectedRT, setSelectedRT] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const createRound = useCreateRound();

  useEffect(() => {
    if (open) {
      setLabel(`Round ${new Date().toLocaleDateString("it-IT")}`);
      setPreset(PRESET_ESSENZIALE);
      setSelectedRT(new Set());
      setProgress(null);
      setErrors([]);
    }
  }, [open]);

  // Load role talents grouped by role
  const { data: groups = [] } = useQuery({
    queryKey: ["round-role-talents", castingId],
    enabled: open && !!castingId,
    queryFn: async () => {
      const { data: roles, error: e1 } = await supabase
        .from("casting_roles")
        .select("id, name")
        .eq("casting_id", castingId)
        .order("sort_order", { ascending: true });
      if (e1) throw e1;
      const roleIds = (roles ?? []).map(r => r.id);
      if (!roleIds.length) return [] as RoleGroup[];
      const { data: rts, error: e2 } = await supabase
        .from("role_talents")
        .select(`
          id, casting_role_id, talent_status, company_status,
          profile:profiles!role_talents_profile_id_fkey(id, first_name, last_name, stage_name)
        `)
        .in("casting_role_id", roleIds);
      if (e2) throw e2;
      return (roles ?? []).map(r => ({
        roleId: r.id,
        roleName: r.name,
        talents: (rts ?? [])
          .filter((rt: any) => rt.casting_role_id === r.id)
          .map((rt: any) => ({
            roleTalentId: rt.id,
            profileId: rt.profile?.id,
            name: rt.profile?.stage_name?.trim() ||
              [rt.profile?.first_name, rt.profile?.last_name].filter(Boolean).join(" "),
            talent_status: rt.talent_status,
            company_status: rt.company_status,
          })),
      })) as RoleGroup[];
    },
  });

  const toggleRT = (id: string) =>
    setSelectedRT(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const firstSelected = useMemo(() => {
    return Array.from(selectedRT)[0];
  }, [selectedRT]);

  // Preview
  const { data: previewTalent } = useQuery({
    queryKey: ["round-preview", firstSelected],
    enabled: open && !!firstSelected,
    queryFn: async () => {
      const r = await fetchRoundTalents([firstSelected!]);
      return r[0]?.talent ?? null;
    },
  });

  const toggleField = (key: string, checked: boolean) => {
    setPreset(p => ({
      ...p,
      fields: checked ? [...p.fields, key] : p.fields.filter(f => f !== key),
    }));
  };

  const applyPreset = (p: RoundPreset) => setPreset({ ...p });

  const handleGenerate = async () => {
    if (!label.trim()) {
      toast({ title: "Inserisci un'etichetta per il round", variant: "destructive" });
      return;
    }
    if (selectedRT.size === 0) {
      toast({ title: "Seleziona almeno un talent", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    setErrors([]);
    try {
      const round = await createRound.mutateAsync({ castingId, label, preset });
      const items = await fetchRoundTalents(Array.from(selectedRT));
      setProgress({ done: 0, total: items.length });
      const localErrors: string[] = [];
      // Process individually for per-talent error handling
      for (let i = 0; i < items.length; i++) {
        try {
          await generateRoundPdfs({
            castingId, roundId: round.id, items: [items[i]], preset,
            onProgress: () => {},
          });
        } catch (e: any) {
          localErrors.push(`${items[i].talent.nome}: ${e.message ?? "errore"}`);
        }
        setProgress({ done: i + 1, total: items.length });
      }
      setErrors(localErrors);
      if (localErrors.length === 0) {
        toast({ title: "Round generato", description: `${items.length} PDF caricati` });
        onOpenChange(false);
      } else {
        toast({
          title: "Round creato con errori",
          description: `${localErrors.length} talent falliti su ${items.length}`,
          variant: "destructive",
        });
      }
    } catch (e: any) {
      toast({ title: "Errore", description: e.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const groupedFields = useMemo(() => {
    const grouped: Record<FieldGroup, typeof FIELD_REGISTRY> = {
      anagrafica: [], fisico: [], misure: [], competenze: [], contatti: [],
    };
    FIELD_REGISTRY.forEach(f => grouped[f.group].push(f));
    return grouped;
  }, []);

  const previewCard = previewTalent ? resolveCard(previewTalent, preset) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuovo round</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: configuration */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Etichetta round</Label>
              <Input value={label} onChange={e => setLabel(e.target.value)}
                placeholder="es. Selezione 1 - 12 giugno" />
            </div>

            <div className="space-y-2">
              <Label>Preset rapidi</Label>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm"
                  onClick={() => applyPreset(PRESET_ESSENZIALE)}>Essenziale</Button>
                <Button type="button" variant="outline" size="sm"
                  onClick={() => applyPreset(PRESET_COMPLETO)}>Completo</Button>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Campi visibili</Label>
              <div className="space-y-4 max-h-72 overflow-y-auto pr-2 border rounded-lg p-3">
                {(Object.keys(groupedFields) as FieldGroup[]).map(group => (
                  <div key={group} className="space-y-2">
                    <p className="text-xs uppercase text-muted-foreground tracking-wide">
                      {GROUP_LABELS[group]}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {groupedFields[group].map(f => (
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
                  onValueChange={(v) => setPreset(p => ({ ...p, photoCount: valueToPhotoCount(v) }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {photoOptions.map(o => (
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
                    onCheckedChange={(c) => setPreset(p => ({ ...p, showAgencyContact: c }))}
                  />
                  <span className="text-sm text-muted-foreground">
                    {preset.showAgencyContact !== false ? "Visibile" : "Nascosto"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Talent da includere</Label>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2 border rounded-lg p-3">
                {groups.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nessun talent disponibile</p>
                )}
                {groups.map(g => (
                  <div key={g.roleId} className="space-y-1">
                    <p className="text-xs uppercase text-muted-foreground tracking-wide">{g.roleName}</p>
                    {g.talents.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic pl-2">—</p>
                    ) : g.talents.map(t => {
                      const ts = TALENT_STATUS_OPTIONS.find(s => s.value === t.talent_status);
                      const cs = COMPANY_STATUS_OPTIONS.find(s => s.value === t.company_status);
                      return (
                        <label key={t.roleTalentId}
                          className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded px-1 py-1">
                          <Checkbox
                            checked={selectedRT.has(t.roleTalentId)}
                            onCheckedChange={() => toggleRT(t.roleTalentId)}
                          />
                          <span className="flex-1">{t.name || "Senza nome"}</span>
                          {ts && t.talent_status !== "none" && (
                            <Badge variant="secondary" className={`text-xs ${ts.color}`}>{ts.label}</Badge>
                          )}
                          {cs && t.company_status !== "none" && (
                            <Badge variant="secondary" className={`text-xs ${cs.color}`}>{cs.label}</Badge>
                          )}
                        </label>
                      );
                    })}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{selectedRT.size} talent selezionati</p>
            </div>
          </div>

          {/* RIGHT: live preview */}
          <div className="space-y-2">
            <Label>Anteprima</Label>
            <div className="border rounded-lg p-3 bg-muted/30 max-h-[600px] overflow-y-auto">
              {previewCard ? (
                <TalentCardWeb card={previewCard} />
              ) : (
                <p className="text-sm text-muted-foreground text-center py-12">
                  Seleziona un talent per vedere l'anteprima
                </p>
              )}
            </div>
          </div>
        </div>

        {progress && (
          <div className="space-y-2 mt-4">
            <div className="flex justify-between text-sm">
              <span>Generazione PDF...</span>
              <span>{progress.done} / {progress.total}</span>
            </div>
            <Progress value={(progress.done / Math.max(progress.total, 1)) * 100} />
          </div>
        )}

        {errors.length > 0 && (
          <div className="mt-4 p-3 border border-destructive/30 rounded-lg bg-destructive/5 text-sm">
            <p className="font-medium text-destructive mb-1">Errori:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              {errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isGenerating}>
            Annulla
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? "Generazione..." : "Genera PDF"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
