import { TalentThumb } from "@/components/talents/TalentRow";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { it as itLocale } from "date-fns/locale";
import { MoreHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useToggleEngagementPublished } from "@/hooks/useTalentEngagements";
import { useCommunicationTemplates } from "@/hooks/useCommunicationTemplates";
import { isEngaged, type RoleTalentWithProfile } from "@/hooks/useRoleTalents";
import { nudgeEngagement } from "@/lib/casting/engagementNudge";
import { toast } from "sonner";

interface Props {
  castingId: string;
  roleId: string;
  roleName: string;
  roleLocation: string | null;
  talents: RoleTalentWithProfile[];
  isLoading?: boolean;
}

/** Chi compare nella scheda: ingaggio pubblicato al talent. */
export const engagementRows = (talents: RoleTalentWithProfile[]) => talents.filter(isEngaged);

const ago = (iso: string) => formatDistanceToNow(new Date(iso), { locale: itLocale, addSuffix: true });

/** Scheda "Ingaggi": elenco essenziale degli ingaggi pubblicati. */
export const RoleEngagementsPanel = ({ castingId, roleId, roleName, roleLocation, talents, isLoading }: Props) => {
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
      return data;
    },
  });

  const rows = useMemo(() => {
    const list = engagementRows(talents);
    return [...list].sort((a, b) => Number(!!a.talent_opened_at) - Number(!!b.talent_opened_at));
  }, [talents]);

  const doNudge = async (rt: RoleTalentWithProfile) => {
    if (!casting || !template || !rt.profile) return;
    setBusyId(rt.id);
    try {
      await nudgeEngagement({ roleTalentId: rt.id, profileId: rt.profile.id, roleName, roleLocation, casting, template });
      toast.success("Sollecito inviato", { description: "La comunicazione è di nuovo in cima, da leggere." });
    } catch (e: any) {
      toast.error("Errore", { description: e?.message });
    } finally {
      setBusyId(null);
    }
  };

  const unpublish = async (rt: RoleTalentWithProfile) => {
    setBusyId(rt.id);
    try {
      await togglePublished.mutateAsync({ id: rt.id, published: false, roleId });
      toast.success("Ingaggio annullato", { description: "Non è più visibile al talent." });
    } catch {
      toast.error("Errore");
    } finally {
      setBusyId(null);
    }
  };

  if (isLoading) return <Skeleton className="h-48 w-full" />;

  if (rows.length === 0) {
    return (
      <div>
      <div className="mb-4 flex min-h-12 flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-base uppercase text-foreground">Ingaggi</h2>
      </div>
      <div className="py-10 text-center">
        <p className="font-medium text-foreground">Ancora nessun ingaggio</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Gli ingaggi compaiono qui quando, nella Shortlist, selezioni dei talent e usi l'azione Ingaggia.
        </p>
      </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex min-h-12 flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-base uppercase text-foreground">Ingaggi</h2>
      </div>
      {rows.map((rt) => {
        const p = rt.profile;
        const name = p?.stage_name?.trim() || [p?.first_name, p?.last_name].filter(Boolean).join(" ") || "Talent";
        const opened = !!rt.talent_opened_at;
        const busy = busyId === rt.id;
        return (
          <div key={rt.id} className="-mx-4 flex items-center gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-muted/30">
            <TalentThumb profile={p} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{name}</p>
              <p className="text-sm text-muted-foreground">
                {rt.published_at ? `Pubblicato ${ago(rt.published_at)}` : "Pubblicato"}
                {" · "}
                {opened ? `aperto ${ago(rt.talent_opened_at!)}` : "non ancora aperto"}
              </p>
            </div>
            {!opened && canNudge && (
              <Button variant="secondary" size="md" onClick={() => doNudge(rt)} disabled={busy || !casting}>
                Sollecita
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Azioni ingaggio"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-foreground shadow-sm"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setUnpublishFor(rt)}>Annulla ingaggio</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      })}

      <AlertDialog open={!!unpublishFor} onOpenChange={(o) => !o && setUnpublishFor(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annullare l'ingaggio?</AlertDialogTitle>
            <AlertDialogDescription>L'ingaggio non sarà più visibile in "I miei casting" del talent.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Indietro</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (unpublishFor) void unpublish(unpublishFor);
                setUnpublishFor(null);
              }}
            >
              Annulla ingaggio
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
