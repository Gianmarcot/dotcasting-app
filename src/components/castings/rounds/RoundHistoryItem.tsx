import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, ChevronRight, Download, RefreshCw, FileText } from "lucide-react";
import { format } from "date-fns";
import { it as itLocale } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import type { CastingRound } from "@/hooks/useCastingRounds";
import { fetchRoundTalents } from "@/lib/casting/fetchRoundTalents";
import { generateRoundPdfs } from "@/lib/casting/generateRound";

interface Props {
  round: CastingRound;
  castingId: string;
}

interface RoundTalentRow {
  round_id: string;
  role_talent_id: string;
  pdf_path: string | null;
  generated_at: string | null;
  role_talent?: {
    id: string;
    profile?: { first_name: string | null; last_name: string | null; stage_name: string | null } | null;
  } | null;
}

export const RoundHistoryItem = ({ round, castingId }: Props) => {
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [regenerating, setRegenerating] = useState<{ done: number; total: number } | null>(null);

  const { data: items = [] } = useQuery({
    queryKey: ["round-detail", round.id],
    enabled: expanded,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("casting_round_talents")
        .select(`
          *,
          role_talent:role_talents!casting_round_talents_role_talent_id_fkey(
            id,
            profile:profiles!role_talents_profile_id_fkey(first_name, last_name, stage_name)
          )
        `)
        .eq("round_id", round.id);
      if (error) throw error;
      return data as unknown as RoundTalentRow[];
    },
  });

  const download = async (path: string) => {
    const { data, error } = await supabase.storage
      .from("casting-pdfs")
      .createSignedUrl(path, 60 * 60);
    if (error) {
      toast({ title: "Errore download", description: error.message, variant: "destructive" });
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  const regenerate = async () => {
    setRegenerating({ done: 0, total: items.length });
    try {
      const ids = items.map(i => i.role_talent_id);
      const talents = await fetchRoundTalents(ids);
      for (let i = 0; i < talents.length; i++) {
        try {
          await generateRoundPdfs({
            castingId, roundId: round.id,
            items: [talents[i]], preset: round.field_preset,
            onProgress: () => {},
          });
        } catch (e: any) {
          toast({ title: `Errore ${talents[i].talent.nome}`, description: e.message, variant: "destructive" });
        }
        setRegenerating({ done: i + 1, total: talents.length });
      }
      toast({ title: "Round rigenerato" });
      qc.invalidateQueries({ queryKey: ["round-detail", round.id] });
    } finally {
      setRegenerating(null);
    }
  };

  const talentName = (it: RoundTalentRow) =>
    it.role_talent?.profile?.stage_name?.trim() ||
    [it.role_talent?.profile?.first_name, it.role_talent?.profile?.last_name]
      .filter(Boolean).join(" ") || "—";

  return (
    <div className="border rounded-xl bg-white">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <FileText className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="font-medium">{round.label}</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(round.created_at), "d MMM yyyy 'alle' HH:mm", { locale: itLocale })}
            </p>
          </div>
        </div>
        <Badge variant="secondary">{round.talents_count} talent</Badge>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t pt-3">
          <div className="flex justify-end">
            <Button size="sm" variant="outline" onClick={regenerate} disabled={!!regenerating}>
              <RefreshCw className={`h-4 w-4 mr-2 ${regenerating ? "animate-spin" : ""}`} />
              Rigenera con dati attuali
            </Button>
          </div>

          {regenerating && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Rigenerazione...</span>
                <span>{regenerating.done} / {regenerating.total}</span>
              </div>
              <Progress value={(regenerating.done / Math.max(regenerating.total, 1)) * 100} />
            </div>
          )}

          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nessun talent in questo round</p>
          ) : (
            <div className="space-y-1">
              {items.map(it => (
                <div key={it.role_talent_id}
                  className="flex items-center justify-between py-2 px-2 hover:bg-muted/50 rounded">
                  <span className="text-sm">{talentName(it)}</span>
                  {it.pdf_path ? (
                    <Button size="sm" variant="ghost" onClick={() => download(it.pdf_path!)}>
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">Non generato</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
