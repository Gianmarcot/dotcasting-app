import { useNavigate } from "react-router-dom";
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

export const RoundFolderCard = ({ round, castingId, preview }: Props) => {
  const navigate = useNavigate();
  const share = useShareRound();

  const total = preview?.total ?? round.talents_count ?? 0;
  const items = preview?.items ?? [];
  const visible = items.slice(0, 5);
  const extra = Math.max(0, total - visible.length);
  const hasOverflow = extra > 0;
  const cellCount = Math.min(5, visible.length + (hasOverflow ? 1 : 0));

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
    // Re-open in detail page; actual regen wired there.
    navigate(`/owner/castings/${castingId}/rounds/${round.id}?regen=1`);
  };

  const edit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/owner/castings/${castingId}/rounds/${round.id}`);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => e.key === "Enter" && open()}
      className="group flex flex-col rounded-2xl border bg-white hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer overflow-hidden h-44"
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

      {/* Photo strip — only real talents, aspect 5/7 */}
      <div className="flex-1 px-4 flex gap-1 items-start justify-start min-h-0">
        {total === 0 ? (
          <div className="flex-1 rounded-md bg-muted/40 flex items-center justify-center text-xs text-muted-foreground" style={{ aspectRatio: "5 / 7" }}>
            Nessun talent
          </div>
        ) : (
          <>
            {visible.map((it, i) => (
              <div
                key={i}
                className="rounded-md overflow-hidden bg-muted/40"
                style={{
                  aspectRatio: "5 / 7",
                  flex: `0 0 calc((100% - ${(cellCount - 1) * 4}px) / 5)`,
                }}
              >
                {it.photoUrl ? (
                  <img
                    src={it.photoUrl}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-[#2C2C2A] text-white font-tenor uppercase text-xs tracking-wide">
                    {initialsOf(it.name)}
                  </div>
                )}
              </div>
            ))}
            {hasOverflow && (
              <div
                className="rounded-md bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground"
                style={{
                  aspectRatio: "5 / 7",
                  flex: `0 0 calc((100% - ${(cellCount - 1) * 4}px) / 5)`,
                }}
              >
                +{extra}
              </div>
            )}
          </>
        )}
      </div>


      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground">
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
