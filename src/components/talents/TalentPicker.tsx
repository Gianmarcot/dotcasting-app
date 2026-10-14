import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { FullscreenSheet } from "@/components/ui/fullscreen-sheet";
import { TalentSelectionPanel, type SelectionItem } from "@/components/talents/TalentSelectionPanel";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/field";
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
import { useTalents, type TalentFilters, type TalentWithAttributes } from "@/hooks/useTalents";
import { useCastingRole } from "@/hooks/useCastingRoles";
import { TalentFilterBar } from "@/components/talents/TalentFilterBar";
import { compareMatch, computeMatchScore, hasRoleRequirements, type MatchScore } from "@/lib/roleMatch";

export type TalentPickerSource =
  | { kind: "database" }
  | { kind: "shortlist"; label?: string; profileIds: string[] };

export interface TalentPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  source: TalentPickerSource;
  roleId?: string;
  initialSelectedIds: string[];
  /** Riceve gli id selezionati nell'ordine finale. */
  onConfirm: (ids: string[]) => Promise<void> | void;
  /** Riordino per trascinamento della selezione. */
  reorderable?: boolean;
  selectionLabel?: string;
  confirmLabel?: string;
  /** Se restituisce un testo, la rimozione di un id iniziale chiede conferma. */
  getRemovalWarning?: (profileId: string) => string | null;
}

const MatchBadge = ({ score }: { score: MatchScore }) => {
  const full = score.matched === score.total;
  const none = score.matched === 0;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-1 text-[12px] font-medium leading-[1.2] whitespace-nowrap text-white",
        full ? "bg-[#729128]" : none ? "bg-[#333333]" : "bg-[#C88500]"
      )}
    >
      {score.matched} requisiti su {score.total}
    </span>
  );
};

export const TalentPicker = ({
  open,
  onOpenChange,
  title,
  source,
  roleId,
  initialSelectedIds,
  onConfirm,
  selectionLabel = "Selezione",
  confirmLabel = "Conferma",
  getRemovalWarning,
  reorderable = false,
}: TalentPickerProps) => {
  const [filters, setFilters] = useState<TalentFilters>({});
  const [selected, setSelected] = useState<string[]>(initialSelectedIds);
  const [saving, setSaving] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);

  // reset all'apertura
  useEffect(() => {
    if (open) {
      setSelected(initialSelectedIds);
      setFilters({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const { data: role } = useCastingRole(roleId);
  const { data: filtered = [], isLoading } = useTalents(filters);
  const { data: all = [] } = useTalents({});

  const withRequirements = hasRoleRequirements(role);
  const scores = useMemo(() => {
    const map = new Map<string, MatchScore>();
    if (!role || !withRequirements) return map;
    for (const t of filtered) {
      map.set(
        t.id,
        computeMatchScore(
          { gender: t.gender, birth_date: t.birth_date, skills: t.attributes?.skills },
          role
        )
      );
    }
    return map;
  }, [filtered, role, withRequirements]);

  const shown = useMemo(() => {
    let list = filtered;
    if (source.kind === "shortlist") {
      const allowed = new Set(source.profileIds);
      list = list.filter((t) => allowed.has(t.id));
    }
    if (withRequirements) {
      list = [...list].sort((a, b) => compareMatch(scores.get(a.id)!, scores.get(b.id)!));
    }
    return list;
  }, [filtered, source, withRequirements, scores]);

  const dirty =
    selected.length !== initialSelectedIds.length ||
    selected.some((id, i) => id !== initialSelectedIds[i]);

  const requestClose = () => {
    if (saving) return;
    if (dirty) setDiscardOpen(true);
    else onOpenChange(false);
  };

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await onConfirm(selected);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const sourceLabel = source.kind === "database" ? "Database talenti" : source.label ?? "Shortlist";
  const items: SelectionItem[] = useMemo(() => shown.map((t) => ({ id: t.id, talent: t })), [shown]);
  const lookup = useMemo(() => {
    const m = new Map<string, SelectionItem>();
    for (const t of all) m.set(t.id, { id: t.id, talent: t });
    for (const t of shown) m.set(t.id, { id: t.id, talent: t });
    return m;
  }, [all, shown]);

  return (
    <>
      <FullscreenSheet open={open} onRequestClose={requestClose} title={title} closeLabel="Chiudi">
        <TalentSelectionPanel
          sourceLabel={sourceLabel}
          items={items}
          lookup={lookup}
          isLoading={isLoading}
          toolbar={
            <>
              <div className="relative">
                <FloatingInput
                  label="Cerca per parola chiave"
                  value={filters.search || ""}
                  onChange={(v) => setFilters({ ...filters, search: v || undefined })}
                />
                <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              </div>
              <TalentFilterBar filters={filters} onFiltersChange={setFilters} />
            </>
          }
          note={
            withRequirements ? (
              <p className="text-xs text-muted-foreground">Ordinati per compatibilità con i requisiti del ruolo</p>
            ) : null
          }
          renderBadge={(item) => {
            const s = scores.get(item.id);
            return s && s.total > 0 ? <MatchBadge score={s} /> : null;
          }}
          selected={selected}
          onSelectedChange={setSelected}
          initialSelectedIds={initialSelectedIds}
          getRemovalWarning={getRemovalWarning}
          selectionLabel={selectionLabel}
          reorderable={reorderable}
          actions={
            <>
              <Button variant="secondary" size="lg" onClick={requestClose} disabled={saving}>
                Annulla
              </Button>
              <Button size="lg" onClick={handleConfirm} disabled={saving || !dirty}>
                {saving ? "Salvataggio…" : confirmLabel}
              </Button>
            </>
          }
        />
      </FullscreenSheet>

      <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <AlertDialogContent className="z-[100]">
          <AlertDialogHeader>
            <AlertDialogTitle>Uscire senza salvare?</AlertDialogTitle>
            <AlertDialogDescription>Le modifiche alla selezione non confermate andranno perse.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continua a modificare</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setDiscardOpen(false);
                onOpenChange(false);
              }}
            >
              Esci senza salvare
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TalentPicker;
