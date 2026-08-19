import { useQuery } from "@tanstack/react-query";
import { CircleSlash, Clock3, ThumbsDown, ThumbsUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface BatchRow {
  id: string;
  talent_user_id: string;
  response: string | null;
  responded_at: string | null;
  title: string;
  name: string;
  photoUrl: string | null;
}

const useBatchSummary = (batchId: string | null) =>
  useQuery({
    queryKey: ["communication-batch", batchId],
    enabled: !!batchId,
    refetchInterval: 15000,
    queryFn: async (): Promise<BatchRow[]> => {
      const { data, error } = await supabase
        .from("communications")
        .select("id, talent_user_id, response, responded_at, title")
        .eq("batch_id", batchId!);
      if (error) throw error;

      const userIds = (data ?? []).map((c) => c.talent_user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, profile_photo_url")
        .in("user_id", userIds);
      const map = new Map((profiles ?? []).map((p) => [p.user_id, p]));

      return (data ?? []).map((c) => {
        const p = map.get(c.talent_user_id);
        return {
          ...c,
          name: `${p?.first_name ?? ""} ${p?.last_name ?? ""}`.trim() || "Talent",
          photoUrl: p?.profile_photo_url ?? null,
        };
      });
    },
  });

const RESPONSE_META: Record<string, { label: string; icon: typeof ThumbsUp; className: string }> = {
  available: { label: "Disponibile", icon: ThumbsUp, className: "text-[#729128]" },
  unavailable: { label: "Non disponibile", icon: ThumbsDown, className: "text-[#A30A2B]" },
  done: { label: "Evasa", icon: ThumbsUp, className: "text-[#729128]" },
};

/** Riepilogo di una comunicazione inviata a più talent. */
export const BatchSummaryDialog = ({
  batchId,
  open,
  onOpenChange,
}: {
  batchId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { data: rows = [], isLoading } = useBatchSummary(batchId);
  const answered = rows.filter((r) => r.response);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Riepilogo invio</DialogTitle>
          <DialogDescription>
            {rows.length > 0
              ? `${answered.length} risposte su ${rows.length} destinatari`
              : "Nessun destinatario"}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Caricamento…</p>
        ) : (
          <ul className="space-y-1">
            {rows.map((r) => {
              const meta = r.response ? RESPONSE_META[r.response] : null;
              const Icon = meta?.icon ?? (r.response ? CircleSlash : Clock3);
              return (
                <li
                  key={r.id}
                  className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-muted/40"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={r.photoUrl ?? undefined} />
                    <AvatarFallback className="text-xs">
                      {r.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1 text-sm text-foreground">{r.name}</span>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs ${
                      meta?.className ?? "text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {meta?.label ?? "In attesa"}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
};
