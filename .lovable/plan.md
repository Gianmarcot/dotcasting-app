# Pagina cliente — Dettagli talent + restyle design system

Due interventi sulla pagina pubblica `/round/:token` (`src/pages/shared/SharedRound.tsx`).

## 1. Pulsante "Vedi dettagli" + drawer

Su ogni tile aggiungo un pulsante "Dettagli" (in basso, accanto al download PDF). Al click apre un **Sheet/Drawer** laterale (a destra, `w-full sm:max-w-2xl`) con:

- Header: nome talent (Tenor Sans uppercase), badge stato se non selezionabile, pulsante download PDF.
- Carosello/griglia foto: tutte le `talent.photos` del round (non solo la prima), in griglia 2-col con aspect 3:4 e click per lightbox semplice (apertura immagine full).
- Sezione attributi raggruppati (riusando `mapToTalent` già presente):
  - Generale: età, altezza, città, nazionalità
  - Misure: taglia maglia, pantaloni, scarpe, collo, vita, fianchi, petto
  - Aspetto: occhi, capelli, carnagione, corporatura
  - Lingue, abilità/skill
  - Bio (se presente)
- Footer drawer con CTA "Seleziona / Deseleziona" se `selectable`, così il cliente può decidere senza chiudere il drawer.

Il drawer è puramente client-side: nessuna nuova query (i dati arrivano già da `get_shared_round` via `mapToTalent`). Niente cambi al backend.

Componente nuovo locale: `TalentDetailSheet` dentro `SharedRound.tsx` (o estratto in `src/pages/shared/_SharedRoundDetailSheet.tsx` se cresce). Usa `@/components/ui/sheet`.

## 2. UI coerente al design system

Allineo il file alle regole core (cards `.dc-card`, rounded-3xl, bordeaux brand, spacing).

Cambi puntuali in `SharedRound.tsx`:

- **Cards talent**: da `rounded-sm border bg-white` → `rounded-3xl bg-white border-0 shadow-sm` (stile `.dc-card`). Foto con `rounded-t-3xl`. Ring di selezione `ring-2 ring-[#A30A2B]` invariato ma su angoli `rounded-3xl`.
- **Checkbox overlay**: da quadrato `w-7 h-7` a `rounded-full w-8 h-8` coerente con i pill components.
- **Banner "Selezione chiusa"**: `rounded-3xl` + shadow-sm, niente border.
- **Sticky footer**: già `rounded-full` sul bottone, ok. Aumento padding mobile e uso `border-t border-black/5`.
- **Pulsanti azione tile**: riga in basso con due icon-button piccoli (`Dettagli` con `Eye`, `PDF` con `Download`) allineati a destra, stile bordeaux text + hover.
- **Pill "Selezionato"**: la sostituisco con la stessa `StatusPill` (verde "Selezionato") per coerenza con le altre pill di stato.
- **Tipografia**: confermo Tenor Sans uppercase per headers e DM Sans body (già presenti). Rimuovo `tracking-widest` dove troppo aggressivo sui valori dati.
- **Dialog password**: aggiungo `rounded-3xl` al `DialogContent` e bottone primario bordeaux full-rounded per coerenza.

## Fuori scope

- Nessun cambio a `get_shared_round`, edge functions, RLS, o logica di conferma.
- Nessun cambio alle altre pagine owner.
- Lightbox: implementazione minima inline (overlay con immagine), non riuso `MediaLightbox` per evitare dipendenze auth.

## File toccati

- `src/pages/shared/SharedRound.tsx` (modifica)
