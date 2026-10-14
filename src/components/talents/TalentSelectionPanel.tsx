import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PillTabs } from "@/components/ui/pill-tabs";
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
import type { TalentWithAttributes } from "@/hooks/useTalents";
import { TalentBoardGrid } from "@/components/talents/TalentBoardGrid";
import { buildDisplayName, buildInitials, buildMeta } from "@/components/talents/TalentBoardCard";

/** Elemento selezionabile: `id` è l'identificatore della sorgente (profilo, role_talent, …). */
export interface SelectionItem {
  id: string;
  talent: TalentWithAttributes;
}

export interface TalentSelectionPanelProps {
  sourceLabel: string;
  /** Etichetta della scheda sinistra su schermi stretti. */
  sourceTabLabel?: string;
  /** Elementi visibili nella colonna sinistra (già filtrati e ordinati). */
  items: SelectionItem[];
  /** Tutti gli elementi noti, per mostrare la selezione anche se filtrata. */
  lookup: Map<string, SelectionItem>;
  isLoading?: boolean;
  toolbar?: ReactNode;
  note?: ReactNode;
  emptyText?: string;
  renderBadge?: (item: SelectionItem) => ReactNode;
  /** Selezione ordinata. */
  selected: string[];
  onSelectedChange: (ids: string[]) => void;
  initialSelectedIds: string[];
  getRemovalWarning?: (id: string) => string | null;
  selectionLabel: string;
  /** Riordino per trascinamento nella colonna destra (anche su touch). */
  reorderable?: boolean;
  /** Barra di conferma: se assente il pannello non la mostra. */
  actions?: ReactNode;
}

const DROP_ID = "talent-selection-drop";

/** Trascinamento fra colonne solo su schermi ≥1024px con puntatore preciso. */
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
    <div ref={setNodeRef} {...listeners} {...attributes} role={undefined} tabIndex={undefined} className={cn(isDragging && "opacity-40")}>
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

const SelectedRow = ({
  id,
  item,
  sortable,
  onRemove,
}: {
  id: string;
  item: SelectionItem | undefined;
  sortable: boolean;
  onRemove: () => void;
}) => {
  const { setNodeRef, listeners, attributes, transform, transition, isDragging } = useSortable({ id, disabled: !sortable });
  const t = item?.talent;
  const name = t ? buildDisplayName(t) : "Talent";
  const meta = t ? buildMeta(t) : "";
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("flex items-center gap-3 bg-background py-3", isDragging && "relative z-10 opacity-80")}
    >
      {sortable && (
        <button
          type="button"
          aria-label={`Sposta ${name}`}
          className="flex h-10 w-6 shrink-0 cursor-grab touch-none items-center justify-center text-muted-foreground active:cursor-grabbing"
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      )}
      <div className="h-14 w-10 shrink-0 overflow-hidden rounded-md bg-ink">
        {t?.profile_photo_url ? (
          <img src={t.profile_photo_url} alt="" className="h-full w-full object-cover object-[50%_25%]" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-xs text-white">{t ? buildInitials(t) : "?"}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-medium">{name}</p>
        {meta && <p className="truncate text-sm text-muted-foreground">{meta}</p>}
      </div>
      <Button variant="ghost" size="sm" aria-label={`Togli ${name}`} onClick={onRemove}>
        <X className="h-4 w-4" />
      </Button>
    </li>
  );
};

export const TalentSelectionPanel = ({
  sourceLabel,
  sourceTabLabel = "Database",
  items,
  lookup,
  isLoading,
  toolbar,
  note,
  emptyText = "Nessun talent trovato",
  renderBadge,
  selected,
  onSelectedChange,
  initialSelectedIds,
  getRemovalWarning,
  selectionLabel,
  reorderable = false,
  actions,
}: TalentSelectionPanelProps) => {
  const [mobileTab, setMobileTab] = useState<"source" | "selection">("source");
  const [pendingRemoval, setPendingRemoval] = useState<{ id: string; message: string } | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragEnabled = useDragEnabled();

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const initialSet = useMemo(() => new Set(initialSelectedIds), [initialSelectedIds]);
  // TalentBoardGrid ragiona per profilo: mappa profilo ↔ id sorgente
  const byProfile = useMemo(() => new Map(items.map((i) => [i.talent.id, i])), [items]);
  const selectedProfileIds = useMemo(
    () => new Set(selected.map((id) => lookup.get(id)?.talent.id).filter((x): x is string => !!x)),
    [selected, lookup]
  );

  const add = (id: string, atIndex?: number) => {
    if (selectedSet.has(id)) return;
    const next = [...selected];
    if (atIndex == null || atIndex < 0) next.push(id);
    else next.splice(atIndex, 0, id);
    onSelectedChange(next);
  };
  const removeNow = (id: string) => onSelectedChange(selected.filter((x) => x !== id));
  const requestRemove = (id: string) => {
    const message = initialSet.has(id) ? getRemovalWarning?.(id) ?? null : null;
    if (message) setPendingRemoval({ id, message });
    else removeNow(id);
  };
  const toggle = (t: TalentWithAttributes) => {
    const item = byProfile.get(t.id);
    if (!item) return;
    if (selectedSet.has(item.id)) requestRemove(item.id);
    else add(item.id);
  };

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );
  const onDragStart = (e: DragStartEvent) => setDraggingId(String(e.active.id));
  const onDragEnd = (e: DragEndEvent) => {
    setDraggingId(null);
    const activeId = String(e.active.id);
    const overId = e.over ? String(e.over.id) : null;
    if (!overId) return;
    if (selectedSet.has(activeId)) {
      if (overId !== activeId && selectedSet.has(overId)) {
        onSelectedChange(arrayMove(selected, selected.indexOf(activeId), selected.indexOf(overId)));
      }
      return;
    }
    if (overId === DROP_ID) add(activeId);
    else if (selectedSet.has(overId)) add(activeId, selected.indexOf(overId));
  };

  const dragging = draggingId ? lookup.get(draggingId) : null;
  const draggingFromSource = !!draggingId && !selectedSet.has(draggingId);

  const leftColumn = (
    <section className="flex min-h-0 flex-col gap-4">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-display uppercase text-lg tracking-wide">{sourceLabel}</h3>
        <span className="text-sm text-muted-foreground">{items.length} talent</span>
      </div>
      {toolbar}
      {note}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <TalentBoardGrid
          talents={items.map((i) => i.talent)}
          onSelectTalent={toggle}
          selectedIds={selectedProfileIds}
          renderBadge={renderBadge ? (t) => {
            const item = byProfile.get(t.id);
            return item ? renderBadge(item) : null;
          } : undefined}
          wrapCard={
            dragEnabled
              ? (t, card) => {
                  const item = byProfile.get(t.id);
                  return !item || selectedSet.has(item.id) ? card : <DraggableCard id={item.id}>{card}</DraggableCard>;
                }
              : undefined
          }
        />
      )}
    </section>
  );

  const rightColumn = (
    <DropZone enabled={dragEnabled} dragging={draggingFromSource}>
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
        <SortableContext items={selected} strategy={verticalListSortingStrategy}>
          <ul className="divide-y divide-border">
            {selected.map((id) => (
              <SelectedRow
                key={id}
                id={id}
                item={lookup.get(id)}
                sortable={reorderable}
                onRemove={() => requestRemove(id)}
              />
            ))}
          </ul>
        </SortableContext>
      )}
    </DropZone>
  );

  return (
    <>
      <div className="px-6 pb-4 lg:hidden">
        <div className="-mx-6 overflow-x-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <PillTabs
            ariaLabel="Colonna"
            className="w-max"
            value={mobileTab}
            onChange={(v) => setMobileTab(v as "source" | "selection")}
            options={[
              { value: "source" as const, label: sourceTabLabel },
              { value: "selection" as const, label: "Selezione", count: selected.length },
            ]}
          />
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={() => setDraggingId(null)}
      >
        <div className="min-h-0 flex-1 overflow-hidden px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8 lg:px-10">
          <div className={cn("h-full overflow-y-auto pb-8", mobileTab !== "source" && "hidden lg:block")}>{leftColumn}</div>
          <div className={cn("h-full overflow-y-auto pb-8", mobileTab !== "selection" && "hidden lg:block")}>{rightColumn}</div>
        </div>
        <DragOverlay>
          {dragging && draggingFromSource ? (
            <div className="w-40 rounded-xl bg-ink px-4 py-3 text-sm text-white shadow-lg">
              {buildDisplayName(dragging.talent)}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {actions && (
        <div className="flex items-center justify-between gap-4 border-t border-border bg-background px-6 py-4 lg:px-10">
          <span className="text-sm font-medium">
            {selected.length} {selected.length === 1 ? "selezionato" : "selezionati"}
          </span>
          <div className="flex gap-2">{actions}</div>
        </div>
      )}

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
