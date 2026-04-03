import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Users, CheckCircle2, Edit, Trash2, MoreVertical } from "lucide-react";
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

interface CastingRoleCardProps {
  role: CastingRole;
  castingId: string;
  onEdit: (role: Tables<"casting_roles">) => void;
  confirmedCount?: number;
}

export const CastingRoleCard = ({ role, castingId, onEdit, confirmedCount = 0 }: CastingRoleCardProps) => {
  const navigate = useNavigate();
  const deleteMutation = useDeleteCastingRole();

  const isCompleted = confirmedCount > 0;

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
    role.location,
  ].filter(Boolean);

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(`/owner/castings/${castingId}/${role.id}`)}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{role.name}</h3>
              <Badge className={confirmedCount > 0 ? "bg-[#729128]/15 text-[#729128]" : "bg-[#333333]/10 text-[#333333]"}>
                Confermati {confirmedCount}/{role.role_talents_count ?? 0}
              </Badge>
            </div>

            {specs.length > 0 && (
              <p className="text-sm text-muted-foreground">{specs.join(" · ")}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span className="font-medium text-foreground">{role.role_talents_count ?? 0}</span>
              </span>
              {confirmedCount > 0 && (
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">{confirmedCount}</span>
                </span>
              )}
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
