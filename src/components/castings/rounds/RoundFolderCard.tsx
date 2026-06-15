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
  const photos = preview?.photos ?? [];
  const extra = Math.max(0, total - photos.length);

  const isShared = round.status === "shared";
  const open = () => navigate(`/owner/castings/${castingId}/rounds/${round.id}`);

  const copyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!round.share_token) return;
    const url = `${window.location.origin}/r/${round.share_token}`;
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
      const url = `${window.location.origin}/r/${res.share_token}`;
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

      {/* Photo strip */}
      <div className="flex-1 px-4 flex gap-1 items-stretch min-h-0">
        {total === 0 ? (
          <div className="flex-1 rounded-md bg-muted/40 flex items-center justify-center text-xs text-muted-foreground">
            Nessun talent
          </div>
        ) : (
          <>
            {photos.map((url, i) => (
              <div
                key={i}
                className="flex-1 rounded-md overflow-hidden bg-muted/40"
                style={{ aspectRatio: "2 / 3", maxWidth: "20%" }}
              >
                <img
                  src={url}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
            {/* Fill remaining cells (up to 5 total) */}
            {extra === 0 && photos.length < 5 &&
              Array.from({ length: 5 - photos.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="flex-1 rounded-md bg-muted/30"
                  style={{ aspectRatio: "2 / 3", maxWidth: "20%" }}
                />
              ))}
            {extra > 0 && (
              <div
                className="flex-1 rounded-md bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground"
                style={{ aspectRatio: "2 / 3", maxWidth: "20%" }}
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
