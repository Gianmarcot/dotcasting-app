# Vista a griglia nella finestra "Modifica shortlist"

## Cosa cambia per l'utente
- Accanto all'ordinamento compare il selettore di vista **Lista / Griglia**, con le stesse icone del Database talenti. La lista resta la vista predefinita e la scelta resta salvata anche dopo la chiusura della finestra.
- In vista Griglia la colonna sinistra mostra le tessere talent del Design System nella nuova **variante chiara**, come nel riferimento:
  - fondo bianco con un'ombra leggera e angoli arrondati;
  - in alto a sinistra un cerchio vuoto con bordo grigio, che quando la tessera è selezionata diventa pieno nel rosso del marchio con la spunta bianca;
  - quando la tessera è selezionata, la cornice è rossa;
  - sotto la foto il nome in Tenor Sans maiuscolo, poi altezza e città in grigio;
  - in basso a destra l'icona per allargare, che apre l'anteprima del talent.
- Il clic sulla tessera aggiunge o toglie il talent dalla shortlist, come la riga in vista Lista. Restano uguali: salvataggio immediato, notifica con "Annulla", conferma prima di togliere talent con selezioni o ingaggi, "Seleziona tutti" e trascinamento verso la shortlist.
- Le colonne si adattano alla larghezza disponibile (da 2 a 4). Per i talent senza foto il riquadro è scuro con le iniziali.
- La colonna Shortlist a destra resta una lista in entrambe le viste.
- Nel Design System, alla voce Talent tile, compaiono la variante scura (quella di oggi) e la variante chiara, ciascuna selezionata e non selezionata.

## Dettagli tecnici
- `src/pages/shared/TalentTile.tsx`: la parte grafica passa a un componente `TalentTileView` con dati semplici (`name`, `photoUrl`, `meta`, `initials`), `selectable`, `selected`, `onToggle`, `onOpenDetails` e `tone: "dark" | "light"` (default `dark`, così la pagina condivisa del cliente non cambia aspetto). `TalentTile` resta l'adattatore di `TalentTileRow` per `SharedRound`. I colori della variante chiara vengono dai token: `bg-white`, `shadow-sm`, cornice selezionata `ring-primary`, cerchio vuoto `border-[var(--grey-400)]`, testo `text-ink` e `text-field-label`.
- `TalentPicker.tsx`:
  - stato `view: "list" | "grid"` salvato in localStorage (`dc-shortlist-picker-view`);
  - in vista Griglia una griglia `@container` (`grid-cols-2 @[720px]:grid-cols-3 @[1000px]:grid-cols-4 gap-4`) di `TalentTileView tone="light"`, con i dati presi da `TalentWithAttributes` (altezza da `attributes.height_cm`), ciascuna dentro lo stesso `Draggable`;
  - il pulsante per allargare usa `setPreviewId`.
- `DesignSystem.tsx`: esempi della variante chiara nella sezione Talent tile.

## Verifica
Nell'anteprima: si passa da Lista a Griglia e ritorno; si selezionano e deselezionano tessere (cornice e cerchio rossi, la shortlist si aggiorna); l'icona per allargare apre l'anteprima; la pagina condivisa della selezione resta invariata.
