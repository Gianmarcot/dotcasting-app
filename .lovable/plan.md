## Ampliamento ordinamenti pagina Casting

Estendo l'elenco delle opzioni di ordinamento nella pagina `/owner/castings` con: Titolo A→Z, Titolo Z→A, Meno recenti, Data inizio, Data fine. Mantengo le opzioni esistenti (Più recenti, Cliente, Stato).

### Modifiche

**`src/hooks/useCastings.ts`**
- Estendere il tipo `CastingSort`:
  ```
  "recent" | "oldest" | "title_asc" | "title_desc"
  | "start_date" | "end_date" | "company" | "status"
  ```
- Aggiungere i rami nella logica di ordinamento:
  - `oldest` → `order("created_at", { ascending: true })`
  - `title_asc` / `title_desc` → `order("title", { ascending: true/false })`
  - `start_date` → `order("start_date", { ascending: true, nullsFirst: false })`
  - `end_date` → `order("end_date", { ascending: true, nullsFirst: false })`

**`src/components/castings/CastingFilters.tsx`**
- Aggiungere le nuove `SelectItem` nel dropdown ordinamento, raggruppate in ordine logico:
  1. Più recenti / Meno recenti
  2. Titolo A→Z / Titolo Z→A
  3. Data inizio / Data fine
  4. Cliente / Stato
- Allargare leggermente il trigger (`sm:w-52`) per contenere le nuove label.

Nessuna modifica DB, nessuna modifica ai preferiti o alla struttura della tabella.