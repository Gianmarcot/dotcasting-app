## Redesign pagina pubblica `/round/:token`

Sostituisco il blocco-talent attuale (basato su `TalentCardWeb`, pensata per il PDF) con una griglia compatta di tile in stile prototipo "Functional grid" scelto.

### Cosa cambia in `src/pages/shared/SharedRound.tsx`

1. **Layout pagina**
   - Container `max-w-6xl` su sfondo crema, padding responsive `p-4 md:p-8 pb-32`.
   - Header centrato: logo agenzia (h-8), titolo `casting — ruolo` in Tenor Sans uppercase, sottotitolo label round in micro-caps.

2. **Griglia talent**
   - `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`.
   - Niente più embed di `TalentCardWeb`: i talent diventano tile autonomi.

3. **Tile talent** (nuovo componente locale `TalentTile`)
   - Foto `aspect-[3/4]` (prima foto da `media[]`), object-cover, hover zoom `scale-[1.03]`.
   - Card `bg-white border border-black/5 rounded-sm overflow-hidden`, hover `shadow-xl`.
   - Overlay top-left: checkbox custom (quadrato 28px bordato bordeaux che si riempie quando selected, tick bianco) + label "Selezionato" solo quando attiva.
   - Quando il round non è più editabile: niente checkbox, mostro `StatusPill` (Confermato verde / Scartato bordeaux) al suo posto.
   - Sotto la foto: nome in Tenor Sans uppercase + icona Download bordeaux a destra (stop propagation, chiama edge function esistente `get-round-pdf-url`).
   - Griglia attributi 2-col con label micro-caps opacità 40 + valore bold: Altezza, Taglia (pantaloni/maglia fallback), Occhi, Capelli; Città a tutta riga. Vengono mostrati solo gli attributi valorizzati.
   - Click sull'intera tile → toggle selezione (solo se `selectable`).

4. **Sticky bottom bar**
   - Indicatore animato (ping bordeaux) + conteggio "N selezionati" (singolare/plurale).
   - CTA `Conferma selezione` rounded-full bordeaux con shadow morbida.

5. **Comportamenti preservati**
   - Pre-popolazione `selected` dai `company_status === 'confirmed'`.
   - Dialog password e flusso `confirm_round_selection` invariati.
   - Banner "Selezione chiusa" quando round non è più l'ultimo.
   - Schermate `Loading` / `Unavailable` invariate.

### Cosa NON cambia
- Backend, RPC, edge function.
- Schema dati.
- Routing.
- Componente `TalentCardWeb` (resta usato altrove: preview owner, PDF).

### Note tecniche
- Uso `mapToTalent` esistente per ricavare i campi (`altezza_cm`, `taglia_pantaloni`, `occhi`, `capelli`, `citta`, `photos`).
- Tipografia: `font-tenor` (heading) e `font-dm` (body) già definiti nel progetto.
- Colori: token espliciti del brand (#F5F0E8, #A30A2B, #1A1A1A, #729128) per coerenza con la pagina pubblica fuori-app.
- Nessuna nuova dipendenza.
