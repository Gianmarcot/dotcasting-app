import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FloatingInput, FloatingSelect, FloatingTextarea } from "@/components/ui/field";
import { useCreateCastingRole, useUpdateCastingRole } from "@/hooks/useCastingRoles";
import { toast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

interface AddRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  castingId: string;
  editRole?: Tables<"casting_roles"> | null;
}

export const AddRoleDialog = ({ open, onOpenChange, castingId, editRole }: AddRoleDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [gender, setGender] = useState("");
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");
  const [budget, setBudget] = useState("");
  const [location, setLocation] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [notes, setNotes] = useState("");

  const createMutation = useCreateCastingRole();
  const updateMutation = useUpdateCastingRole();

  useEffect(() => {
    if (editRole) {
      setName(editRole.name);
      setDescription(editRole.description || "");
      setGender(editRole.gender || "");
      setAgeMin(editRole.age_min?.toString() || "");
      setAgeMax(editRole.age_max?.toString() || "");
      setBudget(editRole.budget?.toString() || "");
      setLocation(editRole.location || "");
      setRequiredSkills(editRole.required_skills?.join(", ") || "");
      setNotes(editRole.notes || "");
    } else {
      setName("");
      setDescription("");
      setGender("");
      setAgeMin("");
      setAgeMax("");
      setBudget("");
      setLocation("");
      setRequiredSkills("");
      setNotes("");
    }
  }, [editRole, open]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({ title: "Il nome del ruolo è obbligatorio", variant: "destructive" });
      return;
    }

    const data = {
      name: name.trim(),
      description: description || null,
      gender: gender || null,
      age_min: ageMin ? parseInt(ageMin) : null,
      age_max: ageMax ? parseInt(ageMax) : null,
      budget: budget ? parseFloat(budget) : null,
      location: location || null,
      required_skills: requiredSkills ? requiredSkills.split(",").map((s) => s.trim()).filter(Boolean) : [],
      notes: notes || null,
      phase: "talent_search" as const,
    };

    try {
      if (editRole) {
        await updateMutation.mutateAsync({ id: editRole.id, ...data });
        toast({ title: "Ruolo aggiornato" });
      } else {
        await createMutation.mutateAsync({ ...data, casting_id: castingId });
        toast({ title: "Ruolo creato" });
      }
      onOpenChange(false);
    } catch {
      toast({ title: "Errore", variant: "destructive" });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editRole ? "Modifica ruolo" : "Aggiungi ruolo"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <FloatingInput label="Nome ruolo *" value={name} onChange={setName} maxLength={120} />

          <FloatingTextarea label="Descrizione" value={description} onChange={setDescription} />

          <div className="grid grid-cols-2 gap-3">
            <FloatingSelect label="Sesso" value={gender} onValueChange={setGender} options={[
              { value: "M", label: "Maschile" }, { value: "F", label: "Femminile" },
              { value: "NB", label: "Non binario" }, { value: "any", label: "Qualsiasi" },
            ]} />
            <FloatingInput label="Budget (€)" type="number" inputMode="decimal" value={budget} onChange={setBudget} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FloatingInput label="Età minima" type="number" inputMode="numeric" value={ageMin} onChange={setAgeMin} />
            <FloatingInput label="Età massima" type="number" inputMode="numeric" value={ageMax} onChange={setAgeMax} />
          </div>

          <FloatingInput label="Luogo" value={location} onChange={setLocation} maxLength={120} />

          <FloatingInput label="Competenze richieste" value={requiredSkills} onChange={setRequiredSkills} maxLength={500} />

          <FloatingTextarea label="Note" value={notes} onChange={setNotes} />
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
