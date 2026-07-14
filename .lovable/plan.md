## Obiettivo

Rifinire il modale di dettaglio talent nella pagina cliente (`/round/:token` — `SharedRound.tsx`, sotto-componente `TalentDetailSheet`) con miglioramenti a swiper header, azioni e stili. Nessun cambio a dati, RPC o logica di selezione.

## Ambito

- File toccato: `src/pages/shared/SharedRound.tsx` (solo `TalentDetailSheet`).
- Nessuna modifica a hook, RPC, generazione PDF, barra "Prosegui" esterna.

## Modifiche

### 1. Header talent → swiper con focus centrale

- La strip talent nell'header diventa un carosello centrato:
  - Il talent attivo è ingrandito (avatar 44px, pill più grande, testo visibile).
  - Gli adiacenti si riducono progressivamente in scala (~0.85, 0.7, 0.55) man mano che si allontanano dal centro.
  - Su cambio talent (`row.role_talent_id`), lo slot attivo viene scrollato al centro con `scrollIntoView({ behavior: "smooth", inline: "center" })`.
  - Scrollbar nascosta (già presente).
- Dissolvenza laterale: contenitore con maschera CSS (`mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent)`) così gli avatar oltre il 2°/3° elemento per lato sfumano verso i bordi senza taglio netto.

### 2. Frecce di navigazione ai lati del modale

- Due bottoni tondi (48px) `absolute` ancorati ai lati esterni del `DialogContent`, centrati verticalmente (`top-1/2 -translate-y-1/2`), leggermente sporgenti (`-left-6` / `-right-6` con fallback interno su mobile).
- `ChevronLeft` / `ChevronRight` da lucide, sfondo `bg-background` con `shadow-md border border-border`.
- Click → `onSelectTalent` sul talent precedente/successivo nell'array `talents` (wrap-around o disabilitati agli estremi — scelta: disabilitati agli estremi, coerente con lo swiper).
- Supporto swipe: handler `onTouchStart`/`onTouchEnd` sulla galleria sinistra e sulla strip header con soglia 40px per prev/next talent (delta orizzontale).

### 3. Titoli sezione: rosso → #1a1a1a

- `DetailSection` title: sostituire `text-primary` con classe/token dark (`text-[#1A1A1A]` oppure `text-foreground` se il token corrisponde al charcoal DS). Manteniamo `font-tenor uppercase tracking-widest text-xs`.

### 4. Rimozione badge "Confermato" sotto il nome

- Nel blocco header info a destra, eliminare il render di `<StatusPill status={row.company_status} />` sotto `h2` (righe ~293-295). Il nome resta come unico elemento del blocco.

### 5. Unico pulsante selezione nel footer

- Verifica: attualmente esiste già un solo bottone nel footer sticky del pannello destro (righe 340-357) più un check indicatore sulle pill dello swiper (rimane come indicatore visivo, non è un pulsante duplicato). Nessun altro controllo di selezione vicino al nome — confermato assente.
- Rifinire il footer button:
  - Non selezionato: `variant="default"` (bordeaux pieno), testo "Seleziona talent".
  - Selezionato: `variant="outline"` con `Check` + testo "Selezionato · Rimuovi".
- Il check sulle pill dello swiper resta come indicatore passivo (non è "controllo di selezione"): mantiene visibilità dello stato multi-talent.

### 6. Download PDF come pill outline nell'header

- Sostituire il bottone icona-only (righe 216-224) con:
  ```
  <Button variant="outline" size="sm" className="rounded-full gap-2" onClick={dl.mutate} disabled={!row.pdf_path || dl.isPending}>
    {dl.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
    Scarica PDF
  </Button>
  ```
- Posizionato prima dell'icona di chiusura (che resta icon-only). Visivamente secondario rispetto al CTA bordeaux pieno del footer.

## Dettagli tecnici

- Nuovi ref: `stripRef` (container swiper) + `Map<string, HTMLElement>` per gli slot pill; `useEffect` su `row.role_talent_id` per centrare.
- Scala pill: calcolata dall'indice relativo (`Math.abs(i - activeIndex)`) con lookup `[1, 0.85, 0.7, 0.55]` (default 0.5) applicato via `style={{ transform: 'scale(x)' }}` + `transition-transform`.
- Frecce: `disabled` quando `activeIndex === 0` / `talents.length - 1`.
- Swipe: `useRef` per `touchStartX`; handler unificato sui due grandi container.

## Fuori scope

- Nessun cambio a RPC, PDF, mock, layout a due colonne, filmstrip immagini, floating bar esterna "X di Y · Prosegui".
- Nessun cambio a `StatusPill` (rimane usato altrove nella griglia).
