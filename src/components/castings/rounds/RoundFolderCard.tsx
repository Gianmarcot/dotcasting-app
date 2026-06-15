import { useNavigate } from "react-router-dom";
import { useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { it as itLocale } from "date-fns/locale";
import {
  Edit,
  Share2,
  Link as LinkIcon,
  RotateCcw,
  Folder,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { CastingRound } from "@/hooks/useCastingRounds";
import type { RoundPreviewPhotos } from "@/hooks/useRoundPreviewPhotos";
import { useShareRound } from "@/hooks/useShareRound";

interface Props {
  round: CastingRound;
  castingId: string;
  preview?: RoundPreviewPhotos;
}

const FAN_ROTATIONS = [0, -4, 6, -3, 9];
const FAN_GAP = 24; // px tra una card e l'altra nel ventaglio
const GRID_GAP = 4; // px tra le card in modalità griglia
const STACK_HEIGHT = 176; // = h-44

export const RoundFolderCard = ({ round, castingId, preview }: Props) => {
  const navigate = useNavigate();
  const share = useShareRound();
  const [hovered, setHovered] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);
  const [stripWidth, setStripWidth] = useState(0);

  useLayoutEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setStripWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const total = preview?.total ?? round.talents_count ?? 0;
  const items = preview?.items ?? [];
  // Ordina solo per presentazione: prima con foto, poi senza (stabile).
  const ordered = [...items]
    .map((it, idx) => ({ it, idx }))
    .sort((a, b) => {
      const ap = a.it.photoUrl ? 0 : 1;
      const bp = b.it.photoUrl ? 0 : 1;
      if (ap !== bp) return ap - bp;
      return a.idx - b.idx;
    })
    .map((x) => x.it);
  const stackItems = ordered.slice(0, 4);
  const extra = Math.max(0, total - 4);
  const hasOverflow = extra > 0;
  const layers: Array<{ kind: "photo" | "more"; item?: typeof stackItems[number] }> = [
    ...stackItems.map((it) => ({ kind: "photo" as const, item: it })),
    ...(hasOverflow ? [{ kind: "more" as const }] : []),
  ];
  const n = layers.length;

  const initialsOf = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const isShared = round.status === "shared";
  const open = () => navigate(`/owner/castings/${castingId}/rounds/${round.id}`);

  const copyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
    e.stopPropagation();
    try {
      const res = await share.mutateAsync(round.id);
      const url = `${window.location.origin}/round/${res.share_token}`;
      await navigator.clipboard.writeText(url).catch(() => {});
      toast({ title: "Invio condiviso", description: url });
    } catch (err: any) {
      toast({ title: "Errore", description: err.message, variant: "destructive" });
    }
  };

  const regenerate = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/owner/castings/${castingId}/rounds/${round.id}?regen=1`);
  };

  const edit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/owner/castings/${castingId}/rounds/${round.id}`);
  };

  // Calcola le posizioni "griglia": 5 colonne max, card 5:7 dimensionate sull'altezza disponibile,
  // poi centrate. Se non c'è ancora la misura, fallback a una stima ragionevole.
  const gridSlots = (() => {
    const slots = Math.max(n, 1);
    // Stessa dimensione delle card in ventaglio: nessuno scale-up al hover.
    const cardH = STACK_HEIGHT * 0.88;
    const cardW = (cardH * 5) / 7;
    const totalW = slots * cardW + (slots - 1) * GRID_GAP;
    const startX = (stripWidth - totalW) / 2 + cardW / 2; // centro della prima card
    return Array.from({ length: slots }, (_, i) => ({
      x: startX + i * (cardW + GRID_GAP) - stripWidth / 2,
      cardW,
      cardH,
    }));
  })();

  // Posizioni "ventaglio"
  const fanSlots = Array.from({ length: n }, (_, i) => ({
    x: i * FAN_GAP - ((n - 1) * FAN_GAP) / 2,
    rotate: FAN_ROTATIONS[i] ?? 0,
  }));

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
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <Folder className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="font-medium truncate">{round.label}</span>
        </div>
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
      </div>

      {/* Photo stack — ventaglio di default, griglia al hover */}
      <div className="px-4">
        <div
          ref={stripRef}
          className="relative w-full overflow-hidden"
          style={{ height: STACK_HEIGHT }}
        >
          {total === 0 ? (
            <div className="absolute inset-0 m-2 rounded-md bg-muted/40 flex items-center justify-center text-xs text-muted-foreground">
              Nessun talent
            </div>
          ) : (
            <>
              {layers.map((layer, i) => {
                const z = n - i; // front = highest
                const fan = fanSlots[i];
                const grid = gridSlots[i];
                const isMore = layer.kind === "more";
                const target = hovered
                  ? { x: grid.x, rotate: 0, width: grid.cardW, height: grid.cardH }
                  : {
                      x: fan.x,
                      rotate: fan.rotate,
                      width: (STACK_HEIGHT * 0.88 * 5) / 7,
                      height: STACK_HEIGHT * 0.88,
                    };
                return (
                  <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2 rounded-md overflow-hidden bg-muted/40 border-2 border-white pointer-events-none"
                    style={{ zIndex: z, opacity: isMore ? 0.92 : 1 }}
                    initial={false}
                    animate={{
                      x: target.x,
                      rotate: target.rotate,
                      width: target.width,
                      height: target.height,
                      translateX: "-50%",
                      translateY: "-50%",
                    }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    {isMore ? (
                      <div className="h-full w-full flex items-center justify-center bg-muted text-sm font-medium text-muted-foreground">
                        +{extra}
                      </div>
                    ) : layer.item?.photoUrl ? (
                      <img
                        src={layer.item.photoUrl}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-[#2C2C2A] text-white font-tenor uppercase text-xs tracking-wide">
                        {initialsOf(layer.item?.name ?? "")}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between px-4 pt-3 pb-2 text-xs text-muted-foreground">
        <span className="truncate">
          {total} talent · {format(new Date(round.created_at), "d MMM yyyy", { locale: itLocale })}
        </span>
        <div className="flex items-center gap-1">
          {isShared ? (
            <>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={copyLink} title="Copia link">
                <LinkIcon className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={regenerate} title="Rigenera">
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </>
          ) : (
            <>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={edit} title="Modifica">
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={doShare}
                disabled={share.isPending}
                title="Condividi"
              >
                <Share2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
