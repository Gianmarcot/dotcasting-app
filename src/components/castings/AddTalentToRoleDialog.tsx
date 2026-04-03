import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAddRoleTalent } from "@/hooks/useRoleTalents";
import { toast } from "@/hooks/use-toast";

interface AddTalentToRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleId: string;
  existingProfileIds: string[];
}

export const AddTalentToRoleDialog = ({
  open,
  onOpenChange,
  roleId,
  existingProfileIds,
}: AddTalentToRoleDialogProps) => {
  const [search, setSearch] = useState("");
  const addTalent = useAddRoleTalent();

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["talent-profiles-for-role", search],
    enabled: open,
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("id, first_name, last_name, profile_photo_url, birth_date, city")
        .order("last_name", { ascending: true })
        .limit(50);

      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const filteredProfiles = profiles.filter((p) => !existingProfileIds.includes(p.id));

  const handleAdd = async (profileId: string) => {
    try {
      await addTalent.mutateAsync({ castingRoleId: roleId, profileId });
      toast({ title: "Talent aggiunto alla shortlist" });
    } catch {
      toast({ title: "Errore", variant: "destructive" });
    }
  };

  function getAge(birthDate: string | null): number | null {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Aggiungi talent al ruolo</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca per nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : filteredProfiles.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground text-sm">Nessun talent trovato</p>
          ) : (
            filteredProfiles.map((p) => {
              const age = getAge(p.birth_date);
              return (
                <div key={p.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      {p.profile_photo_url && <AvatarImage src={p.profile_photo_url} />}
                      <AvatarFallback className="text-xs">
                        {p.first_name?.[0]}{p.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{p.first_name} {p.last_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {[age ? `${age} anni` : null, p.city].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAdd(p.id)}
                    disabled={addTalent.isPending}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
