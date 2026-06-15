## UI fixes — Casting detail (presentazione)

Solo layout/presentazione. Nessuna modifica a schema, RLS, azioni o logica invii.

### 1. `useRoundPreviewPhotos` — payload arricchito (per le iniziali)
Per mostrare iniziali ai talent senza foto serve il nome accanto all'URL. Estensione minima e retro-compatibile:

```ts
interface RoundPreviewItem { photoUrl: string | null; name: string }
interface RoundPreviewPhotos { items: RoundPreviewItem[]; total: number }
```

- Query già esistente: aggiungo `first_name, last_name, stage_name` al `select` su `profiles` (stessa join, stessa tabella, stesso filtro). Niente cambi schema, niente cambi logica.
- `items` ordinati come arrivano; nessun limite a 5 nel hook (il limite resta UI-side per coerenza con "+N").
- `total` resta il numero reale di talent dell'invio.

### 2. `RoundFolderCard.tsx` — strip miniature reale + aspect 5/7
Sostituisco l'attuale "fill fino a 5" con miniature 1:1 sui talent reali:

- Render: `items.slice(0, 5).map(...)`. Se `items.length > 5`, l'ultima cella diventa `+N` (con `N = total - 5`).
- Nessun placeholder grigio: la fila ha tante celle quanti i talent (fino a 5).
- Talent **senza foto**: cella con iniziali (max 2, da `stage_name` o `first_name + last_name`) su `bg-[#2C2C2A] text-white`, font Tenor Sans uppercase.
- `aspect-ratio: 5 / 7` su ogni cella (era 2/3). `maxWidth` rimosso: le celle riempiono lo spazio disponibile della scheda più stretta.
- La card mantiene `h-44` fissa: l'altezza non dipende dal numero di miniature; lo spazio orizzontale viene distribuito con `flex-1` solo sulle celle realmente presenti, allineate a sinistra (`justify-start`) per evitare stretching innaturale quando ne hai 1-2.
  - Concretamente: ogni cella ha `width: calc((100% - gaps) / min(items, 5))` oppure semplicemente `flex: 0 0 calc(20% - gap)` così con 1 talent vedi una sola miniatura di larghezza ≈ ⅕ della card, non una mega-miniatura che sfora.

### 3. `RoleRoundsCompartment.tsx` — griglia 1/2/3 e cella "Aggiungi" a misura
Modifiche solo nel blocco della griglia:

- Griglia: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4` (mobile 1, tablet 2, desktop 3).
- La cella "Aggiungi invio" diventa l'ultima cella della stessa griglia, con `h-44 rounded-2xl border-2 border-dashed` identica per ingombro alle `RoundFolderCard`. Niente più riquadro full-width.
- Testo della cella: `"Aggiungi invio"` se `rounds.length > 0`, `"Crea il primo invio"` se vuoto.

### 4. Header ruolo — contatore unico
Nel blocco `<div className="flex items-center gap-3" onClick={stop}>`:

- Rimuovo l'intero gruppo `<div className="flex items-center gap-3 text-sm text-muted-foreground"> ... Users / CheckCircle2 ...</div>`.
- Restano solo: `DropdownMenu` (kebab) + `Button` "Nuovo invio".
- Il badge `Confermati X/Y` accanto al titolo resta invariato.
- Import non più usati (`Users`, `CheckCircle2`) rimossi.

### 5. Ordinamento invii ascendente
Nella compartment, prima del `.map`:

```ts
const orderedRounds = [...rounds].sort(
  (a, b) => +new Date(a.created_at) - +new Date(b.created_at)
);
```

Uso `orderedRounds` per la render. Non tocco il query/hook a monte.

### File toccati
- `src/hooks/useRoundPreviewPhotos.ts` — payload `{ items, total }`, query estesa con nomi.
- `src/components/castings/rounds/RoundFolderCard.tsx` — strip reale, fallback iniziali, aspect 5/7.
- `src/components/castings/rounds/RoleRoundsCompartment.tsx` — griglia 1/2/3, cella "Aggiungi" inline, rimozione contatori duplicati, ordinamento asc.

### Fuori scope
- Query/azioni round, RLS, edge functions, RoundWizard, route pubblica `/round/:token`.
- Icone azione per stato (link generato vs da condividere): lasciate come sono.
