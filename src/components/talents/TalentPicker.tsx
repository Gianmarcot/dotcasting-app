import { useEffect, useMemo, useState, type ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PillTabs } from "@/components/ui/pill-tabs";
import { ModalNavBar } from "@/components/ui/modal-nav-bar";
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
import { TalentBoardGrid } from "@/components/talents/TalentBoardGrid";
import { buildDisplayName, buildInitials, buildMeta } from "@/components/talents/TalentBoardCard";
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
  /** Riordino della selezione (non ancora disponibile). */
  reorderable?: boolean;
  selectionLabel?: string;
  confirmLabel?: string;
  /** Se restituisce un testo, la rimozione di un id iniziale chiede conferma. */
  getRemovalWarning?: (profileId: string) => string | null;
}

const DROP_ID = "talent-picker-selection";

/** Trascinamento solo su schermi ≥1024px con puntatore preciso. */
const useDragEnabled = () => {
  const query = "(min-width: 1024px) and (pointer: fine)";
  const [enabled, setEnabled] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const on = () => setEnabled(mql.matches);
    mql.addEventListener("change", on);
    return () => mql.removeEventListener("change", on);
  }, []);
  return enabled;
};

const DraggableCard = ({ id, children }: { id: string; children: ReactNode }) => {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({ id });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      role={undefined}
      tabIndex={undefined}
      className={cn(isDragging && "opacity-40")}
    >
      {children}
    </div>
  );
};

const DropZone = ({ enabled, dragging, children }: { enabled: boolean; dragging: boolean; children: ReactNode }) => {
  const { setNodeRef, isOver } = useDroppable({ id: DROP_ID, disabled: !enabled });
  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex min-h-[320px] flex-col gap-4 rounded-2xl p-4 transition-colors",
        dragging && "bg-accent/40 outline-dashed outline-2 outline-primary",
        isOver && "bg-accent"
      )}
    >
      {children}
    </section>
  );
};

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
}: TalentPickerProps) => {
  const [filters, setFilters] = useState<TalentFilters>({});
  const [selected, setSelected] = useState<string[]>(initialSelectedIds);
  const [mobileTab, setMobileTab] = useState<"database" | "selection">("database");
  const [saving, setSaving] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [pendingRemoval, setPendingRemoval] = useState<{ id: string; message: string } | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragEnabled = useDragEnabled();

  // reset all'apertura
  useEffect(() => {
    if (open) {
      setSelected(initialSelectedIds);
      setFilters({});
      setMobileTab("database");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const { data: role } = useCastingRole(roleId);
  const { data: filtered = [], isLoading } = useTalents(filters);
  const { data: all = [] } = useTalents({});
  const byId = useMemo(() => new Map(all.map((t) => [t.id, t])), [all]);

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

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const initialSet = useMemo(() => new Set(initialSelectedIds), [initialSelectedIds]);
  const dirty =
    selected.length !== initialSelectedIds.length ||
    selected.some((id, i) => id !== initialSelectedIds[i]);

  const add = (id: string) => setSelected((prev) => (prev.includes(id) ? prev : [...prev, id]));
  const removeNow = (id: string) => setSelected((prev) => prev.filter((x) => x !== id));
  const requestRemove = (id: string) => {
    const message = initialSet.has(id) ? getRemovalWarning?.(id) ?? null : null;
    if (message) setPendingRemoval({ id, message });
    else removeNow(id);
  };
  const toggle = (t: TalentWithAttributes) =>
    selectedSet.has(t.id) ? requestRemove(t.id) : add(t.id);

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

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const onDragStart = (e: DragStartEvent) => setDraggingId(String(e.active.id));
  const onDragEnd = (e: DragEndEvent) => {
    setDraggingId(null);
    if (e.over?.id === DROP_ID) add(String(e.active.id));
  };

  const sourceLabel = source.kind === "database" ? "Database talenti" : source.label ?? "Shortlist";
  const draggingTalent = draggingId ? byId.get(draggingId) ?? shown.find((t) => t.id === draggingId) : null;

  const leftColumn = (
    <section className="flex min-h-0 flex-col gap-4">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-display uppercase text-lg tracking-wide">{sourceLabel}</h3>
        <span className="text-sm text-muted-foreground">{shown.length} talent</span>
      </div>
      <div className="relative">
        <FloatingInput
          label="Cerca per parola chiave"
          value={filters.search || ""}
          onChange={(v) => setFilters({ ...filters, search: v || undefined })}
        />
        <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
      </div>
      <TalentFilterBar filters={filters} onFiltersChange={setFilters} />
      {withRequirements && (
        <p className="text-xs text-muted-foreground">Ordinati per compatibilità con i requisiti del ruolo</p>
      )}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] w-full rounded-xl" />
          ))}
        </div>
      ) : shown.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Nessun talent trovato</p>
      ) : (
        <TalentBoardGrid
          talents={shown}
          onSelectTalent={toggle}
          selectedIds={selectedSet}
          renderBadge={(t) => {
            const s = scores.get(t.id);
            return s && s.total > 0 ? <MatchBadge score={s} /> : null;
          }}
          wrapCard={
            dragEnabled
              ? (t, card) => (selectedSet.has(t.id) ? card : <DraggableCard id={t.id}>{card}</DraggableCard>)
              : undefined
          }
        />
      )}
    </section>
  );

  const rightColumn = (
      <DropZone enabled={dragEnabled} dragging={!!draggingId}>
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-display uppercase text-lg tracking-wide">{selectionLabel}</h3>
          <span className="text-sm text-muted-foreground">{selected.length}</span>
        </div>
        {selected.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-2xl border-2 border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            {dragEnabled
              ? "Trascina qui una scheda o toccala per aggiungerla alla selezione"
              : "Tocca una scheda per aggiungerla alla selezione"}
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {selected.map((id) => {
              const t = byId.get(id);
              const name = t ? buildDisplayName(t) : "Talent";
              const meta = t ? buildMeta(t) : "";
              return (
                <li key={id} className="flex items-center gap-3 py-3">
                  <div className="h-14 w-10 shrink-0 overflow-hidden rounded-md bg-[#2C2C2A]">
                    {t?.profile_photo_url ? (
                      <img src={t.profile_photo_url} alt="" className="h-full w-full object-cover object-[50%_25%]" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-xs text-white">
                        {t ? buildInitials(t) : "?"}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-medium">{name}</p>
                    {meta && <p className="truncate text-sm text-muted-foreground">{meta}</p>}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Togli ${name}`}
                    onClick={() => requestRemove(id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </DropZone>
  );

  return (
    <>
      <DialogPrimitive.Root open={open} onOpenChange={(o) => (o ? onOpenChange(true) : requestClose())}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-[70] bg-foreground/30 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
          <DialogPrimitive.Content
            className="fixed inset-0 z-[80] flex flex-col bg-background outline-none data-[state=open]:animate-slide-up-panel data-[state=closed]:animate-out data-[state=closed]:fade-out-0 motion-reduce:data-[state=open]:animate-fade-in"
            aria-describedby={undefined}
          >
            <ModalNavBar className="fixed right-8 top-8 z-[90]" onClose={requestClose} labels={{ close: "Chiudi" }} />
            <div className="px-6 pt-10 pb-6 pr-28 lg:px-10">
              <DialogPrimitive.Title className="font-display uppercase text-3xl tracking-wide">{title}</DialogPrimitive.Title>
            </div>

            <div className="px-6 pb-4 lg:hidden">
              <div className="-mx-6 overflow-x-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <PillTabs
                  ariaLabel="Colonna"
                  className="w-max"
                  value={mobileTab}
                  onChange={setMobileTab}
                  options={[
                    { value: "database" as const, label: "Database" },
                    { value: "selection" as const, label: "Selezione", count: selected.length },
                  ]}
                />
              </div>
            </div>

            <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setDraggingId(null)}>
              <div className="min-h-0 flex-1 overflow-hidden px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8 lg:px-10">
                <div className={cn("h-full overflow-y-auto pb-8", mobileTab !== "database" && "hidden lg:block")}>
                  {leftColumn}
                </div>
                <div className={cn("h-full overflow-y-auto pb-8", mobileTab !== "selection" && "hidden lg:block")}>
                  {rightColumn}
                </div>
              </div>
              <DragOverlay>
                {draggingTalent ? (
                  <div className="w-40 rounded-xl bg-ink px-4 py-3 text-sm text-white shadow-lg">
                    {buildDisplayName(draggingTalent)}
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>

            <div className="flex items-center justify-between gap-4 border-t border-border bg-background px-6 py-4 lg:px-10">
              <span className="text-sm font-medium">
                {selected.length} {selected.length === 1 ? "selezionato" : "selezionati"}
              </span>
              <div className="flex gap-2">
                <Button variant="secondary" size="lg" onClick={requestClose} disabled={saving}>
                  Annulla
                </Button>
                <Button size="lg" onClick={handleConfirm} disabled={saving || !dirty}>
                  {saving ? "Salvataggio…" : confirmLabel}
                </Button>
              </div>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

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

      <AlertDialog open={!!pendingRemoval} onOpenChange={(o) => !o && setPendingRemoval(null)}>
        <AlertDialogContent className="z-[100]">
          <AlertDialogHeader>
            <AlertDialogTitle>Togliere questo talent?</AlertDialogTitle>
            <AlertDialogDescription>{pendingRemoval?.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingRemoval) removeNow(pendingRemoval.id);
                setPendingRemoval(null);
              }}
            >
              Togli
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TalentPicker;
