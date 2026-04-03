import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAddRoleTalent } from "@/hooks/useRoleTalents";
import { useCastingRole } from "@/hooks/useCastingRoles";
import { toast } from "@/hooks/use-toast";

interface AddTalentToRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleId: string;
  castingRoleId: string;
  existingProfileIds: string[];
}

interface ProfileWithAttributes {
  id: string;
  first_name: string | null;
  last_name: string | null;
  profile_photo_url: string | null;
  birth_date: string | null;
  city: string | null;
  gender: string | null;
  talent_attributes: {
    height: number | null;
    hair_color: string | null;
    skills: string[] | null;
  }[] | null;
}

function getAge(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function computeMatchScore(
  profile: ProfileWithAttributes,
  role: { gender: string | null; age_min: number | null; age_max: number | null; required_skills: string[] | null }
): { matched: number; total: number } {
  let total = 0;
  let matched = 0;

  // Gender
  if (role.gender && role.gender !== "any") {
    total++;
    if (profile.gender === role.gender) matched++;
  }

  // Age range
  if (role.age_min || role.age_max) {
    total++;
    const age = getAge(profile.birth_date);
    if (age !== null) {
      const minOk = !role.age_min || age >= role.age_min;
      const maxOk = !role.age_max || age <= role.age_max;
      if (minOk && maxOk) matched++;
    }
  }

  // Required skills
  if (role.required_skills && role.required_skills.length > 0) {
    const attrs = profile.talent_attributes?.[0];
    const talentSkills = (attrs?.skills || []).map((s) => s.toLowerCase());
    for (const skill of role.required_skills) {
      total++;
      if (talentSkills.includes(skill.toLowerCase())) matched++;
    }
  }

  return { matched, total };
}

export const AddTalentToRoleDialog = ({
  open,
  onOpenChange,
  roleId,
  castingRoleId,
  existingProfileIds,
}: AddTalentToRoleDialogProps) => {
  const [search, setSearch] = useState("");
  const addTalent = useAddRoleTalent();
  const { data: role } = useCastingRole(castingRoleId);

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["talent-profiles-for-role", search],
    enabled: open,
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("id, first_name, last_name, profile_photo_url, birth_date, city, gender, talent_attributes(height, hair_color, skills)")
        .order("last_name", { ascending: true })
        .limit(100);

      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ProfileWithAttributes[];
    },
  });

  const filteredProfiles = useMemo(() => {
    const available = profiles.filter((p) => !existingProfileIds.includes(p.id));
    if (!role) return available;

    return available
      .map((p) => ({
        ...p,
        _match: computeMatchScore(p, role),
      }))
      .sort((a, b) => {
        // Sort by match ratio descending, then by matched count descending
        const ratioA = a._match.total > 0 ? a._match.matched / a._match.total : 0;
        const ratioB = b._match.total > 0 ? b._match.matched / b._match.total : 0;
        if (ratioB !== ratioA) return ratioB - ratioA;
        return b._match.matched - a._match.matched;
      });
  }, [profiles, existingProfileIds, role]);

  const hasRoleSpecs = role && (
    (role.gender && role.gender !== "any") ||
    role.age_min || role.age_max ||
    (role.required_skills && role.required_skills.length > 0)
  );

  const handleAdd = async (profileId: string) => {
    try {
      await addTalent.mutateAsync({ castingRoleId: roleId, profileId });
      toast({ title: "Talent aggiunto alla shortlist" });
    } catch {
      toast({ title: "Errore", variant: "destructive" });
    }
  };

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

        {hasRoleSpecs && (
          <p className="text-xs text-muted-foreground">
            Ordinati per compatibilità con le specifiche del ruolo
          </p>
        )}

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
              const match = "_match" in p ? (p as any)._match as { matched: number; total: number } : null;

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
                  <div className="flex items-center gap-2">
                    {match && match.total > 0 && (
                      <Badge
                        variant="outline"
                        className={`text-xs font-medium ${
                          match.matched === match.total
                            ? "border-emerald-300 text-emerald-700 bg-emerald-50"
                            : match.matched > 0
                            ? "border-amber-300 text-amber-700 bg-amber-50"
                            : "border-muted text-muted-foreground"
                        }`}
                      >
                        {match.matched}/{match.total}
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleAdd(p.id)}
                      disabled={addTalent.isPending}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
