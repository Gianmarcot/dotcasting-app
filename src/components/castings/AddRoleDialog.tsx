import { useState, useEffect, useMemo } from "react";
import { Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { FieldCluster, FloatingInput, FloatingSelect, FloatingTextarea } from "@/components/ui/field";
import { SearchSelect } from "@/components/ui/search-select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCreateCastingRole, useUpdateCastingRole } from "@/hooks/useCastingRoles";
import { useTalentFilterOptions } from "@/hooks/useTalents";
import {
  REQUIREMENT_FIELDS,
  REQUIREMENT_GROUP_LABELS,
  normalizeRequirements,
  readRoleRequirements,
  type RequirementField,
  type RequirementGroup,
  type RoleRequirementsData,
} from "@/lib/roleRequirements";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

interface AddRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  castingId: string;
  editRole?: Tables<"casting_roles"> | null;
}

const EMPTY: RoleRequirementsData = { values: {}, mandatory: {} };

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="font-display text-sm uppercase text-foreground">{children}</h3>
);

export const AddRoleDialog = ({ open, onOpenChange, castingId, editRole }: AddRoleDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [req, setReq] = useState<RoleRequirementsData>(EMPTY);
  /** Campi aggiunti, nell'ordine di aggiunta (anche se ancora senza valore). */
  const [keys, setKeys] = useState<string[]>([]);

  const createMutation = useCreateCastingRole();
  const updateMutation = useUpdateCastingRole();
  const { data: filterOptions } = useTalentFilterOptions();

  useEffect(() => {
    if (!open) return;
    setName(editRole?.name ?? "");
    setDescription(editRole?.description || "");
    setBudget(editRole?.budget?.toString() || "");
    setLocation(editRole?.location || "");
    setNotes(editRole?.notes || "");
    const data = editRole ? readRoleRequirements(editRole) : EMPTY;
    setReq(data);
    setKeys(Object.keys(normalizeRequirements(data).requirements.mandatory));
  }, [editRole, open]);

  const setValue = (patch: Record<string, unknown>) =>
    setReq((r) => ({ ...r, values: { ...r.values, ...patch } }));

  const addField = (f: RequirementField) => {
    setKeys((k) => [...k, f.key]);
    setReq((r) => ({
      values: f.type === "boolean" ? { ...r.values, [f.filterKey]: true } : r.values,
      mandatory: { ...r.mandatory, [f.key]: true },
    }));
  };

  const removeField = (f: RequirementField) => {
    setKeys((k) => k.filter((x) => x !== f.key));
    const drop = f.type === "number" ? [f.minKey, f.maxKey] : [f.filterKey];
    setReq((r) => {
      const values = { ...r.values } as Record<string, unknown>;
      drop.forEach((k) => delete values[k]);
      const mandatory = { ...r.mandatory };
      delete mandatory[f.key];
      return { values, mandatory };
    });
  };

  const available = useMemo(() => {
    const groups = new Map<RequirementGroup, RequirementField[]>();
    for (const f of REQUIREMENT_FIELDS) {
      if (keys.includes(f.key)) continue;
      groups.set(f.group, [...(groups.get(f.group) ?? []), f]);
    }
    return [...groups.entries()];
  }, [keys]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Il nome del ruolo è obbligatorio");
      return;
    }
    const n = normalizeRequirements(req);
    const data = {
      name: name.trim(),
      description: description || null,
      budget: budget ? parseFloat(budget) : null,
      location: location || null,
      notes: notes || null,
      requirements: n.requirements as never,
      // Riflesso delle vecchie colonne, ancora lette altrove.
      gender: n.gender,
      age_min: n.age_min,
      age_max: n.age_max,
      required_skills: n.required_skills,
    };

    try {
      if (editRole) {
        await updateMutation.mutateAsync({ id: editRole.id, ...data });
        toast.success("Ruolo aggiornato");
      } else {
        await createMutation.mutateAsync({ ...data, casting_id: castingId, phase: "talent_search" });
        toast.success("Ruolo creato");
      }
      onOpenChange(false);
    } catch {
      toast.error("Errore");
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const values = req.values as Record<string, any>;

  const control = (f: RequirementField) => {
    switch (f.type) {
      case "number":
        return (
          <FieldCluster>
            <FloatingInput className="flex-1" label="Minimo" type="number" inputMode="numeric" value={values[f.minKey]?.toString() ?? ""} onChange={(v) => setValue({ [f.minKey]: v ? Number(v) : undefined })} />
            <FloatingInput className="flex-1" label="Massimo" type="number" inputMode="numeric" value={values[f.maxKey]?.toString() ?? ""} onChange={(v) => setValue({ [f.maxKey]: v ? Number(v) : undefined })} />
          </FieldCluster>
        );
      case "enum":
        return <FloatingSelect label={f.label} value={values[f.filterKey] ?? ""} onValueChange={(v) => setValue({ [f.filterKey]: v })} options={f.options} />;
      case "list": {
        const current: string[] = values[f.filterKey] ?? [];
        const options =
          f.options ??
          [...new Set([...(filterOptions?.skills ?? []), ...current])].sort().map((v) => ({ value: v, label: v }));
        return <SearchSelect label={f.label} multiple options={options} values={current} onValuesChange={(v) => setValue({ [f.filterKey]: v })} />;
      }
      case "boolean":
        return (
          <label className="flex min-h-12 items-center gap-3 text-sm text-foreground">
            <Switch checked={values[f.filterKey] !== false} onCheckedChange={(v) => setValue({ [f.filterKey]: v })} />
            {values[f.filterKey] !== false ? "Sì" : "No"}
          </label>
        );
    }
  };

  const fields = keys.map((k) => REQUIREMENT_FIELDS.find((f) => f.key === k)!).filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{editRole ? "Modifica ruolo" : "Aggiungi ruolo"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          <section className="space-y-4">
            <SectionTitle>Il ruolo</SectionTitle>
            <FloatingInput label="Nome ruolo *" value={name} onChange={setName} maxLength={120} />
            <FloatingTextarea label="Descrizione" value={description} onChange={setDescription} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FloatingInput label="Luogo" value={location} onChange={setLocation} maxLength={120} />
              <FloatingInput label="Budget (€)" type="number" inputMode="decimal" value={budget} onChange={setBudget} />
            </div>
            <FloatingTextarea label="Note" value={notes} onChange={setNotes} />
          </section>

          <section className="space-y-4">
            <SectionTitle>Requisiti</SectionTitle>
            {fields.length === 0 && (
              <p className="text-sm text-muted-foreground">Nessun requisito: aggiungi i campi che il ruolo richiede.</p>
            )}
            {fields.map((f) => (
              <div key={f.key} className="grid grid-cols-1 items-center gap-3 border-b border-border pb-4 sm:grid-cols-[140px_minmax(0,1fr)_auto]">
                <span className="text-sm font-medium text-foreground">{f.label}</span>
                <div className="min-w-0">{control(f)}</div>
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <Switch
                      checked={req.mandatory[f.key] !== false}
                      onCheckedChange={(v) => setReq((r) => ({ ...r, mandatory: { ...r.mandatory, [f.key]: v } }))}
                    />
                    Obbligatorio
                  </label>
                  <Button variant="ghost" size="icon" aria-label={`Togli ${f.label}`} onClick={() => removeField(f)}>
                    <X />
                  </Button>
                </div>
              </div>
            ))}
            {available.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="md" iconPosition="left">
                    <Plus />
                    Aggiungi requisito
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  {available.map(([group, list], i) => (
                    <div key={group}>
                      {i > 0 && <DropdownMenuSeparator />}
                      <DropdownMenuLabel>{REQUIREMENT_GROUP_LABELS[group]}</DropdownMenuLabel>
                      {list.map((f) => (
                        <DropdownMenuItem key={f.key} onSelect={() => addField(f)}>
                          {f.label}
                        </DropdownMenuItem>
                      ))}
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </section>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annulla</Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Salvataggio..." : editRole ? "Salva" : "Crea ruolo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
