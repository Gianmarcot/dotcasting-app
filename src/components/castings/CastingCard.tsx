import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Calendar, MapPin, Euro, Edit, Trash2, Play, Pause, RotateCcw } from "lucide-react";
import { it } from "@/lib/i18n";
import { format } from "date-fns";
import { it as itLocale } from "date-fns/locale";
import type { CastingWithRelations } from "@/hooks/useCastings";
import { FavoriteCastingStar } from "@/components/castings/FavoriteCastingStar";

const statusColors: Record<string, string> = {
  draft: "bg-[#333333]/10 text-[#333333]",
  active: "bg-[#729128]/15 text-[#729128]",
  closed: "bg-[#A30A2B]/15 text-[#A30A2B]",
};

interface CastingCardProps {
  casting: CastingWithRelations;
  onEdit: (casting: CastingWithRelations) => void;
  onDelete: (casting: CastingWithRelations) => void;
  onStatusChange: (id: string, status: string) => void;
}

export const CastingCard = ({ casting, onEdit, onDelete, onStatusChange }: CastingCardProps) => {
  const navigate = useNavigate();
  const applicationsCount = casting.applications?.[0]?.count ?? 0;

  const formatDates = () => {
    if (!casting.start_date && !casting.end_date) return null;
    
    const start = casting.start_date 
      ? format(new Date(casting.start_date), "d MMM", { locale: itLocale })
      : "";
    const end = casting.end_date 
      ? format(new Date(casting.end_date), "d MMM yyyy", { locale: itLocale })
      : "";
    
    if (start && end) return `${start} - ${end}`;
    return start || end;
  };

  const getStatusActions = () => {
    const actions = [];
    if (casting.status === "draft") {
      actions.push({ label: "Pubblica", status: "active", icon: Play });
    }
    if (casting.status === "active") {
      actions.push({ label: "Chiudi", status: "closed", icon: Pause });
    }
    if (casting.status === "closed") {
      actions.push({ label: "Riapri", status: "active", icon: RotateCcw });
    }
    if (casting.status === "active" || casting.status === "closed") {
      actions.push({ label: "Torna a bozza", status: "draft", icon: Edit });
    }
    return actions;
  };

  const statusActions = getStatusActions();

  

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/owner/castings/${casting.id}`)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-foreground text-lg font-medium">
                {casting.title}
              </h3>
              <Badge className={statusColors[casting.status || "draft"]}>
                {it.casting[casting.status as keyof typeof it.casting] || casting.status}
              </Badge>
            </div>
            
            {casting.company && (
              <p className="text-sm text-muted-foreground">
                {casting.company.name}
              </p>
            )}
            
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {casting.locations && casting.locations.length > 0 && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {casting.locations.join(", ")}
                </span>
              )}
              {formatDates() && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDates()}
                </span>
              )}
              {casting.compensation_amount && (
                <span className="flex items-center gap-1">
                  <Euro className="h-4 w-4" />
                  {casting.compensation_amount} {casting.currency || "EUR"}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-semibold text-foreground">
                {applicationsCount}
              </p>
              <p className="text-xs text-muted-foreground">candidature</p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={() => onEdit(casting)}>
                  <Edit className="h-4 w-4 mr-2" />
                  {it.common.edit}
                </DropdownMenuItem>
                
                {statusActions.map((action) => (
                  <DropdownMenuItem 
                    key={action.status} 
                    onClick={() => onStatusChange(casting.id, action.status)}
                  >
                    <action.icon className="h-4 w-4 mr-2" />
                    {action.label}
                  </DropdownMenuItem>
                ))}
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={() => onDelete(casting)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {it.common.delete}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
