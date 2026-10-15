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
import { Eye, GripVertical, LayoutGrid, List, X } from "lucide-react";
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
import { TalentTileView } from "@/pages/shared/TalentTile";
import { TalentRow, ROW_CHECKBOX } from "@/components/talents/TalentRow";
import { Checkbox } from "@/components/ui/checkbox";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TalentPreviewDrawer } from "@/components/talents/TalentPreviewDrawer";
import { buildDisplayName, buildInitials } from "@/components/talents/TalentBoardCard";

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
        "flex h-full min-h-[320px] flex-col gap-6 overflow-hidden rounded-3xl border border-dashed border-grey-600 p-8 transition-colors",
        dragging && "border-primary bg-primary/5",
        isOver && "bg-primary/10"
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
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("min-w-0", isDragging && "relative z-10 opacity-80")}
    >
      <TalentRow
        profile={t}
        requirements={[]}
        hideRequirements
        leading={sortable ? (
          <Button type="button" variant="ghost" size="icon-sm" aria-label={`Sposta ${name}`} className="w-6 cursor-grab touch-none active:cursor-grabbing" {...listeners} {...attributes}>
            <GripVertical className="h-4 w-4" />
          </Button>
        ) : undefined}
        trailing={<Button variant="ghost" size="icon-md" aria-label={`Togli ${name}`} onClick={onRemove}><X className="h-5 w-5" /></Button>}
      />
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
  const [view, setView] = useState<"list" | "grid">("list");
  const [previewTalent, setPreviewTalent] = useState<TalentWithAttributes | null>(null);
  const dragEnabled = useDragEnabled();

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const initialSet = useMemo(() => new Set(initialSelectedIds), [initialSelectedIds]);
  // TalentBoardGrid ragiona per profilo: mappa profilo ↔ id sorgente
  const byProfile = useMemo(() => new Map(items.map((i) => [i.talent.id, i])), [items]);

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
    <section aria-label={sourceLabel} className="flex min-h-0 min-w-0 flex-col gap-4">
      {toolbar}
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-muted-foreground">{items.length} talent</span>
        <ToggleGroup type="single" value={view} onValueChange={(value) => { if (value === "list" || value === "grid") setView(value); }} className="gap-1">
          <ToggleGroupItem value="list" aria-label="Vista lista" className="h-12 w-12 rounded-full p-0 hover:bg-field data-[state=on]:bg-field"><List className="h-5 w-5" /></ToggleGroupItem>
          <ToggleGroupItem value="grid" aria-label="Vista griglia" className="h-12 w-12 rounded-full p-0 hover:bg-field data-[state=on]:bg-field"><LayoutGrid className="h-5 w-5" /></ToggleGroupItem>
        </ToggleGroup>
      </div>
      {note}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <div className="@container min-w-0 px-4">
          <div className={view === "grid" ? "grid grid-cols-1 gap-4 @[480px]:grid-cols-2 @[720px]:grid-cols-3 @[1000px]:grid-cols-4 [&>*]:min-w-0" : "flex flex-col gap-2"}>
            {items.map((item) => {
              const t = item.talent;
              const checked = selectedSet.has(item.id);
              const height = t.attributes?.height;
              const card = view === "grid" ? (
                <TalentTileView tone="light" name={buildDisplayName(t)} initials={buildInitials(t)} photoUrl={t.profile_photo_url ?? null} meta={[height ? `${height} cm` : null, t.city].filter(Boolean).join(" • ")} selectable selected={checked} onToggle={() => toggle(t)} onOpenDetails={() => setPreviewTalent(t)} />
              ) : (
                <TalentRow profile={t} requirements={[]} hideRequirements onClick={() => toggle(t)} ariaPressed={checked}
                  leading={<Checkbox className={ROW_CHECKBOX} checked={checked} onCheckedChange={() => toggle(t)} aria-label={`Seleziona ${buildDisplayName(t)}`} />}
                  meta={renderBadge?.(item)}
                  trailing={<Button variant="ghost" size="icon-md" aria-label={`Anteprima di ${buildDisplayName(t)}`} onClick={() => setPreviewTalent(t)}><Eye className="h-5 w-5" /></Button>}
                />
              );
              return <div key={item.id} className="min-w-0">{dragEnabled && !checked ? <DraggableCard id={item.id}>{card}</DraggableCard> : card}</div>;
            })}
          </div>
        </div>
      )}
    </section>
  );

  const rightColumn = (
    <DropZone enabled={dragEnabled} dragging={draggingFromSource}>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-display uppercase text-base">{selectionLabel}</h3>
        <span className="text-sm text-muted-foreground">{selected.length}</span>
      </div>
      {selected.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-center text-sm text-muted-foreground">
          {dragEnabled
            ? "Trascina qui una scheda o toccala per aggiungerla alla selezione"
            : "Tocca una scheda per aggiungerla alla selezione"}
        </div>
      ) : (
        <SortableContext items={selected} strategy={verticalListSortingStrategy}>
          <ul className="-mx-4 min-h-0 flex-1 space-y-2 overflow-y-auto px-4">
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
        <div className="px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_427px] lg:items-start lg:gap-16 lg:px-10">
          <div className={cn("min-w-0 pb-32", mobileTab !== "source" && "hidden lg:block")}>{leftColumn}</div>
          <div className={cn("min-w-0 pb-32 lg:sticky lg:top-[80px] lg:h-[calc(100dvh-24px-80px)]", mobileTab !== "selection" && "hidden lg:block")}>{rightColumn}</div>
        </div>
        <DragOverlay>
          {dragging && draggingFromSource ? (
            <div className="w-40 rounded-xl bg-ink px-4 py-3 text-sm text-cream shadow-lg">
              {buildDisplayName(dragging.talent)}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      <TalentPreviewDrawer talent={previewTalent} open={!!previewTalent} onOpenChange={(open) => { if (!open) setPreviewTalent(null); }} />

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
