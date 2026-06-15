import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Search, Share2, Link as LinkIcon, RotateCcw, Edit, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useRoundDetail } from "@/hooks/useRoundDetail";
import { useShareRound } from "@/hooks/useShareRound";
import { VirtualBoardGrid } from "@/components/talents/VirtualBoardGrid";
import { TalentPreviewDrawer } from "@/components/talents/TalentPreviewDrawer";
import type { TalentWithAttributes } from "@/hooks/useTalents";
import type { MaterialIndicators } from "@/components/talents/TalentBoardCard";
import { COMPANY_STATUS_OPTIONS } from "@/hooks/useRoleTalents";

const buildName = (t: TalentWithAttributes) =>
  t.stage_name ||
  [t.first_name, t.last_name].filter(Boolean).join(" ") ||
  "Senza nome";

export const OwnerRoundDetail = () => {
  const { castingId, roundId } = useParams<{ castingId: string; roundId: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useRoundDetail(roundId);
  const share = useShareRound();

  const [search, setSearch] = useState("");
  const [groupByStatus, setGroupByStatus] = useState(false);
  const [selected, setSelected] = useState<TalentWithAttributes | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const round = data?.round;
  const isShared = round?.status === "shared";

  const filtered = useMemo(() => {
    if (!data) return [];
    const s = search.trim().toLowerCase();
    if (!s) return data.talents;
    return data.talents.filter((row) =>
      buildName(row.talent).toLowerCase().includes(s)
    );
  }, [data, search]);

  const materialBy = useMemo(() => {
    const m = new Map<string, MaterialIndicators>();
    if (!data) return m;
    for (const row of data.talents) {
      m.set(row.talent.id, {
        photos: row.photosCount,
        videos: row.videosCount,
        hasPdf: !!row.pdfPath,
      });
    }
    return m;
  }, [data]);

  const grouped = useMemo(() => {
    if (!groupByStatus) return null;
    const map = new Map<string, typeof filtered>();
    for (const row of filtered) {
      const key = row.companyStatus || "none";
      const arr = map.get(key) ?? [];
      arr.push(row);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  }, [filtered, groupByStatus]);

  const openTalent = (t: TalentWithAttributes) => {
    setSelected(t);
    setDrawerOpen(true);
  };

  const openPdf = async (pdfPath: string | null) => {
    if (!pdfPath) {
      toast({ title: "PDF non disponibile", variant: "destructive" });
      return;
    }
    const { data: signed, error } = await supabase.storage
      .from("casting-pdfs")
      .createSignedUrl(pdfPath, 60 * 60);
    if (error) {
      toast({ title: "Errore", description: error.message, variant: "destructive" });
      return;
    }
    window.open(signed.signedUrl, "_blank");
  };

  const copyLink = async () => {
    if (!round?.share_token) return;
    const url = `${window.location.origin}/r/${round.share_token}`;
    await navigator.clipboard.writeText(url).catch(() => {});
    toast({ title: "Link copiato", description: url });
  };

  const doShare = async () => {
    if (!round) return;
    try {
      const res = await share.mutateAsync(round.id);
      const url = `${window.location.origin}/r/${res.share_token}`;
      await navigator.clipboard.writeText(url).catch(() => {});
      toast({ title: "Invio condiviso", description: url });
    } catch (e: any) {
      toast({ title: "Errore", description: e.message, variant: "destructive" });
    }
  };

  const selectedRow = useMemo(
    () => (selected ? data?.talents.find((r) => r.talent.id === selected.id) : undefined),
    [selected, data]
  );

  if (isLoading || !data || !round) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-[10px]">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(`/owner/castings/${castingId}`)}
        className="-ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Torna al casting
      </Button>

      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-2xl text-foreground truncate">{round.label}</h1>
          <Badge
            variant="secondary"
            className={
              isShared
                ? "bg-[#729128]/15 text-[#729128]"
                : "bg-[#333333]/10 text-[#333333]"
            }
          >
            {isShared ? "Condiviso" : "Bozza"}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {isShared ? (
            <>
              <Button variant="outline" size="sm" onClick={copyLink}>
                <LinkIcon className="h-4 w-4 mr-2" />
                Copia link
              </Button>
              <Button variant="outline" size="sm" disabled>
                <RotateCcw className="h-4 w-4 mr-2" />
                Rigenera
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" disabled>
                <Edit className="h-4 w-4 mr-2" />
                Modifica
              </Button>
              <Button size="sm" onClick={doShare} disabled={share.isPending}>
                <Share2 className="h-4 w-4 mr-2" />
                Condividi
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca talent in questo invio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="group-status"
            checked={groupByStatus}
            onCheckedChange={setGroupByStatus}
          />
          <Label htmlFor="group-status" className="text-sm cursor-pointer">
            Raggruppa per stato
          </Label>
        </div>
        <span className="text-sm text-muted-foreground">
          {filtered.length} di {data.talents.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Nessun talent corrisponde
        </div>
      ) : grouped ? (
        <div className="space-y-6">
          {grouped.map(([statusKey, rows]) => {
            const meta = COMPANY_STATUS_OPTIONS.find((o) => o.value === statusKey);
            return (
              <div key={statusKey} className="space-y-2">
                <h3 className="text-xs uppercase tracking-wide text-muted-foreground">
                  {meta?.label ?? "Senza stato"} ({rows.length})
                </h3>
                <VirtualBoardGrid
                  talents={rows.map((r) => r.talent)}
                  materialBy={materialBy}
                  onSelectTalent={openTalent}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <VirtualBoardGrid
          talents={filtered.map((r) => r.talent)}
          materialBy={materialBy}
          onSelectTalent={openTalent}
        />
      )}

      <TalentPreviewDrawer
        talent={selected}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        extraAction={
          selectedRow?.pdfPath
            ? {
                label: "Comp card di questo invio",
                icon: <FileText className="h-4 w-4" />,
                onClick: () => openPdf(selectedRow.pdfPath),
              }
            : undefined
        }
      />
    </div>
  );
};

export default OwnerRoundDetail;
