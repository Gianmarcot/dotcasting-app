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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Loader2, Check, ImageOff, Eye, X } from "lucide-react";
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

const SelectedPill = () => (
  <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white text-[#A30A2B] shadow-sm">
    Selezionato
  </span>
);

type MappedTalent = ReturnType<typeof mapToTalent>;

const buildTalent = (row: RpcTalentRow): MappedTalent =>
  mapToTalent({
    ...row.profile,
    attributes: row.attributes ? [row.attributes] : null,
    media: row.media ?? [],
  } as unknown as Parameters<typeof mapToTalent>[0]);

interface TalentTileProps {
  row: RpcTalentRow;
  token: string;
  selectable: boolean;
  selected: boolean;
  showStatus: boolean;
  onToggle: () => void;
  onOpenDetails: () => void;
}

function TalentTile({ row, token, selectable, selected, showStatus, onToggle, onOpenDetails }: TalentTileProps) {
  const talent = buildTalent(row);
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
    { label: "Taglia", value: talent.taglia_pantaloni || talent.taglia_maglia || null },
    { label: "Occhi", value: talent.occhi ?? null },
    { label: "Capelli", value: talent.capelli ?? null },
    { label: "Città", value: talent.citta ?? null, full: true },
  ];

  return (
    <div
      className={`group relative bg-white rounded-3xl overflow-hidden shadow-sm transition-all ${
        selectable ? "cursor-pointer hover:shadow-md" : ""
      } ${selected ? "ring-2 ring-[#A30A2B]" : "ring-1 ring-black/5"}`}
      onClick={() => selectable && onToggle()}
    >
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        {selectable && (
          <div
            className={`w-8 h-8 rounded-full border-2 border-[#A30A2B] flex items-center justify-center transition-colors shadow-sm ${
              selected ? "bg-[#A30A2B]" : "bg-white/90 backdrop-blur-sm"
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
        {selectable && selected && <SelectedPill />}
      </div>

      {showStatus && (
        <div className="absolute top-3 right-3 z-10">
          <StatusPill status={row.company_status ?? null} />
        </div>
      )}

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
        <h2 className="font-tenor text-lg sm:text-xl uppercase tracking-wider leading-tight mb-3">
          {talent.nome}
        </h2>

        <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-[11px] uppercase tracking-wide border-t border-black/5 pt-3">
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

        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-black/5">
          <Button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails();
            }}
            className="flex-1 rounded-full bg-[#A30A2B] hover:bg-[#850822] text-white font-bold uppercase tracking-widest text-[11px] h-10"
          >
            <Eye className="h-4 w-4 mr-2" />
            Vedi dettagli
          </Button>
          <button
            type="button"
            title="Scarica PDF"
            onClick={(e) => {
              e.stopPropagation();
              dl.mutate();
            }}
            disabled={!row.pdf_path || dl.isPending}
            className="inline-flex items-center justify-center text-[#A30A2B] hover:bg-[#A30A2B]/5 disabled:opacity-30 disabled:cursor-not-allowed h-10 w-10 rounded-full transition-colors border border-[#A30A2B]/20 shrink-0"
          >
            {dl.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
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
      <p className="text-sm text-[#1A1A1A]">{value}</p>
    </div>
  );
};

const DetailSection = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const hasContent = Array.isArray(children) ? children.some(Boolean) : !!children;
  if (!hasContent) return null;
  return (
    <section className="space-y-3">
      <h3 className="font-tenor uppercase tracking-widest text-xs text-[#A30A2B]">{title}</h3>
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
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] p-0 bg-[#F5F0E8] rounded-3xl overflow-hidden flex flex-col gap-0 border-0">
          <DialogHeader className="sticky top-0 z-10 bg-[#F5F0E8]/95 backdrop-blur-md px-6 py-5 border-b border-black/5 flex-row items-center justify-between space-y-0 shrink-0">
            <div className="flex-1 min-w-0 text-left">
              <DialogTitle className="font-tenor uppercase tracking-widest text-xl text-[#1A1A1A] truncate text-left">
                {talent.nome}
              </DialogTitle>
              {selectable && selected && (
                <div className="flex items-center gap-2 mt-1.5">
                  <SelectedPill />
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                title="Scarica PDF"
                onClick={() => dl.mutate()}
                disabled={!row.pdf_path || dl.isPending}
                className="inline-flex items-center justify-center text-[#A30A2B] hover:bg-[#A30A2B]/10 disabled:opacity-30 disabled:cursor-not-allowed h-10 w-10 rounded-full transition-colors"
              >
                {dl.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Chiudi"
                className="inline-flex items-center justify-center text-[#333] hover:bg-black/5 h-10 w-10 rounded-full transition-colors"
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
                      className="aspect-[3/4] overflow-hidden bg-[#EFE7DA] rounded-2xl group"
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
                <div className="aspect-[3/4] flex items-center justify-center bg-[#EFE7DA] rounded-2xl text-[#999]">
                  <ImageOff className="h-8 w-8" />
                </div>
              )}

              <div className="bg-white rounded-3xl shadow-sm p-6 space-y-7">
                <DetailSection title="Generale">
                  <DetailRow label="Età" value={talent.eta ? `${talent.eta} anni` : null} />
                  <DetailRow label="Genere" value={talent.genere} />
                  <DetailRow label="Città" value={talent.citta} />
                  <DetailRow label="Nazionalità" value={talent.nazionalita} />
                  <DetailRow label="Etnia" value={talent.etnia} />
                  <DetailRow
                    label="Città di lavoro"
                    value={talent.citta_lavoro?.join(", ") ?? null}
                  />
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
                  <DetailRow label="Spalle" value={talent.larghezza_spalle_cm ? `${talent.larghezza_spalle_cm} cm` : null} />
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
            <div className="shrink-0 bg-white/95 backdrop-blur-md border-t border-black/5 px-6 py-4">
              <Button
                onClick={onToggle}
                className={`w-full rounded-full font-bold uppercase tracking-widest text-xs h-12 ${
                  selected
                    ? "bg-white border border-[#A30A2B] text-[#A30A2B] hover:bg-[#A30A2B]/5"
                    : "bg-[#A30A2B] hover:bg-[#850822] text-white"
                }`}
              >
                {selected ? "Rimuovi selezione" : (<><Check className="h-4 w-4 mr-2" />Seleziona talent</>)}
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
      const { data, error } = await supabase.rpc("get_shared_round", { p_token: token! });
      if (error) throw error;
      return (data ?? {}) as SharedRoundPayload;
    },
  });

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pwdOpen, setPwdOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [detailsId, setDetailsId] = useState<string | null>(null);

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
  const detailsRow = detailsId ? talents.find((t) => t.role_talent_id === detailsId) ?? null : null;

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
          <div className="mb-8 max-w-2xl mx-auto bg-white rounded-3xl shadow-sm p-5 text-center text-sm font-dm text-[#666]">
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
                onOpenDetails={() => setDetailsId(t.role_talent_id)}
              />
            ))}
          </div>
        )}

        <footer className="pt-12 pb-4 text-center font-dm text-xs text-[#999] uppercase tracking-widest">
          {agencyLabel}
        </footer>
      </div>

      {selectable && talents.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-black/5 px-4 sm:px-6 py-3 sm:py-4 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
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
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-tenor uppercase tracking-widest">Conferma selezione</DialogTitle>
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
              className="rounded-full"
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
                className="rounded-full"
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
