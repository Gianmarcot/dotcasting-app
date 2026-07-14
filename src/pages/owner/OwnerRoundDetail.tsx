import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Search, Share2, Link as LinkIcon, RotateCcw,
  Pencil, FileText, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useRoundDetail } from "@/hooks/useRoundDetail";
import { useShareRound } from "@/hooks/useShareRound";
import { useRegenerateRound } from "@/hooks/useRegenerateRound";
import { useTalentsMainPhotos } from "@/hooks/useTalentsMainPhotos";
import { TalentPreviewDrawer } from "@/components/talents/TalentPreviewDrawer";
import { RoundWizardDialog } from "@/components/castings/rounds/RoundWizardDialog";
import { ClientPasswordCard } from "@/components/castings/rounds/ClientPasswordCard";
import { RoundTalentTile } from "@/components/castings/rounds/RoundTalentTile";
import type { TalentWithAttributes } from "@/hooks/useTalents";
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
  const regen = useRegenerateRound();

  const [search, setSearch] = useState("");
  const [groupByStatus, setGroupByStatus] = useState(false);
  const [selected, setSelected] = useState<TalentWithAttributes | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [regenOpen, setRegenOpen] = useState(false);
  const [regenProgress, setRegenProgress] = useState<{ done: number; total: number } | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [roleName, setRoleName] = useState<string | null>(null);

  const round = data?.round;
  const isShared = round?.status === "shared";

  useEffect(() => {
    if (!round?.casting_role_id) return;
    let cancelled = false;
    supabase
      .from("casting_roles")
      .select("name")
      .eq("id", round.casting_role_id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setRoleName(data?.name ?? null);
      });
    return () => { cancelled = true; };
  }, [round?.casting_role_id]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const s = search.trim().toLowerCase();
    if (!s) return data.talents;
    return data.talents.filter((row) =>
      buildName(row.talent).toLowerCase().includes(s)
    );
  }, [data, search]);

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

  const talentIds = useMemo(
    () => (data?.talents ?? []).map((r) => r.talent.id),
    [data]
  );
  const { data: photosMap } = useTalentsMainPhotos(talentIds);

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

  const buildShareUrl = (token: string) => `${window.location.origin}/round/${token}`;

  const copyLink = async () => {
    if (!round?.share_token) return;
    const url = buildShareUrl(round.share_token);
    await navigator.clipboard.writeText(url).catch(() => {});
    toast({ title: "Link copiato", description: url });
  };

  const copyShareUrl = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl).catch(() => {});
    toast({ title: "Link copiato" });
  };

  const doShare = async () => {
    if (!round) return;
    try {
      const res = await share.mutateAsync(round.id);
      const url = buildShareUrl(res.share_token);
      setShareUrl(url);
      setShareDialogOpen(true);
    } catch (e: any) {
      toast({ title: "Errore", description: e.message, variant: "destructive" });
    }
  };

  const doRegen = async () => {
    if (!data || !round) return;
    setRegenOpen(false);
    const ids = data.talents.map((t) => t.roleTalentId);
    setRegenProgress({ done: 0, total: ids.length });
    try {
      const res = await regen.mutateAsync({
        roundId: round.id,
        castingId: round.casting_id,
        preset: round.field_preset,
        roleTalentIds: ids,
        onProgress: (done, total) => setRegenProgress({ done, total }),
      });
      if (res.errors.length === 0) {
        toast({ title: "PDF rigenerati", description: `${res.count} comp card aggiornate` });
      } else {
        toast({
          title: "Rigenerato con errori",
          description: `${res.errors.length} su ${res.count} falliti`,
          variant: "destructive",
        });
      }
    } catch (e: any) {
      toast({ title: "Errore", description: e?.message, variant: "destructive" });
    } finally {
      setRegenProgress(null);
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const pdfPathByRoleTalentId: Record<string, string | null> = Object.fromEntries(
    data.talents.map((t) => [t.roleTalentId, t.pdfPath])
  );

  const renderGrid = (rows: typeof filtered) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {rows.map((row) => (
        <RoundTalentTile
          key={row.talent.id}
          talent={row.talent}
          photo={photosMap?.get(row.talent.id)?.[0]}
          onClick={() => openTalent(row.talent)}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-up">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(`/owner/castings/${castingId}`)}
        className="-ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Torna al casting
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="font-display uppercase text-3xl tracking-wide text-foreground">
          {round.label}
        </h1>

        <div className="flex items-center gap-3">
          {isShared ? (
            <>
              <Button variant="secondary" size="md" onClick={copyLink}>
                <LinkIcon />
                Copia Link
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => setRegenOpen(true)}
                disabled={regen.isPending}
              >
                {regen.isPending ? <Loader2 className="animate-spin" /> : <RotateCcw />}
                Rigenera
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                size="md"
                onClick={() => setEditOpen(true)}
                disabled={regen.isPending}
              >
                <Pencil />
                Modifica
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => setRegenOpen(true)}
                disabled={regen.isPending || data.talents.length === 0}
              >
                {regen.isPending ? <Loader2 className="animate-spin" /> : <RotateCcw />}
                Rigenera PDF
              </Button>
              <Button size="md" onClick={doShare} disabled={share.isPending}>
                <Share2 />
                Condividi
              </Button>
            </>
          )}
        </div>
      </div>

      {regenProgress && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Rigenerazione PDF…</span>
            <span>{regenProgress.done} / {regenProgress.total}</span>
          </div>
          <Progress value={(regenProgress.done / Math.max(regenProgress.total, 1)) * 100} />
        </div>
      )}

      <div className={isShared ? "grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6" : ""}>
        <div className="space-y-5 min-w-0">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca un talent in questo invio"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 h-12 rounded-full"
              />
            </div>
            <div className="flex items-center gap-3">
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
              {filtered.length} di {data.talents.length} risultati
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              Nessun talent corrisponde
            </div>
          ) : grouped ? (
            <div className="space-y-8">
              {grouped.map(([statusKey, rows]) => {
                const meta = COMPANY_STATUS_OPTIONS.find((o) => o.value === statusKey);
                return (
                  <div key={statusKey} className="space-y-3">
                    <h3 className="text-sm font-display uppercase tracking-wider text-muted-foreground">
                      {meta?.label ?? "Senza stato"} ({rows.length})
                    </h3>
                    {renderGrid(rows)}
                  </div>
                );
              })}
            </div>
          ) : (
            renderGrid(filtered)
          )}
        </div>

        {isShared && round.casting_id && (
          <aside className="lg:sticky lg:top-6 self-start">
            <ClientPasswordCard castingId={round.casting_id} />
          </aside>
        )}
      </div>

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

      {round.casting_role_id && (
        <RoundWizardDialog
          mode="edit"
          open={editOpen}
          onOpenChange={setEditOpen}
          castingId={round.casting_id}
          roleId={round.casting_role_id}
          roleName={roleName ?? undefined}
          roundId={round.id}
          initialLabel={round.label}
          initialPreset={round.field_preset}
          initialRoleTalentIds={data.talents.map((t) => t.roleTalentId)}
          pdfPathByRoleTalentId={pdfPathByRoleTalentId}
        />
      )}

      <AlertDialog open={regenOpen} onOpenChange={setRegenOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rigenerare i PDF di questo invio?</AlertDialogTitle>
            <AlertDialogDescription>
              {data.talents.length} comp card verranno ricalcolate con i dati attuali dei
              talent e con lo stesso preset. La selezione dei talent e il link di
              condivisione non cambiano.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={doRegen}>Rigenera</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invio condiviso</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Da questo momento chiunque abbia il link vedrà i talent e i PDF correnti.
            </p>
            <div className="flex gap-2">
              <Input readOnly value={shareUrl ?? ""} onFocus={(e) => e.currentTarget.select()} />
              <Button onClick={copyShareUrl}>
                <LinkIcon />
                Copia
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              Chiudi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OwnerRoundDetail;
