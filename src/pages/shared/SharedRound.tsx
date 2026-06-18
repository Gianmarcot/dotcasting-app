import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mapToTalent } from "@/lib/casting/fetchRoundTalents";
import { RoundPreset } from "@/lib/casting/roundPreset";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Loader2, Check, ImageOff, Maximize2, X } from "lucide-react";
import { toast } from "sonner";
import logoWhite from "@/assets/logo-white.png";
import { MOCK_SHARED_ROUND } from "./sharedRoundMock";

const logo = logoWhite;
const PREVIEW_TOKEN = "preview";

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
  <div className="min-h-screen bg-[#0F0F0F] flex flex-col items-center justify-center px-6 text-center">
    <img src={logo} alt="dotCasting" className="h-10 mb-8 opacity-80" />
    <h1 className="font-tenor uppercase tracking-wide text-2xl text-[#F5F0E8] mb-2">Link non disponibile</h1>
    <p className="text-white/60 max-w-sm">Il link non è più attivo oppure non è valido.</p>
  </div>
);

const StatusPill = ({ status }: { status: CompanyStatus | null }) => {
  if (status === "confirmed")
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#729128]/25 text-[#A8C76E]">
        <Check className="h-3 w-3" /> Confermato
      </span>
    );
  if (status === "rejected")
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#A30A2B]/25 text-[#E88599]">
        Scartato
      </span>
    );
  return null;
};

type MappedTalent = ReturnType<typeof mapToTalent>;

const buildTalent = (row: RpcTalentRow): MappedTalent =>
  mapToTalent({
    ...row.profile,
    attributes: row.attributes ? [row.attributes] : null,
    media: row.media ?? [],
  } as unknown as Parameters<typeof mapToTalent>[0]);

interface TalentTileProps {
  row: RpcTalentRow;
  selectable: boolean;
  selected: boolean;
  showStatus: boolean;
  onToggle: () => void;
  onOpenDetails: () => void;
}

function TalentTile({ row, selectable, selected, showStatus, onToggle, onOpenDetails }: TalentTileProps) {
  const talent = buildTalent(row);
  const photo = talent.photos?.[0];

  return (
    <div
      className={`group relative bg-[#1A1A1A] rounded-2xl transition-all ${
        selectable ? "cursor-pointer" : ""
      } ${selected ? "ring-2 ring-[#A30A2B]" : "ring-1 ring-white/5 hover:ring-white/15"}`}
      onClick={selectable ? onToggle : undefined}
    >
      {selectable && (
        <div
          className="absolute top-3 left-3 z-10"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          <div
            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
              selected ? "bg-[#A30A2B] border-[#A30A2B]" : "bg-[#1A1A1A] border-white/30"
            }`}
          >
            <Check
              className={`h-4 w-4 text-white transition-opacity ${selected ? "opacity-100" : "opacity-0"}`}
              strokeWidth={3}
            />
          </div>
        </div>
      )}

      {showStatus && (
        <div className="absolute top-3 right-3 z-10">
          <StatusPill status={row.company_status ?? null} />
        </div>
      )}

      <div className="px-12 pt-12 pb-0">
        <div className="overflow-hidden aspect-[5/7]">
          {photo ? (
            <img
              src={photo}
              alt={talent.nome}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/20 bg-[#0F0F0F]">
              <ImageOff className="h-6 w-6" />
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        <p className="font-display uppercase text-[18px] tracking-wide text-[#F5F0E8] leading-tight truncate">
          {talent.nome}
        </p>
        <p className="text-[12px] text-white/50 mt-0.5 truncate">
          {[talent.altezza_cm ? `${talent.altezza_cm} cm` : null, talent.citta].filter(Boolean).join(" • ")}
        </p>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpenDetails();
        }}
        className="absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center bg-transparent hover:bg-white/10 transition-colors"
        aria-label="Apri dettagli"
      >
        <Maximize2 className="h-6 w-6 text-white" />
      </button>
    </div>
  );
}

interface TalentDetailSheetProps {
  row: RpcTalentRow | null;
  open: boolean;
  onClose: () => void;
  token: string;
  selectable: boolean;
  selected: boolean;
  onToggle: () => void;
}

const DetailRow = ({ label, value }: { label: string; value: string | number | null | undefined }) => {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest opacity-40 mb-0.5">{label}</p>
      <p className="text-sm text-[#F5F0E8]">{value}</p>
    </div>
  );
};

const DetailSection = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const hasContent = Array.isArray(children) ? children.some(Boolean) : !!children;
  if (!hasContent) return null;
  return (
    <section className="space-y-3">
      <h3 className="font-tenor uppercase tracking-widest text-xs text-[#E88599]">{title}</h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">{children}</div>
    </section>
  );
};

function TalentDetailSheet({ row, open, onClose, token, selectable, selected, onToggle }: TalentDetailSheetProps) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  const dl = useMutation({
    mutationFn: async () => {
      if (!row) throw new Error("missing");
      const { data, error } = await supabase.functions.invoke("get-round-pdf-url", {
        body: { token, roleTalentId: row.role_talent_id },
      });
      if (error || !data?.url) throw new Error("Download non disponibile");
      return data.url as string;
    },
    onSuccess: (url) => window.open(url, "_blank", "noopener"),
    onError: () => toast.error("Download non disponibile"),
  });

  if (!row) return null;
  const talent = buildTalent(row);
  const photos = talent.photos ?? [];

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] p-0 bg-[#0F0F0F] text-[#F5F0E8] rounded-3xl overflow-hidden flex flex-col gap-0 border border-white/10">
          <DialogHeader className="sticky top-0 z-10 bg-[#0F0F0F]/95 backdrop-blur-md px-6 py-5 border-b border-white/10 flex-row items-center justify-between space-y-0 shrink-0">
            <div className="flex-1 min-w-0 text-left">
              <DialogTitle className="font-tenor uppercase tracking-widest text-xl text-[#F5F0E8] truncate text-left">
                {talent.nome}
              </DialogTitle>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                title="Scarica PDF"
                onClick={() => dl.mutate()}
                disabled={!row.pdf_path || dl.isPending}
                className="inline-flex items-center justify-center text-[#E88599] hover:bg-[#A30A2B]/20 disabled:opacity-30 disabled:cursor-not-allowed h-10 w-10 rounded-full transition-colors"
              >
                {dl.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Chiudi"
                className="inline-flex items-center justify-center text-[#F5F0E8] hover:bg-white/10 h-10 w-10 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-8">
              {photos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {photos.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setLightbox(p)}
                      className="aspect-[3/4] overflow-hidden bg-[#1A1A1A] rounded-2xl group"
                    >
                      <img
                        src={p}
                        alt={`${talent.nome} ${i + 1}`}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="aspect-[3/4] flex items-center justify-center bg-[#1A1A1A] rounded-2xl text-white/30">
                  <ImageOff className="h-8 w-8" />
                </div>
              )}

              <div className="bg-[#1A1A1A] rounded-3xl shadow-sm p-6 space-y-7">
                <DetailSection title="Generale">
                  <DetailRow label="Età" value={talent.eta ? `${talent.eta} anni` : null} />
                  <DetailRow label="Genere" value={talent.genere} />
                  <DetailRow label="Città" value={talent.citta} />
                  <DetailRow label="Nazionalità" value={talent.nazionalita} />
                  <DetailRow label="Etnia" value={talent.etnia} />
                  <DetailRow label="Città di lavoro" value={talent.citta_lavoro?.join(", ") ?? null} />
                </DetailSection>

                <DetailSection title="Aspetto">
                  <DetailRow label="Altezza" value={talent.altezza_cm ? `${talent.altezza_cm} cm` : null} />
                  <DetailRow label="Peso" value={talent.peso_kg ? `${talent.peso_kg} kg` : null} />
                  <DetailRow label="Occhi" value={talent.occhi} />
                  <DetailRow label="Capelli" value={talent.capelli} />
                  <DetailRow label="Lunghezza capelli" value={talent.capelli_lunghezza} />
                  <DetailRow label="Tipo capelli" value={talent.capelli_tipo} />
                  <DetailRow label="Segni particolari" value={talent.segni_particolari?.join(", ") ?? null} />
                </DetailSection>

                <DetailSection title="Misure">
                  <DetailRow label="Taglia maglia" value={talent.taglia_maglia} />
                  <DetailRow label="Taglia pantaloni" value={talent.taglia_pantaloni} />
                  <DetailRow label="Taglia giacca" value={talent.taglia_giacca} />
                  <DetailRow label="Scarpe" value={talent.numero_scarpe} />
                  <DetailRow label="Collo" value={talent.collo_cm ? `${talent.collo_cm} cm` : null} />
                  <DetailRow label="Petto" value={talent.petto_cm ? `${talent.petto_cm} cm` : null} />
                  <DetailRow label="Vita" value={talent.vita_cm ? `${talent.vita_cm} cm` : null} />
                  <DetailRow label="Fianchi" value={talent.fianchi_cm ? `${talent.fianchi_cm} cm` : null} />
                  <DetailRow
                    label="Spalle"
                    value={talent.larghezza_spalle_cm ? `${talent.larghezza_spalle_cm} cm` : null}
                  />
                </DetailSection>

                <DetailSection title="Lingue & abilità">
                  <DetailRow label="Lingue" value={talent.lingue?.join(", ") ?? null} />
                  <DetailRow label="Abilità" value={talent.abilita?.join(", ") ?? null} />
                  <DetailRow label="Patenti" value={talent.patenti?.join(", ") ?? null} />
                  <DetailRow label="Viaggi" value={talent.disponibilita_viaggio} />
                </DetailSection>
              </div>
            </div>
          </div>

          {selectable && (
            <div className="shrink-0 bg-[#0F0F0F]/95 backdrop-blur-md border-t border-white/10 px-6 py-4">
              <Button
                onClick={onToggle}
                className={`w-full rounded-full font-bold uppercase tracking-widest text-xs h-12 ${
                  selected
                    ? "bg-transparent border border-[#A30A2B] text-[#E88599] hover:bg-[#A30A2B]/10"
                    : "bg-[#A30A2B] hover:bg-[#850822] text-white"
                }`}
              >
                {selected ? (
                  "Rimuovi selezione"
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Seleziona talent
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            aria-label="Chiudi"
            className="absolute top-4 right-4 text-white/80 hover:text-white h-10 w-10 rounded-full flex items-center justify-center bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={lightbox}
            alt=""
            className="max-h-full max-w-full object-contain rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

export default function SharedRound() {
  const { token } = useParams<{ token: string }>();
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["shared-round", token],
    enabled: !!token,
    queryFn: async (): Promise<SharedRoundPayload> => {
      if (token === PREVIEW_TOKEN) return MOCK_SHARED_ROUND as unknown as SharedRoundPayload;
      const { data, error } = await supabase.rpc("get_shared_round", { p_token: token! });
      if (error) throw error;
      return (data ?? {}) as SharedRoundPayload;
    },
  });

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pwdOpen, setPwdOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [bulkDownloading, setBulkDownloading] = useState(false);

  useEffect(() => {
    if (!data?.talents) return;
    setSelected(new Set(data.talents.filter((t) => t.company_status === "confirmed").map((t) => t.role_talent_id)));
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

  const handleBulkDownload = async () => {
    if (!data?.talents) return;
    setBulkDownloading(true);
    const withPdf = data.talents.filter((t) => t.pdf_path);
    for (const t of withPdf) {
      try {
        const { data: res } = await supabase.functions.invoke("get-round-pdf-url", {
          body: { token, roleTalentId: t.role_talent_id },
        });
        if (res?.url) {
          window.open(res.url, "_blank", "noopener");
          await new Promise((r) => setTimeout(r, 400));
        }
      } catch {}
    }
    setBulkDownloading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white/60" />
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
  const detailsRow = detailsId ? (talents.find((t) => t.role_talent_id === detailsId) ?? null) : null;

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#F5F0E8] p-4 md:p-8 pb-32">
      <div className="max-w-[1280px] mx-auto">
        {/* Header */}
        <header className="text-center mb-20 md:mb-12">
          <div className="flex justify-center mb-8 opacity-90">
            <img src={logoSrc} alt={agencyLabel} className="h-[64px] max-w-[140px] object-contain" />
          </div>
          {casting?.title && <p className="font-display text-[20px] uppercase text-white/50 mb-3">/ {casting.title}</p>}
          <h1 className="font-display text-5xl md:text-6xl uppercase text-[#F5F0E8] leading-none mb-3">{role?.name}</h1>
          {round.label && <p className="font-display text-[20px] uppercase text-white/50">{round.label}</p>}
        </header>

        {!isLatest && (
          <div className="mb-8 max-w-2xl mx-auto bg-[#1A1A1A] rounded-3xl p-5 text-center text-sm text-white/60 border border-white/5">
            Selezione chiusa — questo invio è stato superato da uno più recente.
          </div>
        )}

        {talents.length === 0 ? (
          <p className="text-center text-white/60 py-16">Nessun talent in questo invio.</p>
        ) : (
          <>
            {/* Counter row */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-white/50">{talents.length} profili</span>
              <button
                type="button"
                onClick={handleBulkDownload}
                disabled={bulkDownloading}
                className="inline-flex items-center gap-2 border border-white/20 rounded-full text-sm px-5 py-2 bg-transparent text-[#F5F0E8] hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                {bulkDownloading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Download in corso…
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" /> Scarica tutti i pdf
                  </>
                )}
              </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {talents.map((t) => (
                <TalentTile
                  key={t.role_talent_id}
                  row={t}
                  selectable={selectable}
                  selected={selected.has(t.role_talent_id)}
                  showStatus={!isLatest || !hasPassword}
                  onToggle={() => toggle(t.role_talent_id)}
                  onOpenDetails={() => setDetailsId(t.role_talent_id)}
                />
              ))}
            </div>
          </>
        )}

        <footer className="pt-12 pb-16 text-center text-xs text-white/40 uppercase tracking-widest">
          {branding?.contact_email || "info@dotcgroup.com"}
        </footer>
      </div>

      {/* Floating selection bar */}
      {selectable && talents.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center justify-between gap-6 bg-[#F5F0E8] rounded-full shadow-2xl pl-8 pr-4 py-4 w-[min(480px,calc(100vw-2rem))] h-[80px]">
          <div className="flex items-center gap-3 text-[#1A1A1A]">
            <div className="w-6 h-6 rounded-full bg-[#A30A2B] flex items-center justify-center shrink-0">
              <Check className="h-4 w-4 text-white" strokeWidth={3} />
            </div>
            <span className="text-base whitespace-nowrap">
              <span className="font-bold">{selected.size}</span>
              <span className="opacity-70"> di {talents.length} selezionati</span>
            </span>
          </div>
          <Button
            onClick={() => setPwdOpen(true)}
            className="rounded-full bg-[#A30A2B] hover:bg-[#850822] text-white text-base px-7 h-12"
          >
            Prosegui →
          </Button>
        </div>
      )}

      <TalentDetailSheet
        row={detailsRow}
        open={!!detailsRow}
        onClose={() => setDetailsId(null)}
        token={token!}
        selectable={selectable}
        selected={detailsRow ? selected.has(detailsRow.role_talent_id) : false}
        onToggle={() => detailsRow && toggle(detailsRow.role_talent_id)}
      />

      <Dialog
        open={pwdOpen}
        onOpenChange={(o) => {
          if (!confirmMutation.isPending) setPwdOpen(o);
        }}
      >
        <DialogContent className="max-w-sm rounded-3xl bg-[#0F0F0F] text-[#F5F0E8] border border-white/10">
          <DialogHeader>
            <DialogTitle className="font-tenor uppercase tracking-widest text-[#F5F0E8]">
              Conferma selezione
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!password) return;
              confirmMutation.mutate(password);
            }}
            className="space-y-3"
          >
            <Label htmlFor="round-pwd" className="text-sm text-[#F5F0E8]">
              Inserisci la password fornita dall'agenzia
            </Label>
            <Input
              id="round-pwd"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              autoComplete="current-password"
              className="rounded-full bg-[#1A1A1A] border-white/10 text-[#F5F0E8] placeholder:text-white/40"
            />
            <p className="text-xs text-white/50">
              Confermerai {selected.size} talent. Gli altri saranno marcati come scartati.
            </p>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPwdOpen(false)}
                disabled={confirmMutation.isPending}
                className="rounded-full bg-transparent border-white/20 text-[#F5F0E8] hover:bg-white/10 hover:text-[#F5F0E8]"
              >
                Annulla
              </Button>
              <Button
                type="submit"
                disabled={confirmMutation.isPending || !password}
                className="rounded-full bg-[#A30A2B] hover:bg-[#850822] text-white"
              >
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
