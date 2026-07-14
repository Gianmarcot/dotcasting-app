import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { format } from "date-fns";
import { it as itLocale } from "date-fns/locale";
import { Link as LinkIcon, Trash2, ChevronRight, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { CastingRound } from "@/hooks/useCastingRounds";
import { useDeleteRound } from "@/hooks/useCastingRounds";
import { useShareRound } from "@/hooks/useShareRound";
import type { RoundPreviewPhotos } from "@/hooks/useRoundPreviewPhotos";

interface Props {
  round: CastingRound;
  castingId: string;
  preview?: RoundPreviewPhotos;
}

const initialsOf = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const RoleRoundRow = ({ round, castingId, preview }: Props) => {
  const navigate = useNavigate();
  const share = useShareRound();
  const deleteRound = useDeleteRound();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isShared = round.status === "shared";
  const total = preview?.total ?? round.talents_count ?? 0;
  const items = preview?.items ?? [];
  const shown = items.slice(0, 3);
  const extra = Math.max(0, total - shown.length);

  const open = () => navigate(`/owner/castings/${castingId}/rounds/${round.id}`);
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const copyLink = async (e: React.MouseEvent) => {
    stop(e);
    if (!round.share_token) return;
    const url = `${window.location.origin}/round/${round.share_token}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copiato", description: url });
    } catch {
      toast({ title: "Impossibile copiare", variant: "destructive" });
    }
  };

  const doShare = async (e: React.MouseEvent) => {
    stop(e);
    try {
      const res = await share.mutateAsync(round.id);
      const url = `${window.location.origin}/round/${res.share_token}`;
      await navigator.clipboard.writeText(url).catch(() => {});
      toast({ title: "Invio condiviso", description: url });
    } catch (err: any) {
      toast({ title: "Errore", description: err.message, variant: "destructive" });
    }
  };

  const shortDate = format(new Date(round.created_at), "d MMM yyyy", { locale: itLocale });

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={open}
        onKeyDown={(e) => e.key === "Enter" && open()}
        className="group grid grid-cols-[1fr_140px_1fr_140px_120px] items-center gap-4 px-4 h-20 border-b border-border/40 hover:bg-muted/50 cursor-pointer transition-colors"
      >
        {/* Round label + date */}
        <div className="min-w-0">
          <div className="font-medium text-foreground truncate">{round.label}</div>
          <div className="text-xs text-muted-foreground">{shortDate}</div>
        </div>

        {/* Status */}
        <div>
          <Badge
            className={cn(
              "font-semibold",
              isShared
                ? "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]"
                : "bg-muted text-muted-foreground",
            )}
          >
            {isShared ? "Condiviso" : "Bozza"}
          </Badge>
        </div>

        {/* Selezione — avatar stack */}
        <div className="flex items-center">
          {total === 0 ? (
            <span className="text-sm text-muted-foreground/70">—</span>
          ) : (
            <div className="flex items-center">
              {shown.map((it, i) => (
                <Avatar
                  key={i}
                  size="md"
                  className={cn("ring-2 ring-background", i > 0 && "-ml-3")}
                >
                  {it.photoUrl ? <AvatarImage src={it.photoUrl} alt="" /> : null}
                  <AvatarFallback className="text-xs bg-muted">
                    {initialsOf(it.name)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {extra > 0 && (
                <div className="-ml-3 h-12 w-12 rounded-full ring-2 ring-background bg-muted text-xs font-medium text-muted-foreground flex items-center justify-center">
                  +{extra}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Conteggio */}
        <div className="text-sm text-muted-foreground">
          {total === 0 ? "nessun talent" : `${total} talent`}
        </div>

        {/* Azioni */}
        <div className="flex items-center justify-end gap-1">
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <TooltipProvider delayDuration={200}>
              {isShared ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon-md" onClick={copyLink}>
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copia link</TooltipContent>
                </Tooltip>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-md"
                      onClick={doShare}
                      disabled={share.isPending}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Condividi</TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-md"
                    onClick={(e) => {
                      stop(e);
                      setConfirmDelete(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Elimina invio</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        </div>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent onClick={stop} className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display uppercase tracking-widest">
              Eliminare l'invio?
            </AlertDialogTitle>
            <AlertDialogDescription>
              L'invio "{round.label}" verrà eliminato insieme ai PDF e al link di condivisione.
              Lo stato dei talent (confermati/scartati) rimane invariato. Operazione irreversibile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Annulla</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-[hsl(var(--destructive))] hover:opacity-90 text-white"
              disabled={deleteRound.isPending}
              onClick={async (e) => {
                e.preventDefault();
                try {
                  await deleteRound.mutateAsync({
                    roundId: round.id,
                    castingId,
                    castingRoleId: round.casting_role_id,
                  });
                  toast({ title: "Invio eliminato" });
                  setConfirmDelete(false);
                } catch (err: any) {
                  toast({
                    title: "Errore",
                    description: err?.message,
                    variant: "destructive",
                  });
                }
              }}
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
