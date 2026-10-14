import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { it as itLocale } from "date-fns/locale";
import { CalendarClock, MapPin, FileText, MoreHorizontal, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FloatingInput, FloatingTextarea } from "@/components/ui/field";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  FISCAL_STATUS_DESCRIPTIONS,
  FISCAL_STATUS_LABELS,
  fiscalStatusOf,
  isFiscalStatusProblematic,
} from "@/lib/fiscalStatus";
import { useUpdateCasting } from "@/hooks/useCastings";
import { useToggleEngagementPublished } from "@/hooks/useTalentEngagements";
import { useCommunicationTemplates } from "@/hooks/useCommunicationTemplates";
import type { RoleTalentWithProfile } from "@/hooks/useRoleTalents";
import { nudgeEngagement } from "@/lib/casting/engagementNudge";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Props {
  castingId: string;
  roleId: string;
  roleName: string;
  roleLocation: string | null;
  talents: RoleTalentWithProfile[];
  isLoading?: boolean;
}

type EngagementCasting = {
  id: string;
  title: string;
  locations: string[] | null;
  start_date: string | null;
  call_datetime: string | null;
  venue_name: string | null;
  venue_address: string | null;
  talent_instructions: string | null;
};

const fmt = (iso: string) => format(new Date(iso), "d MMM yyyy, HH:mm", { locale: itLocale });

/** Chi compare: confermati su entrambi i lati ∪ già pubblicati. */
export const engagementRows = (talents: RoleTalentWithProfile[]) =>
  talents.filter(
    (t) =>
      t.published_to_talent ||
      (t.talent_status === "confirmed" && t.company_status === "confirmed")
  );

export const RoleEngagementsPanel = ({ castingId, roleId, roleName, roleLocation, talents, isLoading }: Props) => {
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [fiscalFor, setFiscalFor] = useState<RoleTalentWithProfile | null>(null);
  const [unpublishFor, setUnpublishFor] = useState<RoleTalentWithProfile | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const togglePublished = useToggleEngagementPublished();
  const { data: templates } = useCommunicationTemplates();
  const template = templates?.engagement_new;
  const canNudge = !!template?.enabled_app;

  const { data: casting } = useQuery({
    queryKey: ["engagement-casting", castingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("castings")
        .select("id, title, locations, start_date, call_datetime, venue_name, venue_address, talent_instructions")
        .eq("id", castingId)
        .single();
      if (error) throw error;
      return data as EngagementCasting;
    },
  });

  const { data: otherPublished = 0 } = useQuery({
    queryKey: ["engagement-other-published", castingId, roleId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("role_talents")
        .select("id, casting_role:casting_roles!inner(casting_id)", { count: "exact", head: true })
        .eq("casting_role.casting_id", castingId)
        .neq("casting_role_id", roleId)
        .eq("published_to_talent", true);
      if (error) throw error;
      return count ?? 0;
    },
  });

  const rows = useMemo(() => {
    const list = engagementRows(talents);
    const rank = (t: RoleTalentWithProfile) => (!t.published_to_talent ? 0 : t.talent_opened_at ? 2 : 1);
    return [...list].sort((a, b) => rank(a) - rank(b));
  }, [talents]);

  const doPublish = async (rt: RoleTalentWithProfile, published: boolean) => {
    setBusyId(rt.id);
    try {
      await togglePublished.mutateAsync({ id: rt.id, published, roleId });
      toast({
        title: published ? "Ingaggio pubblicato al talent" : "Ingaggio nascosto al talent",
        description: published
          ? "Ora compare in \"I miei casting\" del talent con data, luogo e istruzioni."
          : "Non è più visibile in \"I miei casting\" del talent.",
      });
    } catch {
      toast({ title: "Errore", variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  const requestPublish = (rt: RoleTalentWithProfile) => {
    if (isFiscalStatusProblematic(fiscalStatusOf(rt.profile))) setFiscalFor(rt);
    else void doPublish(rt, true);
  };

  const doNudge = async (rt: RoleTalentWithProfile) => {
    if (!casting || !template || !rt.profile) return;
    setBusyId(rt.id);
    try {
      await nudgeEngagement({
        roleTalentId: rt.id,
        profileId: rt.profile.id,
        roleName,
        roleLocation,
        casting,
        template,
      });
      toast({ title: "Sollecito inviato", description: "La comunicazione è di nuovo in cima, da leggere." });
    } catch (e: any) {
      toast({ title: "Errore", description: e?.message, variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  const fiscalStatus = fiscalFor ? fiscalStatusOf(fiscalFor.profile) : null;

  return (
    <div className="space-y-6">
      {/* Dettagli condivisi */}
      <div className="space-y-2">
        <div className="flex flex-col gap-4 rounded-3xl bg-cream-dark p-5 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <span className="inline-flex items-center gap-2">
              <CalendarClock className="h-4 w-4" />
              {casting?.call_datetime ? fmt(casting.call_datetime) : <span className="text-muted-foreground">Data da definire</span>}
            </span>
            <span className="inline-flex min-w-0 items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="min-w-0">
                {casting?.venue_name || <span className="text-muted-foreground">Luogo da definire</span>}
                {casting?.venue_address && <span className="block text-muted-foreground">{casting.venue_address}</span>}
              </span>
            </span>
            <span className="inline-flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {casting?.talent_instructions?.trim() ? "Istruzioni compilate" : <span className="text-[hsl(var(--warning))]">Istruzioni mancanti</span>}
            </span>
          </div>
          <Button variant="secondary" size="md" iconPosition="left" onClick={() => setEditOpen(true)} disabled={!casting}>
            <Pencil />
            Modifica
          </Button>
        </div>
        <p className="text-sm text-muted-foreground opacity-70">
          Questi dati sono condivisi da tutti i ruoli del casting
          {otherPublished > 0 &&
            `: ${otherPublished} ${otherPublished === 1 ? "ingaggio già pubblicato" : "ingaggi già pubblicati"} sugli altri ruoli`}
          .
        </p>
      </div>

      {/* Righe */}
      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : rows.length === 0 ? (
        <div className="dc-card p-10 text-center text-muted-foreground">
          <p>Nessun ingaggio</p>
          <p className="mt-2 text-sm">Gli ingaggi compaiono qui quando un talent è confermato sia dal talent sia dall'azienda.</p>
        </div>
      ) : (
        <div className="dc-card divide-y divide-border/40 overflow-hidden p-0">
          {rows.map((rt) => {
            const p = rt.profile;
            const name = [p?.first_name, p?.last_name].filter(Boolean).join(" ") || "Talent";
            const published = !!rt.published_to_talent;
            const opened = !!rt.talent_opened_at;
            const busy = busyId === rt.id;
            const status = !published
              ? "Confermato da entrambi i lati, ingaggio non ancora pubblicato"
              : opened
              ? `Aperto dal talent il ${fmt(rt.talent_opened_at!)}`
              : `Pubblicato${rt.published_at ? ` il ${fmt(rt.published_at)}` : ""}, non ancora aperto dal talent`;
            return (
              <div
                key={rt.id}
                className={cn(
                  "flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center",
                  !published && "bg-[hsl(var(--warning))]/10"
                )}
              >
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="aspect-[2/3] w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                    {p?.profile_photo_url && (
                      <img src={p.profile_photo_url} alt="" className="h-full w-full object-cover object-[50%_25%]" loading="lazy" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{name}</p>
                    <p className="text-sm text-muted-foreground">{status}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 max-md:w-full">
                  {!published && (
                    <Button size="md" className="max-md:flex-1" onClick={() => requestPublish(rt)} disabled={busy}>
                      Pubblica ingaggio
                    </Button>
                  )}
                  {published && !opened && canNudge && (
                    <Button variant="secondary" size="md" className="max-md:flex-1" onClick={() => doNudge(rt)} disabled={busy || !casting}>
                      Sollecita
                    </Button>
                  )}
                  {published && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          aria-label="Azioni ingaggio"
                          className="ml-auto flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {canNudge && (
                          <DropdownMenuItem onSelect={() => doNudge(rt)} disabled={!casting}>
                            Rinvia comunicazione
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onSelect={() => setUnpublishFor(rt)}>Annulla pubblicazione</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {casting && (
        <EngagementDetailsDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          casting={casting}
          otherPublished={otherPublished}
          onSaved={() => {
            qc.invalidateQueries({ queryKey: ["engagement-casting", castingId] });
            qc.invalidateQueries({ queryKey: ["casting-detail", castingId] });
          }}
        />
      )}

      <AlertDialog open={!!fiscalFor} onOpenChange={(o) => !o && setFiscalFor(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{fiscalStatus ? FISCAL_STATUS_LABELS[fiscalStatus] : ""}</AlertDialogTitle>
            <AlertDialogDescription>
              {fiscalStatus ? FISCAL_STATUS_DESCRIPTIONS[fiscalStatus] : ""} Puoi pubblicare comunque l'ingaggio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (fiscalFor) void doPublish(fiscalFor, true);
                setFiscalFor(null);
              }}
            >
              Pubblica comunque
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!unpublishFor} onOpenChange={(o) => !o && setUnpublishFor(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annullare la pubblicazione?</AlertDialogTitle>
            <AlertDialogDescription>
              L'ingaggio non sarà più visibile in "I miei casting" del talent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Indietro</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (unpublishFor) void doPublish(unpublishFor, false);
                setUnpublishFor(null);
              }}
            >
              Annulla pubblicazione
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const toLocalInput = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const EngagementDetailsDialog = ({
  open,
  onOpenChange,
  casting,
  otherPublished,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  casting: EngagementCasting;
  otherPublished: number;
  onSaved: () => void;
}) => {
  const update = useUpdateCasting();
  const [dt, setDt] = useState("");
  const [venue, setVenue] = useState("");
  const [address, setAddress] = useState("");
  const [instructions, setInstructions] = useState("");

  useEffect(() => {
    if (!open) return;
    setDt(toLocalInput(casting.call_datetime));
    setVenue(casting.venue_name ?? "");
    setAddress(casting.venue_address ?? "");
    setInstructions(casting.talent_instructions ?? "");
  }, [open, casting]);

  const save = async () => {
    try {
      await update.mutateAsync({
        id: casting.id,
        call_datetime: dt ? new Date(dt).toISOString() : null,
        venue_name: venue.trim() || null,
        venue_address: address.trim() || null,
        talent_instructions: instructions.trim() || null,
      });
      onSaved();
      toast({ title: "Dettagli ingaggio aggiornati" });
      onOpenChange(false);
    } catch {
      toast({ title: "Errore", description: "Impossibile salvare", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Dettagli ingaggio</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <FloatingInput label="Data e ora convocazione" type="datetime-local" value={dt} onChange={setDt} />
          <FloatingInput label="Nome location" value={venue} onChange={setVenue} maxLength={160} />
          <FloatingInput label="Indirizzo completo" value={address} onChange={setAddress} maxLength={300} />
          <FloatingTextarea label="Istruzioni per il talent" value={instructions} onChange={setInstructions} />
          <p className="text-sm text-muted-foreground opacity-70">
            Valgono per tutti i ruoli del casting
            {otherPublished > 0 && `, anche per ${otherPublished} ${otherPublished === 1 ? "talent che l'ha" : "talent che l'hanno"} già ricevuta`}.
          </p>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" size="md" onClick={() => onOpenChange(false)}>
            Annulla
          </Button>
          <Button size="md" onClick={save} disabled={update.isPending}>
            {update.isPending ? "Salvataggio…" : "Salva"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
