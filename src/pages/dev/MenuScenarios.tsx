import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Film, MoreHorizontal, Pencil, Copy, Trash2, Download, Users } from "lucide-react";
import { Surface, type SurfaceVariant } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchSelect } from "@/components/ui/search-select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuShortcut } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FloatingInput } from "@/components/ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TalentFilterBar } from "@/components/talents/TalentFilterBar";
import type { TalentFilters } from "@/hooks/useTalents";

const cities = ["Milano", "Roma", "Torino", "Napoli", "Bologna", "Firenze", "Venezia", "Genova", "Palermo", "Bari", "Catania", "Verona", "Padova", "Trieste", "Brescia", "Parma", "Modena", "Prato", "Perugia", "Livorno", "Ravenna", "Cagliari", "Rimini", "Ferrara", "Sassari", "Siracusa", "Pescara", "Monza", "Bergamo", "Trento"];
const options = cities.map((label) => ({ value: label, label }));
const surfaces: { value: SurfaceVariant; label: string }[] = [{ value: "base", label: "Base" }, { value: "muted", label: "Muted" }, { value: "raised", label: "Raised" }, { value: "brand", label: "Brand" }, { value: "inverse", label: "Scura" }];

function SimpleSelect({ label, long = false, grouped = false, icons = false, people = false, disabled = false, states = false }: {
  label: string; long?: boolean; grouped?: boolean; icons?: boolean; people?: boolean; disabled?: boolean; states?: boolean;
}) {
  const [value, setValue] = useState(states ? "Milano" : "");
  const entries = long || grouped ? cities : people ? ["Giulia Rossi", "Marco Bianchi", "Sara Conti"] : cities.slice(0, 3);
  const item = (name: string, index: number) => <SelectItem key={name} value={name} disabled={states && index === 1}>
    <span className="flex min-w-0 items-center gap-3">
      {icons && <Film className="h-5 w-5 shrink-0" />}
      {people && <Avatar size="sm" className="shrink-0"><AvatarImage src={`https://i.pravatar.cc/64?img=${index + 10}`} /><AvatarFallback>{name.split(" ").map((part) => part[0]).join("")}</AvatarFallback></Avatar>}
      <span><span className="block">{name}</span>{people && <span className="dc-menu-description">{index === 1 ? "Attore · Roma" : "Modella · Milano"}</span>}</span>
    </span>
  </SelectItem>;
  return <Select value={value} onValueChange={setValue} disabled={disabled}>
    <SelectTrigger aria-label={label}><SelectValue placeholder={label} /></SelectTrigger>
    <SelectContent>
      {grouped ? <><SelectGroup className="dc-menu-group"><SelectLabel>Principali città</SelectLabel>{entries.slice(0, 5).map(item)}</SelectGroup><SelectGroup className="dc-menu-group"><SelectLabel>Altre città</SelectLabel>{entries.slice(5).map(item)}</SelectGroup></> : entries.map(item)}
    </SelectContent>
  </Select>;
}

function ActionMenu({ label, destructive = false, nested = false, onAction }: { label: string; destructive?: boolean; nested?: boolean; onAction: (value: string) => void }) {
  return <DropdownMenu>
    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={label}><MoreHorizontal /></Button></DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuLabel>Azioni casting</DropdownMenuLabel>
      <DropdownMenuItem onSelect={() => onAction("Modifica")}><Pencil />Modifica<DropdownMenuShortcut>⌘ E</DropdownMenuShortcut></DropdownMenuItem>
      <DropdownMenuItem onSelect={() => onAction("Duplica")}><Copy />Duplica</DropdownMenuItem>
      {nested && <>
        <DropdownMenuSub><DropdownMenuSubTrigger><Download />Esporta</DropdownMenuSubTrigger><DropdownMenuSubContent><DropdownMenuItem onSelect={() => onAction("PDF")}>Documento PDF</DropdownMenuItem><DropdownMenuItem onSelect={() => onAction("Excel")}>Foglio Excel</DropdownMenuItem></DropdownMenuSubContent></DropdownMenuSub>
        <DropdownMenuSub><DropdownMenuSubTrigger><Users />Condividi</DropdownMenuSubTrigger><DropdownMenuSubContent><DropdownMenuItem onSelect={() => onAction("Team")}>Con il team</DropdownMenuItem><DropdownMenuItem onSelect={() => onAction("Link")}>Copia collegamento</DropdownMenuItem></DropdownMenuSubContent></DropdownMenuSub>
      </>}
      {destructive && <><DropdownMenuSeparator /><DropdownMenuItem className="text-destructive" onSelect={() => onAction("Elimina")}><Trash2 />Elimina</DropdownMenuItem></>}
    </DropdownMenuContent>
  </DropdownMenu>;
}

/** Trigger demo standard: campo nativo, identico agli altri campi della sezione.
    Forwarda ref e props così che Radix (asChild) possa agganciarvi click e aria-*. */
const FieldTrigger = React.forwardRef<HTMLButtonElement, { label: string } & React.ComponentProps<"button">>(
  ({ label, className, ...props }, ref) => (
    <button ref={ref} type="button" data-placeholder="" className={cn("dc-select-trigger", className)} {...props}>
      {label}
    </button>
  ),
);
FieldTrigger.displayName = "FieldTrigger";

function Scenario({ number, title, component, children }: { number: number; title: string; component: string; children: ReactNode }) {
  return <div className="min-w-0 space-y-3 border-b border-border/30 pb-6">
    <div className="space-y-1"><h3 className="font-display text-sm uppercase">{number.toString().padStart(2, "0")} · {title}</h3><code className="block break-words text-xs opacity-70">{component}</code></div>
    {children}
  </div>;
}

export function MenuScenarios() {
  const [surface, setSurface] = useState<SurfaceVariant>("base");
  const [search, setSearch] = useState<string[]>([]);
  const [multi, setMulti] = useState<string[]>([]);
  const [action, setAction] = useState("");
  const [filter, setFilter] = useState("");
  const [talentFilters, setTalentFilters] = useState<TalentFilters>({});
  return <section id="menus" className="scroll-mt-8 space-y-6">
    <header className="border-b border-border/60 pb-3"><h2 className="font-display text-2xl uppercase">Menu · Scenari interattivi</h2></header>
    <div className="flex flex-wrap gap-2" role="group" aria-label="Superficie degli esempi">
      {surfaces.map((entry) => <Button key={entry.value} variant={surface === entry.value ? "default" : "outline"} size="sm" aria-pressed={surface === entry.value} onClick={() => setSurface(entry.value)}>{entry.label}</Button>)}
    </div>
    <Surface variant={surface} className="space-y-8 rounded-2xl p-4 sm:p-6">
      <div className="grid min-w-0 gap-x-8 gap-y-6 md:grid-cols-2">
        <Scenario number={1} title="Elenco corto" component="Select / SelectContent"><SimpleSelect label="Città · breve" /></Scenario>
        <Scenario number={2} title="Elenco lungo" component="Select / SelectContent"><SimpleSelect label="Città · elenco completo" long /></Scenario>
        <Scenario number={3} title="Sezioni e intestazioni" component="SelectGroup / SelectLabel"><SimpleSelect label="Città · sezioni" grouped /></Scenario>
        <Scenario number={4} title="Ricerca" component="SearchSelect (Popover + Command)"><SearchSelect label="Cerca città" options={options} values={search} onValuesChange={setSearch} /></Scenario>
        <Scenario number={5} title="Selezione multipla" component="SearchSelect multiple"><SearchSelect label="Seleziona città" options={options} values={multi} onValuesChange={setMulti} multiple /></Scenario>
        <Scenario number={6} title="Voci con icone" component="SelectItem"><SimpleSelect label="Città · icone" icons /></Scenario>
        <Scenario number={7} title="Avatar e descrizione" component="SelectItem + Avatar + dc-menu-description"><SimpleSelect label="Scegli talent" people /></Scenario>
        <Scenario number={8} title="Azioni compatte" component="DropdownMenu"><ActionMenu label="Azioni compatte" onAction={setAction} /></Scenario>
        <Scenario number={9} title="Separatore e azione distruttiva" component="DropdownMenuSeparator / DropdownMenuItem"><ActionMenu label="Azioni con eliminazione" destructive onAction={setAction} /></Scenario>
        <Scenario number={10} title="Sottomenu e bordo finestra" component="DropdownMenuSub / DropdownMenuSubContent">
          <div className="flex justify-between"><ActionMenu label="Azioni con sottomenu" nested onAction={setAction} /><ActionMenu label="Sottomenu al bordo" nested onAction={setAction} /></div>
        </Scenario>
        <Scenario number={11} title="Selezionato e disabilitato" component="SelectItem disabled / Select disabled"><div className="space-y-3"><SimpleSelect label="Stati delle voci" states /><SimpleSelect label="Campo disabilitato" disabled /></div></Scenario>
        <Scenario number={12} title="Dentro una finestra" component="Dialog + Surface + SelectContent">
          <Dialog><DialogTrigger asChild><FieldTrigger label="Apri finestra" className="w-full" /></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Menu nella finestra</DialogTitle></DialogHeader><Surface variant={surface} className="space-y-4 rounded-2xl p-6"><SimpleSelect label="Città nella finestra" long /><SearchSelect label="Ricerca nella finestra" options={options} values={search} onValuesChange={setSearch} /></Surface></DialogContent></Dialog>
        </Scenario>
      </div>
      <div className="space-y-3"><h3 className="font-display text-sm uppercase">Pannello filtri · PopoverContent</h3><Popover><PopoverTrigger asChild><FieldTrigger label="Filtri" className="w-full sm:w-72" /></PopoverTrigger><PopoverContent className="dc-menu-filter w-72" align="start"><div className="space-y-3"><FloatingInput label="Nome" value={filter} onChange={setFilter} /><SimpleSelect label="Città nel filtro" /></div></PopoverContent></Popover></div>
      {action && <output aria-live="polite" className="block text-sm">Ultima azione: {action}</output>}
    </Surface>
    <div className="space-y-3"><h3 className="font-display text-sm uppercase">Database talenti · TalentFilterBar</h3><TalentFilterBar filters={talentFilters} onFiltersChange={setTalentFilters} /></div>
  </section>;
}