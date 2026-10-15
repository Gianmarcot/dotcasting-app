import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  DndContext,
  MouseSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { ChevronDown, Eye, Search, X } from "lucide-react";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { FullscreenSheet } from "@/components/ui/fullscreen-sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { PillTabs } from "@/components/ui/pill-tabs";
import { Surface } from "@/components/ui/surface";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { TalentPreviewDrawer } from "@/components/talents/TalentPreviewDrawer";
import { ROW_CHECKBOX, TalentRow, talentRowName } from "@/components/talents/TalentRow";
import { compareRequirements, evaluateRequirements, getAge, toRequirementSubject, type RequirementResult } from "@/lib/roleMatch";
import { listRequirements, readRoleRequirements, requirementFilters } from "@/lib/roleRequirements";
import { pillOff, pillOn, pillsAfterManualChange, type PillKind, type PillState } from "@/lib/requirementPills";
import { cn } from "@/lib/utils";

export interface TalentPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  roleId?: string;
  /** Profili attualmente in shortlist, nell'ordine della shortlist. */
  shortlistIds: string[];
  /** Scrittura immediata: aggiunge il talent al ruolo. */
  onAdd: (profileId: string) => Promise<void>;
  /** Scrittura immediata: toglie il talent dal ruolo. */
  onRemove: (profileId: string) => Promise<void>;
  /** Se restituisce un testo, togliere il talent chiede conferma. */
  getRemovalWarning?: (profileId: string) => string | null;
}

type SortKey = "relevance" | "name" | "age" | "recent";
const SORT_LABELS: Record<SortKey, string> = {
  relevance: "Pertinenza",
  name: "Nome",
  age: "Età",
  recent: "Aggiunti di recente",
};
const DROP_ID = "shortlist-drop";
const EMPTY: TalentFilters = {};

const useDragEnabled = () => {
  const query = "(min-width: 1024px) and (pointer: fine)";
  const [enabled, setEnabled] = useState(() => (typeof window !== "undefined" ? window.matchMedia(query).matches : false));
  useEffect(() => {
    const mql = window.matchMedia(query);
    const on = () => setEnabled(mql.matches);
    mql.addEventListener("change", on);
    return () => mql.removeEventListener("change", on);
  }, []);
  return enabled;
};

const Draggable = ({ id, enabled, children }: { id: string; enabled: boolean; children: ReactNode }) => {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({ id, disabled: !enabled });
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} role={undefined} tabIndex={undefined} className={cn(isDragging && "opacity-40")}>
      {children}
    </div>
  );
};

const DropArea = ({ dragging, children }: { dragging: boolean; children: ReactNode }) => {
  const { setNodeRef, isOver } = useDroppable({ id: DROP_ID });
  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex h-full min-h-0 flex-col gap-6 rounded-3xl border border-dashed border-grey-600 p-8 transition-colors",
        dragging && "border-2 border-ink bg-field/40",
        isOver && "bg-field",
      )}
    >
      {children}
    </section>
  );
};

const PILL_LABELS: Record<PillKind, string> = {
  mandatory: "Requisiti obbligatori",
  optional: "Requisiti facoltativi",
};

export const TalentPicker = ({
  open,
  onOpenChange,
  title,
  roleId,
  shortlistIds = [],
  onAdd,
  onRemove,
  getRemovalWarning,
}: TalentPickerProps) => {
  const [filters, setFilters] = useState<TalentFilters>({});
  const [pills, setPills] = useState<PillState>({ mandatory: false, optional: false });
  const [sort, setSort] = useState<SortKey>("relevance");
  const [mobileTab, setMobileTab] = useState<"source" | "selection">("source");
  const [pendingRemoval, setPendingRemoval] = useState<{ ids: string[]; message: string } | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragEnabled = useDragEnabled();

  // Selezione locale: aggiornata subito, poi riallineata alla shortlist salvata.
  const [selected, setSelected] = useState<string[]>(shortlistIds);
  const shortlistKey = shortlistIds.join(",");
  useEffect(() => {
    setSelected(shortlistIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortlistKey]);

  const { data: role } = useCastingRole(roleId);
  const roleReqs = useMemo(() => (role ? readRoleRequirements(role) : null), [role]);
  const sets = useMemo(
    () => ({
      mandatory: roleReqs ? requirementFilters(roleReqs, true) : EMPTY,
      optional: roleReqs ? requirementFilters(roleReqs, false) : EMPTY,
    }),
    [roleReqs],
  );
  const availablePills = (["mandatory", "optional"] as PillKind[]).filter((k) => Object.keys(sets[k]).length > 0);

  // All'apertura: filtri sui requisiti obbligatori, se il ruolo ne ha.
  const initRef = useRef(false);
  useEffect(() => {
    if (!open) {
      initRef.current = false;
      return;
    }
    if (initRef.current || (roleId && !role)) return;
    initRef.current = true;
    const hasMandatory = Object.keys(sets.mandatory).length > 0;
    setFilters(hasMandatory ? { ...sets.mandatory } : {});
    setPills({ mandatory: hasMandatory, optional: false });
    setSort("relevance");
    setFiltersOpen(false);
    setSelected(shortlistIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, role, sets]);

  const togglePill = (kind: PillKind, on: boolean) => {
    setFilters((f) => (on ? pillOn(f, sets[kind]) : pillOff(f, sets[kind])));
    setPills((p) => ({ ...p, [kind]: on }));
  };
  const changeFilters = (next: TalentFilters) => {
    setPills((p) => pillsAfterManualChange(next, sets, p));
    setFilters(next);
  };
  const resetAll = () => {
    setFilters({ search: filters.search });
    setPills({ mandatory: false, optional: false });
  };

  const { data: filtered = [], isLoading } = useTalents(filters);
  const { data: all = [] } = useTalents({});
  const byId = useMemo(() => {
    const m = new Map<string, TalentWithAttributes>();
    for (const t of all) m.set(t.id, t);
    for (const t of filtered) m.set(t.id, t);
    return m;
  }, [all, filtered]);

  const withRequirements = !!roleReqs && listRequirements(roleReqs).length > 0;
  const reqCache = useMemo(() => new Map<string, RequirementResult[]>(), [roleReqs]);
  const requirementsOf = (t: TalentWithAttributes | undefined): RequirementResult[] => {
    if (!t || !roleReqs || !withRequirements) return [];
    let r = reqCache.get(t.id);
    if (!r) {
      r = evaluateRequirements(toRequirementSubject(t), roleReqs);
      reqCache.set(t.id, r);
    }
    return r;
  };

  const shown = useMemo(() => {
    const list = [...filtered];
    if (sort === "relevance" && withRequirements) {
      list.sort((a, b) => compareRequirements(requirementsOf(a), requirementsOf(b)));
    } else if (sort === "name") {
      list.sort((a, b) => talentRowName(a).localeCompare(talentRowName(b), "it"));
    } else if (sort === "age") {
      const age = (t: TalentWithAttributes) => getAge(t.birth_date) ?? Number.POSITIVE_INFINITY;
      list.sort((a, b) => age(a) - age(b));
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, sort, withRequirements, roleReqs]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  const add = async (id: string, undoable = true) => {
    if (selectedRef.current.includes(id)) return;
    setSelected((s) => [...s, id]);
    try {
      await onAdd(id);
      const name = talentRowName(byId.get(id));
      if (undoable) toast(`${name} aggiunto alla shortlist`, { action: { label: "Annulla", onClick: () => void removeNow(id, false) } });
    } catch {
      setSelected((s) => s.filter((x) => x !== id));
      toast.error("Non è stato possibile aggiungere il talent");
    }
  };
  const removeNow = async (id: string, undoable = true) => {
    setSelected((s) => s.filter((x) => x !== id));
    try {
      await onRemove(id);
      const name = talentRowName(byId.get(id));
      if (undoable) toast(`${name} tolto dalla shortlist`, { action: { label: "Annulla", onClick: () => void add(id, false) } });
    } catch {
      setSelected((s) => (s.includes(id) ? s : [...s, id]));
      toast.error("Non è stato possibile togliere il talent");
    }
  };
  const requestRemove = (id: string) => {
    const message = getRemovalWarning?.(id) ?? null;
    if (message) setPendingRemoval({ ids: [id], message });
    else void removeNow(id);
  };

  const addMany = async (ids: string[], undoable = true) => {
    const todo = ids.filter((id) => !selectedRef.current.includes(id));
    if (!todo.length) return;
    setSelected((s) => [...s, ...todo.filter((id) => !s.includes(id))]);
    const done: string[] = [];
    for (const id of todo) {
      try {
        await onAdd(id);
        done.push(id);
      } catch {
        setSelected((s) => s.filter((x) => x !== id));
      }
    }
    if (done.length < todo.length) toast.error(`${todo.length - done.length} talent non aggiunti`);
    if (undoable && done.length)
      toast(`${done.length} talent aggiunti alla shortlist`, { action: { label: "Annulla", onClick: () => void removeMany(done, false) } });
  };
  const removeMany = async (ids: string[], undoable = true) => {
    const todo = ids.filter((id) => selectedRef.current.includes(id));
    if (!todo.length) return;
    setSelected((s) => s.filter((x) => !todo.includes(x)));
    const done: string[] = [];
    for (const id of todo) {
      try {
        await onRemove(id);
        done.push(id);
      } catch {
        setSelected((s) => (s.includes(id) ? s : [...s, id]));
      }
    }
    if (done.length < todo.length) toast.error(`${todo.length - done.length} talent non tolti`);
    if (undoable && done.length)
      toast(`${done.length} talent tolti dalla shortlist`, { action: { label: "Annulla", onClick: () => void addMany(done, false) } });
  };
  const requestRemoveMany = (ids: string[]) => {
    const risky = ids.filter((id) => selectedRef.current.includes(id) && getRemovalWarning?.(id));
    if (risky.length)
      setPendingRemoval({
        ids,
        message: `${risky.length} ${risky.length === 1 ? "talent è" : "talent sono"} in una selezione o hanno un ingaggio pubblicato: togliendoli dalla shortlist perderai queste informazioni.`,
      });
    else void removeMany(ids);
  };
  const shownIds = shown.map((t) => t.id);
  const shownSelected = shownIds.filter((id) => selectedSet.has(id)).length;
  const allState: boolean | "indeterminate" =
    shownIds.length > 0 && shownSelected === shownIds.length ? true : shownSelected > 0 ? "indeterminate" : false;
  const activeFilters = Object.entries(filters).filter(([k, v]) => k !== "search" && v !== undefined && v !== "" && v !== null).length;
  const toggle = (id: string) => (selectedSet.has(id) ? requestRemove(id) : void add(id));

  const sensors = useSensors(useSensor(MouseSensor, { activationConstraint: { distance: 8 } }));
  const onDragEnd = (e: DragEndEvent) => {
    setDragging(false);
    if (e.over?.id === DROP_ID) void add(String(e.active.id));
  };

  const previewList = useMemo(() => shown, [shown]);
  const previewTalent = previewId ? byId.get(previewId) ?? null : null;

  const leftColumn = (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex h-12 min-w-[240px] max-w-[550px] flex-1 items-center gap-4 rounded-full bg-field px-5">
          <Search className="h-5 w-5 shrink-0" />
          <input
            type="search"
            value={filters.search || ""}
            onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })}
            placeholder="Cerca per parola chiave"
            aria-label="Cerca per parola chiave"
            className="h-full min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-field-disabled-foreground"
          />
        </label>
        <button
          type="button"
          aria-expanded={filtersOpen}
          onClick={() => setFiltersOpen((o) => !o)}
          className="flex h-12 items-center gap-3 rounded-full bg-field pl-5 pr-3.5 text-sm text-ink transition-colors hover:opacity-90"
        >
          <span className="flex items-center gap-1.5">
            Filtri
            {activeFilters > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[12px] font-medium leading-none text-white">
                {activeFilters}
              </span>
            )}
          </span>
          <ChevronDown className={cn("h-5 w-5 transition-transform duration-200", filtersOpen && "rotate-180")} />
        </button>
        <div className="ml-auto flex items-center gap-4">
          <span className="whitespace-nowrap text-sm text-field-disabled-foreground">
            {shown.length} di {all.length} risultati
          </span>
          <Surface variant="base">
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger
                aria-label="Ordina per"
                className="h-12 w-auto gap-3 rounded-full border-0 bg-[var(--field-bg)] pl-5 pr-3.5 text-sm text-ink"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                  <SelectItem key={k} value={k}>
                    {SORT_LABELS[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Surface>
        </div>
      </div>

      <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          <TalentFilterBar filters={filters} onFiltersChange={changeFilters} surface="base" onReset={resetAll} forceReset={pills.mandatory || pills.optional} />
        </CollapsibleContent>
      </Collapsible>

      {availablePills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {availablePills.map((k) =>
            pills[k] ? (
              <span key={k} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-[15px] font-medium text-white">
                {PILL_LABELS[k]}
                <button type="button" aria-label={`Spegni ${PILL_LABELS[k]}`} onClick={() => togglePill(k, false)} className="-mr-1 flex">
                  <X className="h-5 w-5" />
                </button>
              </span>
            ) : (
              <button
                key={k}
                type="button"
                onClick={() => togglePill(k, true)}
                className="inline-flex items-center rounded-full border border-[var(--grey-400)] bg-white px-4 py-2 text-[15px] font-medium text-ink transition-colors hover:bg-field"
              >
                {PILL_LABELS[k]}
              </button>
            ),
          )}
        </div>
      )}

      {isLoading ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Caricamento…</p>
      ) : shown.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Nessun talent trovato</p>
      ) : (
        <div className="flex flex-col gap-2 px-4">
          <label className="flex cursor-pointer items-center gap-4 py-2 text-sm font-medium text-ink">
            <Checkbox
              className={ROW_CHECKBOX}
              checked={allState}
              onCheckedChange={() => (allState === true ? requestRemoveMany(shownIds) : void addMany(shownIds))}
            />
            Seleziona tutti ({shownIds.length})
          </label>
          {shown.map((t) => {
            const isSel = selectedSet.has(t.id);
            return (
              <Draggable key={t.id} id={t.id} enabled={dragEnabled && !isSel}>
                <TalentRow
                  profile={t}
                  requirements={requirementsOf(t)}
                  onClick={() => toggle(t.id)}
                  ariaPressed={isSel}
                  leading={
                    <Checkbox
                      className={ROW_CHECKBOX}
                      checked={isSel}
                      onCheckedChange={() => toggle(t.id)}
                      aria-label={`Seleziona ${talentRowName(t)}`}
                    />
                  }
                  trailing={
                    <button
                      type="button"
                      aria-label={`Anteprima di ${talentRowName(t)}`}
                      onClick={() => setPreviewId(t.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-field"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  }
                />
              </Draggable>
            );
          })}
        </div>
      )}
    </section>
  );

  const rightColumn = (
    <DropArea dragging={dragging}>
      <div className="flex shrink-0 items-baseline justify-between gap-4">
        <h3 className="font-display text-base uppercase">Shortlist</h3>
        <span className="text-sm text-field-disabled-foreground">{selected.length}</span>
      </div>
      {selected.length === 0 ? (
        <p className="flex flex-1 items-center justify-center text-center text-sm text-field-label">
          Scegli i talent dalla colonna di sinistra per aggiungerli alla shortlist
        </p>
      ) : (
        <div className="-mx-4 min-h-0 flex-1 overflow-y-auto px-4">
          <div className="flex flex-col gap-2">
            {selected.map((id) => {
              const t = byId.get(id);
              return (
                <TalentRow
                  key={id}
                  profile={t}
                  requirements={[]}
                  hideRequirements
                  onClick={() => setPreviewId(id)}
                  trailing={
                    <button
                      type="button"
                      aria-label={`Togli ${talentRowName(t)} dalla shortlist`}
                      onClick={() => requestRemove(id)}
                      className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-field"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  }
                />
              );
            })}
          </div>
        </div>
      )}
    </DropArea>
  );

  return (
    <>
      <FullscreenSheet
        open={open}
        onRequestClose={() => onOpenChange(false)}
        title={title}
        closeLabel="Chiudi"
        className="top-8"
        titleClassName="text-[21px]"
      >
        <div className="px-6 pb-4 lg:hidden">
          <PillTabs
            ariaLabel="Colonna"
            className="w-max"
            value={mobileTab}
            onChange={(v) => setMobileTab(v as "source" | "selection")}
            options={[
              { value: "source" as const, label: "Database" },
              { value: "selection" as const, label: "Shortlist", count: selected.length },
            ]}
          />
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={() => setDragging(true)}
          onDragEnd={onDragEnd}
          onDragCancel={() => setDragging(false)}
        >
          <div className="min-h-0 flex-1 overflow-hidden px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_427px] lg:gap-16 lg:px-10">
            <div className={cn("h-full overflow-y-auto pb-8", mobileTab !== "source" && "hidden lg:block")}>{leftColumn}</div>
            <div className={cn("h-full pb-8", mobileTab !== "selection" && "hidden lg:block")}>{rightColumn}</div>
          </div>
        </DndContext>
      </FullscreenSheet>

      <TalentPreviewDrawer
        talent={previewTalent}
        talents={previewList.some((t) => t.id === previewId) ? previewList : undefined}
        open={!!previewTalent}
        onOpenChange={(o) => !o && setPreviewId(null)}
      />

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
                if (pendingRemoval)
                  pendingRemoval.ids.length === 1 ? void removeNow(pendingRemoval.ids[0]) : void removeMany(pendingRemoval.ids);
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
