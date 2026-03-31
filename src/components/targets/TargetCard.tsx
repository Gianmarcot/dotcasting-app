import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Target, Users, UserCheck, MoreVertical, Pencil, Trash2, Search, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CastingTarget } from "@/hooks/useTargets";
import { useDeleteTarget } from "@/hooks/useTargets";
import { useShortlistCount } from "@/hooks/useShortlist";
import { useTargetMatching, formatCriteriaSummary } from "@/hooks/useTargetMatching";

interface TargetCardProps {
  target: CastingTarget;
  onEdit: (target: CastingTarget) => void;
  onViewMatches: (target: CastingTarget) => void;
  onViewShortlist: (target: CastingTarget) => void;
}

export const TargetCard = ({
  target,
  onEdit,
  onViewMatches,
  onViewShortlist,
}: TargetCardProps) => {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const deleteTarget = useDeleteTarget();
  const { data: shortlistCount = 0 } = useShortlistCount(target.id);
  const { matchCount } = useTargetMatching(target.criteria_json);

  const handleDelete = async () => {
    try {
      await deleteTarget.mutateAsync(target.id);
      toast({
        title: "Target eliminato",
        description: "Il target è stato eliminato con successo",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione",
        variant: "destructive",
      });
    }
    setDeleteDialogOpen(false);
  };

  const criteriaSummary = formatCriteriaSummary(target.criteria_json);

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 rounded-lg bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate">{target.name}</h3>
                {target.description && (
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                    {target.description}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  {criteriaSummary}
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {matchCount} match
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <UserCheck className="h-3 w-3" />
                    {shortlistCount} shortlist
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewMatches(target)}
                className="hidden sm:flex items-center gap-1"
              >
                <Search className="h-4 w-4" />
                Match
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewShortlist(target)}
                className="hidden sm:flex items-center gap-1"
              >
                <List className="h-4 w-4" />
                Shortlist
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onViewMatches(target)} className="sm:hidden">
                    <Search className="h-4 w-4 mr-2" />
                    Vedi Match
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onViewShortlist(target)} className="sm:hidden">
                    <List className="h-4 w-4 mr-2" />
                    Gestisci Shortlist
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(target)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Modifica
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeleteDialogOpen(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Elimina
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare questo target?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione è irreversibile. Il target "{target.name}" e la sua shortlist verranno eliminati permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
