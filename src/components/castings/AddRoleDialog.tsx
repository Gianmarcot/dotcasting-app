import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
          <div className="space-y-1.5">
            <Label>Nome ruolo *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="es. Protagonista maschile" />
          </div>

          <div className="space-y-1.5">
            <Label>Descrizione</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrizione del ruolo..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Sesso</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger><SelectValue placeholder="Seleziona" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Maschile</SelectItem>
                  <SelectItem value="F">Femminile</SelectItem>
                  <SelectItem value="NB">Non binario</SelectItem>
                  <SelectItem value="any">Qualsiasi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Budget (€)</Label>
              <Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="0" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Età minima</Label>
              <Input type="number" value={ageMin} onChange={(e) => setAgeMin(e.target.value)} placeholder="18" />
            </div>
            <div className="space-y-1.5">
              <Label>Età massima</Label>
              <Input type="number" value={ageMax} onChange={(e) => setAgeMax(e.target.value)} placeholder="35" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Luogo</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="es. Milano" />
          </div>

          <div className="space-y-1.5">
            <Label>Competenze richieste</Label>
            <Input value={requiredSkills} onChange={(e) => setRequiredSkills(e.target.value)} placeholder="es. Recitazione, Danza, Canto (separati da virgola)" />
          </div>

          <div className="space-y-1.5">
            <Label>Note</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Note aggiuntive..." />
          </div>
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
