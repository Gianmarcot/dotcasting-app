import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RoundPreset } from "@/lib/casting/roundPreset";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Loader2, MousePointerClick, X } from "lucide-react";
import { toast } from "sonner";
import TalentTile, { type SharedRpcTalentRow, type SharedCompanyStatus } from "./_TalentTile";
import TalentDetailSheet from "./_TalentDetailSheet";

const logo = "/logo.png";

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
  talents?: SharedRpcTalentRow[];
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

const setsEqual = (a: Set<string>, b: Set<string>) => {
  if (a.size !== b.size) return false;
  for (const v of a) if (!b.has(v)) return false;
  return true;
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

  const initialConfirmed = useMemo(() => {
    if (!data?.talents) return new Set<string>();
    return new Set(
      data.talents
        .filter((t) => t.company_status === "confirmed")
        .map((t) => t.role_talent_id)
    );
  }, [data?.talents]);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<"browse" | "select">("browse");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    setSelected(new Set(initialConfirmed));
  }, [initialConfirmed]);

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
    onError: (err: unknown) => {
      const msg = String((err as { message?: string })?.message ?? "");
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
      if (n.has(id)) n.delete(id);
      else n.add(id);
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

  // se non selectable la modalità è "sola lettura" anche se mode === browse
  const tileMode: "browse" | "select" | "readonly" = !selectable
    ? "readonly"
    : mode;

  const hasChanges = !setsEqual(selected, initialConfirmed);
  const inSelectMode = selectable && mode === "select";

  const detailRow = detailId
    ? talents.find((t) => t.role_talent_id === detailId) ?? null
    : null;

  return (
    <div className="min-h-screen bg-[#F5F0E8] font-dm text-[#1A1A1A] pb-32">
      {/* HEADER sticky */}
      <header
        className={`sticky top-0 z-30 backdrop-blur-md border-b transition-colors ${
          inSelectMode
            ? "bg-[#A30A2B]/10 border-[#A30A2B]/20"
            : "bg-[#F5F0E8]/90 border-black/5"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={logoSrc}
                alt={agencyLabel}
                className="h-7 max-w-[120px] object-contain opacity-80"
              />
              <div className="min-w-0">
                <p className="font-tenor uppercase tracking-widest text-xs sm:text-sm truncate">
                  {casting?.title}
                  {role?.name ? ` · ${role.name}` : ""}
                </p>
                {round.label && (
                  <p className="text-[10px] uppercase tracking-widest text-[#999] truncate">
                    {round.label}
                  </p>
                )}
              </div>
            </div>

            {selectable && (
              <Button
                onClick={() => setMode((m) => (m === "select" ? "browse" : "select"))}
                variant={inSelectMode ? "default" : "outline"}
                className={`shrink-0 rounded-full uppercase tracking-widest text-[10px] sm:text-xs font-bold px-4 sm:px-5 h-9 ${
                  inSelectMode
                    ? "bg-[#A30A2B] text-white hover:bg-[#850822]"
                    : "bg-transparent border-[#A30A2B]/40 text-[#A30A2B] hover:bg-[#A30A2B]/10 hover:text-[#A30A2B]"
                }`}
              >
                {inSelectMode ? (
                  <>
                    <X className="h-3.5 w-3.5 mr-1.5" />
                    Fine
                  </>
                ) : (
                  <>
                    <MousePointerClick className="h-3.5 w-3.5 mr-1.5" />
                    Seleziona
                  </>
                )}
              </Button>
            )}
          </div>

          {/* istruzioni */}
          {selectable && (
            <div className="mt-3">
              {inSelectMode ? (
                <p className="text-xs sm:text-sm font-dm text-[#A30A2B] font-medium">
                  Modalità selezione attiva — tocca un talent per spuntarlo.
                </p>
              ) : (
                <>
                  <p className="text-xs sm:text-sm font-dm text-[#1A1A1A]">
                    Tocca un talent per vederne i dettagli. Attiva
                    <span className="font-bold"> Seleziona </span>
                    per spuntare rapidamente più talent.
                  </p>
                  <p className="text-[10px] sm:text-xs text-[#999] mt-0.5">
                    Potrai modificare la selezione finché il round è attivo.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 md:pt-8">
        {!isLatest && (
          <div className="mb-6 bg-white border border-black/5 p-4 text-center text-sm font-dm text-[#666]">
            <p className="font-bold text-[#1A1A1A] mb-1">Questa selezione è chiusa.</p>
            <p>È disponibile una versione più recente. Contatta l'agenzia per il link aggiornato.</p>
          </div>
        )}

        {talents.length === 0 ? (
          <p className="text-center font-dm text-[#666] py-16">
            Nessun talent in questo invio.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {talents.map((t) => (
              <TalentTile
                key={t.role_talent_id}
                row={t}
                selected={selected.has(t.role_talent_id)}
                mode={tileMode}
                onClick={() => {
                  if (tileMode === "select") {
                    toggle(t.role_talent_id);
                  } else {
                    setDetailId(t.role_talent_id);
                  }
                }}
              />
            ))}
          </div>
        )}

        <footer className="pt-12 pb-4 text-center font-dm text-xs text-[#999] uppercase tracking-widest">
          {agencyLabel}
        </footer>
      </main>

      {/* BARRA AZIONE */}
      {selectable && talents.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 px-3 sm:px-0 pb-3 sm:pb-6 pointer-events-none">
          <div
            className="pointer-events-auto mx-auto bg-white border border-black/10 shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-full sm:max-w-md px-5 py-2.5 flex items-center justify-between gap-3"
            style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex h-2.5 w-2.5 relative shrink-0">
                {hasChanges && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A30A2B] opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    hasChanges ? "bg-[#A30A2B]" : "bg-[#CCC]"
                  }`}
                ></span>
              </span>
              <p className="text-xs font-dm font-bold truncate">
                {selected.size === 0
                  ? "Nessun selezionato"
                  : `${selected.size} ${selected.size === 1 ? "selezionato" : "selezionati"}`}
              </p>
            </div>
            <Button
              onClick={() => setPwdOpen(true)}
              disabled={!hasChanges}
              className="shrink-0 rounded-full bg-[#A30A2B] hover:bg-[#850822] text-white font-bold uppercase tracking-widest text-[10px] sm:text-xs px-5 py-2 h-auto disabled:opacity-40 disabled:bg-[#A30A2B]"
            >
              Conferma
            </Button>
          </div>
        </div>
      )}

      {/* DETTAGLIO TALENT */}
      <TalentDetailSheet
        row={detailRow}
        token={token!}
        open={!!detailRow}
        onOpenChange={(o) => !o && setDetailId(null)}
        selected={detailRow ? selected.has(detailRow.role_talent_id) : false}
        canToggleSelection={selectable}
        onToggleSelection={() => detailRow && toggle(detailRow.role_talent_id)}
      />

      {/* DIALOG PASSWORD */}
      <Dialog
        open={pwdOpen}
        onOpenChange={(o) => {
          if (!confirmMutation.isPending) setPwdOpen(o);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-tenor uppercase tracking-widest text-lg">
              Conferma selezione
            </DialogTitle>
            <DialogDescription className="font-dm text-sm text-[#666] pt-2">
              Confermerai <span className="font-bold text-[#1A1A1A]">{selected.size}</span>{" "}
              {selected.size === 1 ? "talent" : "talent"}. I non selezionati saranno marcati come scartati.
              Potrai modificare la selezione finché il round è attivo.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!password) return;
              confirmMutation.mutate(password);
            }}
            className="space-y-3"
          >
            <div className="space-y-1.5">
              <Label htmlFor="round-pwd" className="text-xs uppercase tracking-widest text-[#666]">
                Password fornita dall'agenzia
              </Label>
              <Input
                id="round-pwd"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                inputMode="text"
              />
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPwdOpen(false)}
                disabled={confirmMutation.isPending}
              >
                Annulla
              </Button>
              <Button
                type="submit"
                disabled={confirmMutation.isPending || !password}
                className="bg-[#A30A2B] hover:bg-[#850822] text-white"
              >
                {confirmMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Check className="h-4 w-4 mr-2" />
                Conferma
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
