import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mapToTalent } from "@/lib/casting/fetchRoundTalents";
import { resolveCard, RoundPreset } from "@/lib/casting/roundPreset";
import { TalentCardWeb } from "@/lib/casting/TalentCardWeb";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Download, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

const logo = "/logo.png";

type CompanyStatus = "none" | "pending" | "proposed" | "confirmed" | "rejected";

interface RpcTalentRow {
  role_talent_id: string;
  pdf_path: string | null;
  company_status: CompanyStatus | null;
  profile: Record<string, unknown>;
  attributes: Record<string, unknown> | null;
  media: Array<{ url: string; sort_order: number; media_type: string; category: string | null }>;
}

interface BrandingPayload {
  agency_name?: string | null;
  agency_logo_url?: string | null;
  contact_email?: string | null;
}

interface SharedRoundPayload {
  round?: { id: string; label: string; field_preset: RoundPreset; shared_at: string };
  casting?: { title: string };
  role?: { name: string };
  branding?: BrandingPayload;
  talents?: RpcTalentRow[];
  is_latest_round?: boolean;
  has_password?: boolean;
}

const Unavailable = () => (
  <div className="min-h-screen bg-[#F5F0E8] flex flex-col items-center justify-center px-6 text-center">
    <img src={logo} alt="dotCasting" className="h-10 mb-8 opacity-80" />
    <h1 className="font-tenor uppercase tracking-wide text-2xl text-[#333333] mb-2">
      Link non disponibile
    </h1>
    <p className="font-dm text-[#666] max-w-sm">
      Il link non è più attivo oppure non è valido.
    </p>
  </div>
);

const StatusBadge = ({ status }: { status: CompanyStatus | null }) => {
  if (status === "confirmed")
    return (
      <Badge
        variant="secondary"
        className="bg-[#729128]/15 text-[#729128] pointer-events-none"
      >
        Confermato
      </Badge>
    );
  if (status === "rejected")
    return (
      <Badge
        variant="secondary"
        className="bg-[#A30A2B]/10 text-[#A30A2B] pointer-events-none"
      >
        Scartato
      </Badge>
    );
  return null;
};

const TalentBlock = ({
  row,
  preset,
  token,
  branding,
  selectable,
  selected,
  onToggle,
  showStatusBadge,
}: {
  row: RpcTalentRow;
  preset: RoundPreset;
  token: string;
  branding?: BrandingPayload;
  selectable: boolean;
  selected: boolean;
  onToggle: () => void;
  showStatusBadge: boolean;
}) => {
  const talent = mapToTalent({
    ...row.profile,
    attributes: row.attributes ? [row.attributes] : null,
    media: row.media ?? [],
  } as unknown as Parameters<typeof mapToTalent>[0]);

  const card = resolveCard(talent, preset, {
    agencyName: branding?.agency_name ?? null,
    agencyLogoUrl: branding?.agency_logo_url ?? null,
    agencyContactEmail: branding?.contact_email ?? null,
  });

  const dl = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("get-round-pdf-url", {
        body: { token, roleTalentId: row.role_talent_id },
      });
      if (error || !data?.url) throw new Error("Download non disponibile");
      return data.url as string;
    },
    onSuccess: (url) => {
      window.open(url, "_blank", "noopener");
    },
    onError: () => toast.error("Download non disponibile"),
  });

  return (
    <div
      className={`dc-card p-4 sm:p-6 transition-shadow ${
        selectable && selected ? "ring-2 ring-[#729128]/60" : ""
      }`}
    >
      {(selectable || showStatusBadge) && (
        <div className="flex items-center justify-between mb-4 gap-3">
          {selectable ? (
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <Checkbox
                checked={selected}
                onCheckedChange={onToggle}
                className="h-6 w-6"
              />
              <span className="font-dm text-sm text-[#333333]">
                {selected ? "Selezionato" : "Conferma talent"}
              </span>
            </label>
          ) : (
            <span />
          )}
          {showStatusBadge && <StatusBadge status={row.company_status ?? null} />}
        </div>
      )}
      <TalentCardWeb card={card} />
      <div className="mt-4 flex justify-end">
        <Button
          onClick={() => dl.mutate()}
          disabled={!row.pdf_path || dl.isPending}
          className="rounded-full"
        >
          {dl.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Scarica PDF
        </Button>
      </div>
    </div>
  );
};

export default function SharedRound() {
  const { token } = useParams<{ token: string }>();
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["shared-round", token],
    enabled: !!token,
    queryFn: async (): Promise<SharedRoundPayload> => {
      const { data, error } = await supabase.rpc("get_shared_round", { p_token: token! });
      if (error) throw error;
      return (data ?? {}) as SharedRoundPayload;
    },
  });

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pwdOpen, setPwdOpen] = useState(false);
  const [password, setPassword] = useState("");

  // Pre-populate selection from current company_status
  useEffect(() => {
    if (!data?.talents) return;
    setSelected(
      new Set(
        data.talents
          .filter((t) => t.company_status === "confirmed")
          .map((t) => t.role_talent_id)
      )
    );
  }, [data?.talents]);

  const confirmMutation = useMutation({
    mutationFn: async (pwd: string) => {
      const { data: res, error } = await supabase.rpc("confirm_round_selection", {
        p_token: token!,
        p_password: pwd,
        p_selected: Array.from(selected),
      });
      if (error) throw error;
      return res;
    },
    onSuccess: () => {
      toast.success("Selezione confermata");
      setPwdOpen(false);
      setPassword("");
      qc.invalidateQueries({ queryKey: ["shared-round", token] });
    },
    onError: (err: any) => {
      const msg = String(err?.message ?? "");
      if (msg.includes("invalid_password")) {
        toast.error("Password non corretta");
      } else if (msg.includes("round_locked")) {
        toast.error("Selezione non più disponibile");
        qc.invalidateQueries({ queryKey: ["shared-round", token] });
        setPwdOpen(false);
      } else if (msg.includes("password_not_set")) {
        toast.error("Selezione non ancora abilitata, contatta l'agenzia");
        setPwdOpen(false);
      } else if (msg.includes("invalid_link")) {
        toast.error("Link non valido");
        setPwdOpen(false);
      } else {
        toast.error("Errore, riprova");
      }
    },
  });

  const toggle = (id: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#666]" />
      </div>
    );
  }

  if (isError || !data?.round || !data.talents) return <Unavailable />;

  const { round, casting, role, talents, branding } = data;
  const isLatest = data.is_latest_round !== false;
  const hasPassword = !!data.has_password;
  const selectable = isLatest && hasPassword;
  const logoSrc = branding?.agency_logo_url || logo;
  const agencyLabel = branding?.agency_name || "dotCasting";

  return (
    <div className="min-h-screen bg-[#F5F0E8] pb-32">
      <header className="border-b border-[#E5DDD0] bg-[#F5F0E8]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex flex-col items-center text-center gap-3">
          <img src={logoSrc} alt={agencyLabel} className="h-10 max-w-[180px] object-contain" />
          <h1 className="font-tenor uppercase tracking-wide text-xl sm:text-2xl text-[#333333]">
            {casting?.title}
            {role?.name ? ` — ${role.name}` : ""}
          </h1>
          {round.label && (
            <p className="font-dm text-sm text-[#666]">{round.label}</p>
          )}
        </div>
      </header>

      {!isLatest && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6">
          <div className="dc-card p-4 text-sm font-dm text-[#666] text-center">
            Selezione chiusa — questo invio è stato superato da uno più recente.
          </div>
        </div>
      )}

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {talents.length === 0 ? (
          <p className="text-center font-dm text-[#666]">Nessun talent in questo invio.</p>
        ) : (
          talents.map((t) => (
            <TalentBlock
              key={t.role_talent_id}
              row={t}
              preset={round.field_preset}
              token={token!}
              branding={branding}
              selectable={selectable}
              selected={selected.has(t.role_talent_id)}
              onToggle={() => toggle(t.role_talent_id)}
              showStatusBadge={!isLatest || !hasPassword}
            />
          ))
        )}
      </main>

      {selectable && talents.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 border-t border-[#E5DDD0] bg-[#F5F0E8]/95 backdrop-blur">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            <span className="font-dm text-sm text-[#333333]">
              {selected.size} selezionati
            </span>
            <Button
              onClick={() => setPwdOpen(true)}
              className="rounded-full"
              size="lg"
            >
              <Check className="h-4 w-4 mr-2" />
              Conferma selezione
            </Button>
          </div>
        </div>
      )}

      <footer className="py-8 text-center font-dm text-xs text-[#999]">
        {agencyLabel}
      </footer>

      <Dialog open={pwdOpen} onOpenChange={(o) => { if (!confirmMutation.isPending) setPwdOpen(o); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Conferma selezione</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!password) return;
              confirmMutation.mutate(password);
            }}
            className="space-y-3"
          >
            <Label htmlFor="round-pwd" className="text-sm">
              Inserisci la password fornita dall'agenzia
            </Label>
            <Input
              id="round-pwd"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              autoComplete="current-password"
            />
            <p className="text-xs text-muted-foreground">
              Confermerai {selected.size} talent. Gli altri saranno marcati come scartati.
            </p>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPwdOpen(false)}
                disabled={confirmMutation.isPending}
              >
                Annulla
              </Button>
              <Button type="submit" disabled={confirmMutation.isPending || !password}>
                {confirmMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Conferma
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
