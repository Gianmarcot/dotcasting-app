import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Users, Edit, Trash2, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CastingRole } from "@/hooks/useCastingRoles";
import { useDeleteCastingRole } from "@/hooks/useCastingRoles";
import { toast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

const phaseColors: Record<string, string> = {
  talent_search: "bg-blue-100 text-blue-700",
  in_management: "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
};

const phaseLabels: Record<string, string> = {
  talent_search: "Ricerca talent",
  in_management: "In gestione",
  completed: "Completato",
};

const PHASES = ["talent_search", "in_management", "completed"];

interface CastingRoleCardProps {
  role: CastingRole;
  castingId: string;
  onEdit: (role: Tables<"casting_roles">) => void;
}

export const CastingRoleCard = ({ role, castingId, onEdit }: CastingRoleCardProps) => {
  const navigate = useNavigate();
  const deleteMutation = useDeleteCastingRole();
  const currentPhaseIdx = PHASES.indexOf(role.phase || "talent_search");

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({ id: role.id, castingId });
      toast({ title: "Ruolo eliminato" });
    } catch {
      toast({ title: "Errore", variant: "destructive" });
    }
  };

  const specs = [
    role.gender,
    role.age_min && role.age_max ? `${role.age_min}-${role.age_max} anni` : null,
    role.budget ? `€${role.budget}` : null,
  ].filter(Boolean);

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(`/owner/castings/${castingId}/${role.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{role.name}</h3>
              <Badge className={phaseColors[role.phase || "talent_search"] || "bg-blue-100 text-blue-700"}>
                {phaseLabels[role.phase || "talent_search"] || "Ricerca talent"}
              </Badge>
            </div>

            {specs.length > 0 && (
              <p className="text-sm text-muted-foreground">{specs.join(" · ")}</p>
            )}

            {/* Phase dots — 3 phases */}
            <div className="flex items-center gap-1">
              {PHASES.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full ${
                    idx <= currentPhaseIdx ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="font-medium text-foreground">{role.role_talents_count ?? 0}</span>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={() => onEdit(role)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifica
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Elimina
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
