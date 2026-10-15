import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { format } from "date-fns";
import { it as itLocale } from "date-fns/locale";
import { Link as LinkIcon, Trash2, ChevronRight, Share2, Folder, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

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
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { CastingRound } from "@/hooks/useCastingRounds";
import { useDeleteRound } from "@/hooks/useCastingRounds";
import { useShareRound } from "@/hooks/useShareRound";
import type { RoundPreviewPhotos } from "@/hooks/useRoundPreviewPhotos";

interface Props {
  round: CastingRound;
  castingId: string;
  preview?: RoundPreviewPhotos;
  /** Mostra solo "1° invio" senza il nome del ruolo (es. dentro il dettaglio ruolo). */
  hideRoleName?: boolean;
}

const initialsOf = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const RoleRoundRow = ({ round, castingId, preview, hideRoleName = false }: Props) => {
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
      toast.success("Link copiato", { description: url });
    } catch {
      toast.error("Impossibile copiare");
    }
  };

  const doShare = async (e: React.MouseEvent) => {
    stop(e);
    try {
      const res = await share.mutateAsync(round.id);
      const url = `${window.location.origin}/round/${res.share_token}`;
      await navigator.clipboard.writeText(url).catch(() => {});
      toast.success("Invio condiviso", { description: url });
    } catch (err: any) {
      toast.error("Errore", { description: err.message });
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
        className="group grid -mx-4 grid-cols-[1fr_160px_1fr_120px] items-center gap-4 rounded-lg px-4 h-20 hover:bg-muted/30 cursor-pointer transition-colors"
      >
        {/* Round label + date */}
        <div className="min-w-0 flex items-center gap-3">
          <Folder className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="min-w-0">
            <div className="text-foreground truncate">
              {(() => {
                const sep = round.label.match(/\s[-–]\s/);
                if (!sep) return <span>{round.label}</span>;
                const idx = round.label.indexOf(sep[0]);
                const first = round.label.slice(0, idx);
                const rest = round.label.slice(idx);
                if (hideRoleName) return <span className="font-semibold">{first}</span>;
                return (
                  <>
                    <span className="font-semibold">{first}</span>
                    <span className="font-normal">{rest}</span>
                  </>
                );
              })()}
            </div>
            <div className="text-xs text-muted-foreground">{shortDate}</div>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 text-sm">
          {isShared ? (
            <>
              <CheckCheck className="h-5 w-5 text-[#C7C7C7]" />
              <span className="text-foreground">
                Condiviso{round.shared_at ? ` il ${format(new Date(round.shared_at), "d MMM", { locale: itLocale })}` : ""}
              </span>
            </>
          ) : (
            <span className="text-muted-foreground">Non condiviso</span>
          )}
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
        <AlertDialogContent onClick={stop}>
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
                  toast.success("Invio eliminato");
                  setConfirmDelete(false);
                } catch (err: any) {
                  toast.error("Errore", { description: err?.message });
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
