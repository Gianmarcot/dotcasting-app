import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mapToTalent } from "@/lib/casting/fetchRoundTalents";
import { RoundPreset } from "@/lib/casting/roundPreset";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Loader2, Check, ImageOff } from "lucide-react";
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

const StatusPill = ({ status }: { status: CompanyStatus | null }) => {
  if (status === "confirmed")
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#729128]/15 text-[#729128]">
        <Check className="h-3 w-3" /> Confermato
      </span>
    );
  if (status === "rejected")
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#A30A2B]/10 text-[#A30A2B]">
        Scartato
      </span>
    );
  return null;
};

interface TalentTileProps {
  row: RpcTalentRow;
  token: string;
  selectable: boolean;
  selected: boolean;
  showStatus: boolean;
  onToggle: () => void;
}

function TalentTile({ row, token, selectable, selected, showStatus, onToggle }: TalentTileProps) {
  const talent = mapToTalent({
    ...row.profile,
    attributes: row.attributes ? [row.attributes] : null,
    media: row.media ?? [],
  } as unknown as Parameters<typeof mapToTalent>[0]);

  const photo = talent.photos?.[0];

  const dl = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("get-round-pdf-url", {
        body: { token, roleTalentId: row.role_talent_id },
      });
      if (error || !data?.url) throw new Error("Download non disponibile");
      return data.url as string;
    },
    onSuccess: (url) => window.open(url, "_blank", "noopener"),
    onError: () => toast.error("Download non disponibile"),
  });

  const attrs: Array<{ label: string; value: string | null; full?: boolean }> = [
    { label: "Altezza", value: talent.altezza_cm ? `${talent.altezza_cm} cm` : null },
    {
      label: "Taglia",
      value: talent.taglia_pantaloni || talent.taglia_maglia || null,
    },
    { label: "Occhi", value: talent.occhi ?? null },
    { label: "Capelli", value: talent.capelli ?? null },
    { label: "Città", value: talent.citta ?? null, full: true },
  ];

  return (
    <div
      className={`group relative bg-white border rounded-sm overflow-hidden transition-all ${
        selectable
          ? "cursor-pointer hover:shadow-xl border-black/5"
          : "border-black/5"
      } ${selected ? "ring-2 ring-[#A30A2B] border-[#A30A2B]" : ""}`}
      onClick={() => selectable && onToggle()}
    >
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        {selectable && (
          <div
            className={`w-7 h-7 border-2 border-[#A30A2B] flex items-center justify-center transition-colors shadow-sm ${
              selected ? "bg-[#A30A2B]" : "bg-white/80 backdrop-blur-sm"
            }`}
            aria-hidden
          >
            <Check
              className={`h-4 w-4 text-white transition-opacity ${
                selected ? "opacity-100" : "opacity-0"
              }`}
              strokeWidth={3}
            />
          </div>
        )}
        {selectable && selected && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
            Selezionato
          </span>
        )}
        {!selectable && showStatus && <StatusPill status={row.company_status ?? null} />}
      </div>

      <div className="aspect-[3/4] overflow-hidden bg-[#EFE7DA]">
        {photo ? (
          <img
            src={photo}
            alt={talent.nome}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#999]">
            <ImageOff className="h-8 w-8" />
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-4 gap-3">
          <h2 className="font-tenor text-lg sm:text-xl uppercase tracking-wider leading-tight">
            {talent.nome}
          </h2>
          <button
            type="button"
            title="Scarica PDF"
            onClick={(e) => {
              e.stopPropagation();
              dl.mutate();
            }}
            disabled={!row.pdf_path || dl.isPending}
            className="shrink-0 text-[#A30A2B] hover:opacity-70 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed p-1 -m-1"
          >
            {dl.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Download className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-[11px] uppercase tracking-wide border-t border-black/5 pt-4">
          {attrs.map((a) =>
            a.value ? (
              <div key={a.label} className={a.full ? "col-span-2" : ""}>
                <p className="opacity-40 mb-0.5">{a.label}</p>
                <p className="font-bold text-[#1A1A1A] normal-case tracking-normal text-sm">
                  {a.value}
                </p>
              </div>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}

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
      if (msg.includes("invalid_password")) toast.error("Password non corretta");
      else if (msg.includes("round_locked")) {
        toast.error("Selezione non più disponibile");
        qc.invalidateQueries({ queryKey: ["shared-round", token] });
        setPwdOpen(false);
      } else if (msg.includes("password_not_set")) {
        toast.error("Selezione non ancora abilitata, contatta l'agenzia");
        setPwdOpen(false);
      } else if (msg.includes("invalid_link")) {
        toast.error("Link non valido");
        setPwdOpen(false);
      } else toast.error("Errore, riprova");
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
    <div className="min-h-screen bg-[#F5F0E8] font-dm text-[#1A1A1A] p-4 md:p-8 pb-32">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-10 md:mb-12">
          <div className="flex justify-center mb-6 opacity-80">
            <img src={logoSrc} alt={agencyLabel} className="h-8 max-w-[140px] object-contain" />
          </div>
          <h1 className="font-tenor text-xl md:text-3xl uppercase tracking-widest mb-2 leading-tight">
            {casting?.title}
            {role?.name ? ` — ${role.name}` : ""}
          </h1>
          {round.label && (
            <p className="text-[11px] uppercase tracking-widest opacity-60">{round.label}</p>
          )}
        </header>

        {!isLatest && (
          <div className="mb-8 max-w-2xl mx-auto bg-white border border-black/5 rounded-sm p-4 text-center text-sm font-dm text-[#666]">
            Selezione chiusa — questo invio è stato superato da uno più recente.
          </div>
        )}

        {talents.length === 0 ? (
          <p className="text-center font-dm text-[#666] py-16">Nessun talent in questo invio.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {talents.map((t) => (
              <TalentTile
                key={t.role_talent_id}
                row={t}
                token={token!}
                selectable={selectable}
                selected={selected.has(t.role_talent_id)}
                showStatus={!isLatest || !hasPassword}
                onToggle={() => toggle(t.role_talent_id)}
              />
            ))}
          </div>
        )}

        <footer className="pt-12 pb-4 text-center font-dm text-xs text-[#999] uppercase tracking-widest">
          {agencyLabel}
        </footer>
      </div>

      {selectable && talents.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-black/10 px-4 sm:px-6 py-3 sm:py-4 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A30A2B] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#A30A2B]"></span>
              </span>
              <p className="text-xs sm:text-sm font-bold uppercase tracking-widest">
                {selected.size}{" "}
                <span className="font-normal opacity-60">
                  {selected.size === 1 ? "selezionato" : "selezionati"}
                </span>
              </p>
            </div>
            <Button
              onClick={() => setPwdOpen(true)}
              className="rounded-full bg-[#A30A2B] hover:bg-[#850822] text-white font-bold uppercase tracking-widest text-[10px] sm:text-xs px-6 sm:px-8 py-3 shadow-lg shadow-[#A30A2B]/20 h-auto"
            >
              <Check className="h-4 w-4 mr-2" />
              Conferma selezione
            </Button>
          </div>
        </div>
      )}

      <Dialog
        open={pwdOpen}
        onOpenChange={(o) => {
          if (!confirmMutation.isPending) setPwdOpen(o);
        }}
      >
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
                {confirmMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Conferma
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
