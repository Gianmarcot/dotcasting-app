import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mapToTalent } from "@/lib/casting/fetchRoundTalents";
import { RoundPreset } from "@/lib/casting/roundPreset";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Loader2, Check, ImageOff, Maximize2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import logoWhite from "@/assets/logo-white.png";
import { MOCK_SHARED_ROUND } from "./sharedRoundMock";
import { TalentTile } from "./TalentTile";
import { cn } from "@/lib/utils";

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




interface TalentDetailSheetProps {
  row: RpcTalentRow | null;
  open: boolean;
  onClose: () => void;
  token: string;
  selectable: boolean;
  selected: boolean;
  onToggle: () => void;
  photoCountFromRound: number | null;
  talents: RpcTalentRow[];
  selectedSet: Set<string>;
  onSelectTalent: (id: string) => void;
}

const DetailRow = ({ label, value }: { label: string; value: string | number | null | undefined }) => {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
};

const DetailSection = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const hasContent = Array.isArray(children) ? children.some(Boolean) : !!children;
  if (!hasContent) return null;
  return (
    <section className="space-y-3">
      <h3 className="font-tenor uppercase tracking-widest text-xs text-[#1A1A1A]">{title}</h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">{children}</div>
    </section>
  );
};

const getTalentDisplayName = (row: RpcTalentRow): string => {
  const p = row.profile as Record<string, unknown>;
  const stage = (p.stage_name as string | null) ?? "";
  if (stage.trim()) return stage;
  const first = ((p.first_name as string | null) ?? "").trim();
  const last = ((p.last_name as string | null) ?? "").trim();
  return `${first} ${last}`.trim() || "Talent";
};

const getTalentAvatarUrl = (row: RpcTalentRow): string | undefined => {
  const p = row.profile as Record<string, unknown>;
  const explicit = p.profile_photo_url as string | null | undefined;
  if (explicit) return explicit;
  const first = row.media?.find((m) => m.media_type === "photo");
  return first?.url;
};

function TalentDetailSheet({
  row, open, onClose, token, selectable, selected, onToggle, photoCountFromRound,
  talents, selectedSet, onSelectTalent,
}: TalentDetailSheetProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeAvatarRef = useRef<HTMLButtonElement | null>(null);
  const touchStartX = useRef<number | null>(null);

  // Reset active photo whenever the talent changes
  useEffect(() => {
    setActiveIndex(0);
  }, [row?.role_talent_id]);

  const currentIdx = row ? talents.findIndex((t) => t.role_talent_id === row.role_talent_id) : -1;
  const goPrevTalent = () => {
    if (currentIdx > 0) onSelectTalent(talents[currentIdx - 1].role_talent_id);
  };
  const goNextTalent = () => {
    if (currentIdx >= 0 && currentIdx < talents.length - 1)
      onSelectTalent(talents[currentIdx + 1].role_talent_id);
  };

  // Center active mini-avatar in the strip
  useEffect(() => {
    activeAvatarRef.current?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [row?.role_talent_id]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNextTalent();
      else if (e.key === "ArrowLeft") goPrevTalent();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, currentIdx, talents.length]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 40) return;
    dx > 0 ? goPrevTalent() : goNextTalent();
  };

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
  const photoCount = photoCountFromRound ?? null;
  const allPhotos = talent.photos ?? [];
  const photos = photoCount == null ? allPhotos : allPhotos.slice(0, 2 + Math.max(0, photoCount));
  const heroPhoto = photos[Math.min(activeIndex, Math.max(photos.length - 1, 0))] ?? null;

  const activeName = getTalentDisplayName(row);
  const activeAvatar = getTalentAvatarUrl(row);
  const showStrip = talents.length > 1;
  const atStart = currentIdx <= 0;
  const atEnd = currentIdx >= talents.length - 1;

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent
          className={cn(
            "max-w-6xl w-[95vw] h-[90vh] p-0 bg-background text-foreground rounded-3xl overflow-hidden gap-0 border-border",
            "grid [&>.dc-dialog-close]:hidden",
            showStrip
              ? "grid-rows-[auto_auto_1fr]"
              : "grid-rows-[auto_1fr]"
          )}
        >
          {/* ---------- Header ---------- */}
          <DialogHeader className="flex-row items-center gap-3 px-4 md:px-6 py-3 border-b border-border space-y-0 shrink-0 bg-background">
            {/* Nav cluster */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={goPrevTalent}
                disabled={atStart}
                aria-label="Talent precedente"
                className="inline-flex items-center justify-center h-9 w-9 rounded-full hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="font-tenor text-[13px] tabular-nums text-muted-foreground min-w-[3rem] text-center select-none">
                {currentIdx + 1} / {talents.length}
              </span>
              <button
                type="button"
                onClick={goNextTalent}
                disabled={atEnd}
                aria-label="Talent successivo"
                className="inline-flex items-center justify-center h-9 w-9 rounded-full hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Active talent identity (center) */}
            <div className="flex-1 min-w-0 flex justify-center">
              <div className="inline-flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-primary bg-primary/10 text-primary max-w-full">
                <Avatar className="shrink-0 h-8 w-8">
                  <AvatarImage src={activeAvatar} alt={activeName} />
                  <AvatarFallback className="text-[10px]">
                    {activeName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-sm truncate">{activeName}</span>
                {selected && (
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground shrink-0">
                    <Check className="h-2.5 w-2.5" strokeWidth={3} />
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => dl.mutate()}
                disabled={!row.pdf_path || dl.isPending}
                className="rounded-full gap-2"
              >
                {dl.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                <span className="hidden sm:inline">Scarica PDF</span>
              </Button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Chiudi"
                className="inline-flex items-center justify-center h-9 w-9 rounded-full hover:bg-muted transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <DialogTitle className="sr-only">{talent.nome}</DialogTitle>
          </DialogHeader>

          {/* ---------- Talent strip (mini avatars) ---------- */}
          {showStrip && (
            <div className="relative border-b border-border bg-background shrink-0">
              <div
                className="overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
              >
                <div className="flex items-center gap-2 px-6 py-2.5 w-max mx-auto snap-x snap-mandatory">
                  {talents.map((t) => {
                    const isActive = t.role_talent_id === row.role_talent_id;
                    const isSelected = selectedSet.has(t.role_talent_id);
                    const name = getTalentDisplayName(t);
                    const avatarUrl = getTalentAvatarUrl(t);
                    return (
                      <button
                        key={t.role_talent_id}
                        ref={isActive ? activeAvatarRef : undefined}
                        type="button"
                        onClick={() => onSelectTalent(t.role_talent_id)}
                        title={name}
                        aria-label={name}
                        aria-current={isActive ? "true" : undefined}
                        className="relative shrink-0 snap-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <Avatar
                          className={cn(
                            "h-8 w-8 transition-all",
                            isActive
                              ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                              : "opacity-70 hover:opacity-100"
                          )}
                        >
                          <AvatarImage src={avatarUrl} alt={name} />
                          <AvatarFallback className="text-[10px]">
                            {name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {isSelected && (
                          <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-primary text-primary-foreground ring-2 ring-background">
                            <Check className="h-2 w-2" strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* edge fades (overlay, do not block clicks) */}
              <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent" />
            </div>
          )}

          {/* ---------- Body: gallery + info ---------- */}
          <div className="min-h-0 grid grid-cols-1 lg:grid-cols-5">
            {/* Left: gallery */}
            <div
              className="lg:col-span-3 min-h-0 bg-muted/30 border-b lg:border-b-0 lg:border-r border-border grid grid-rows-[1fr_auto]"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <div className="min-h-0 p-4 md:p-6 flex items-center justify-center">
                <div className="h-full max-h-full flex items-center justify-center">
                  <div className="h-full aspect-[5/7] max-h-full overflow-hidden rounded-2xl bg-muted">
                    {heroPhoto ? (
                      <img
                        src={heroPhoto}
                        alt={talent.nome}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ImageOff className="h-10 w-10" />
                      </div>
                    )}
                  </div>
                </div>
              </div>


              {photos.length > 1 && (
                <div className="p-3 md:px-6 md:pb-4 shrink-0">
                  <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                    <div className="flex gap-2 w-max mx-auto px-1">
                      {photos.map((p, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setActiveIndex(i)}
                          className={cn(
                            "shrink-0 w-[56px] aspect-[5/7] overflow-hidden rounded-lg bg-muted transition-all",
                            i === activeIndex
                              ? "ring-2 ring-primary ring-offset-2 ring-offset-background opacity-100"
                              : "opacity-60 hover:opacity-100"
                          )}
                        >
                          <img src={p} alt={`${talent.nome} ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: info card */}
            <div className="lg:col-span-2 min-h-0 grid grid-rows-[1fr_auto]">
              <div className="min-h-0 overflow-y-auto overscroll-contain">
                <div className="p-6 md:p-8 space-y-7">
                  <div>
                    <h2 className="font-tenor uppercase tracking-wide text-2xl md:text-3xl text-foreground leading-tight break-words">
                      {talent.nome}
                    </h2>
                  </div>

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

              {selectable && (
                <div className="shrink-0 bg-background border-t border-border px-6 py-4">
                  <Button
                    onClick={onToggle}
                    size="lg"
                    variant={selected ? "outline" : "default"}
                    className="w-full rounded-full"
                  >
                    {selected ? (
                      <>
                        <Check className="h-4 w-4" />
                        Selezionato · Rimuovi
                      </>
                    ) : (
                      "Seleziona talent"
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>



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

        {selectable && (
          <div className="flex items-center justify-center gap-6 mb-10 text-[14px]" style={{ color: "#999999" }}>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full border border-white/60 inline-flex items-center justify-center shrink-0">
                <Check className="h-2.5 w-2.5" strokeWidth={3} />
              </span>
              Seleziona i talent e invia la tua scelta
            </span>
            <span className="w-px h-4 bg-white/20" />
            <span className="flex items-center gap-1.5">
              <Maximize2 className="h-3.5 w-3.5 shrink-0" />
              Clicca per vedere tutti i dettagli
            </span>
          </div>
        )}

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

        <footer className="pt-12 pb-32 text-center text-s text-white/50 tracking-wide">
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
        photoCountFromRound={round.field_preset?.photoCount ?? null}
        talents={talents}
        selectedSet={selected}
        onSelectTalent={setDetailsId}
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
