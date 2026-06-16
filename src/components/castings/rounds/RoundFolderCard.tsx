import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { format } from "date-fns";
import { it as itLocale } from "date-fns/locale";
import {
  Share2,
  Link as LinkIcon,
  RotateCcw,
  Folder,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { CastingRound } from "@/hooks/useCastingRounds";
import { useDeleteRound } from "@/hooks/useCastingRounds";
import type { RoundPreviewPhotos } from "@/hooks/useRoundPreviewPhotos";
import { useShareRound } from "@/hooks/useShareRound";

interface Props {
  round: CastingRound;
  castingId: string;
  preview?: RoundPreviewPhotos;
}


const FAN_ROTATIONS = [0, -4, 6, -3, 9];
const FAN_GAP_REST = 18;
const FAN_GAP_HOVER = 30;
const STACK_HEIGHT = 176;
const CARD_H = 160;
const CARD_W = (CARD_H * 5) / 7;
const MAX_STACK = 5;

const useCanHover = () => {
  const [canHover, setCanHover] = useState(true);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(hover: hover)");
    const update = () => setCanHover(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return canHover;
};

export const RoundFolderCard = ({ round, castingId, preview }: Props) => {
  const navigate = useNavigate();
  const share = useShareRound();
  const deleteRound = useDeleteRound();
  const canHover = useCanHover();
  const [hovered, setHovered] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);


  const total = preview?.total ?? round.talents_count ?? 0;
  const items = preview?.items ?? [];

  // Presentation-only ordering: foto reali davanti, placeholder dietro (stabile).
  const withPhoto = items.filter((it) => !!it.photoUrl);
  const withoutPhoto = items.filter((it) => !it.photoUrl);
  const stackItems = [...withPhoto, ...withoutPhoto].slice(0, MAX_STACK);
  const n = stackItems.length;

  const initialsOf = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const isShared = round.status === "shared";
  const open = () => navigate(`/owner/castings/${castingId}/rounds/${round.id}`);

  const stop = (e: React.MouseEvent | React.SyntheticEvent) => e.stopPropagation();

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

  const regenerate = () => {
    navigate(`/owner/castings/${castingId}/rounds/${round.id}?regen=1`);
  };

  const edit = () => {
    navigate(`/owner/castings/${castingId}/rounds/${round.id}`);
  };

  // Ventaglio (hover-aware su desktop).
  const active = hovered && canHover;
  const gap = active ? FAN_GAP_HOVER : FAN_GAP_REST;
  const rotMul = active ? 1.4 : 1;
  const fanSlots = Array.from({ length: n }, (_, i) => ({
    x: i * gap - ((n - 1) * gap) / 2,
    rotate: (FAN_ROTATIONS[i] ?? 0) * rotMul,
  }));

  const shortDate = format(new Date(round.created_at), "d MMM", { locale: itLocale });

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => e.key === "Enter" && open()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group flex flex-col rounded-2xl border bg-white hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Folder className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="font-medium truncate">{round.label}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Badge
            variant="secondary"
            className={
              isShared
                ? "bg-[#729128]/15 text-[#729128] text-[10px]"
                : "bg-[#333333]/10 text-[#333333] text-[10px]"
            }
          >
            {isShared ? "Condiviso" : "Bozza"}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={stop}>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                title="Altre azioni"
                onClick={stop}
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={stop}>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  edit();
                }}
              >
                <Edit className="h-3.5 w-3.5 mr-2" /> Modifica
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  regenerate();
                }}
              >
                <RotateCcw className="h-3.5 w-3.5 mr-2" /> Rigenera con dati attuali
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-[#A30A2B] focus:text-[#A30A2B]"
                onSelect={(e) => {
                  e.preventDefault();
                  setConfirmDelete(true);
                }}
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" /> Elimina invio
              </DropdownMenuItem>

            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stack foto a ventaglio */}
      <div className="px-4">
        <div
          className="relative w-full overflow-hidden"
          style={{ height: STACK_HEIGHT }}
        >
          {total === 0 ? (
            <div className="absolute inset-0 m-2 rounded-md bg-muted/40 flex items-center justify-center text-xs text-muted-foreground">
              Nessun talent
            </div>
          ) : (
            stackItems.map((item, i) => {
              const z = n - i; // front = highest
              const slot = fanSlots[i];
              return (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2 rounded-md overflow-hidden bg-muted/40 border-2 border-white pointer-events-none"
                  style={{
                    zIndex: z,
                    width: CARD_W,
                    height: CARD_H,
                  }}
                  initial={false}
                  animate={{
                    x: slot.x,
                    rotate: slot.rotate,
                    translateX: "-50%",
                    translateY: "-50%",
                  }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  {item.photoUrl ? (
                    <img
                      src={item.photoUrl}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-[#2C2C2A] text-white font-tenor uppercase text-xs tracking-wide">
                      {initialsOf(item.name ?? "")}
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer a tre zone */}
      <div className="mt-auto grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 pt-3 pb-3">
        <span className="text-xs text-muted-foreground truncate justify-self-start">
          {shortDate}
        </span>
        <span className="text-sm font-medium text-foreground text-center justify-self-center">
          {total} talent
        </span>
        <div className="justify-self-end">
          {isShared ? (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2 gap-1.5"
              onClick={copyLink}
              title="Copia link"
            >
              <LinkIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">Copia link</span>
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2 gap-1.5"
              onClick={doShare}
              disabled={share.isPending}
              title="Condividi"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">Condividi</span>
            </Button>
          )}
        </div>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent onClick={stop} className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-tenor uppercase tracking-widest">
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
              className="rounded-full bg-[#A30A2B] hover:bg-[#850822] text-white"
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
    </div>
  );

};
