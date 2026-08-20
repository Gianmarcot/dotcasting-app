# Autofill più gradevole sui campi floating label

I campi con autofill del browser (email, password) mostrano uno sfondo blu/giallo che "taglia" il bordo del campo e contrasta con la superficie del design system. La soluzione è globale e interviene sullo stesso componente `field.tsx`.

## Cosa cambia

1. **Override CSS per l'autofill** nei campi `FloatingInput`, `FloatingTextarea` e nel trigger di `FloatingSelect`.
   - Selettore `:-webkit-autofill` (Chrome, Edge, Safari) e `:-moz-autofill` dove supportato.
   - Sfondo autofill sostituito con la superficie attuale usando il trucco `box-shadow: inset 0 0 0 1000px var(--field-bg)`: così il colore di riempimento del browser viene mascherato dal token surface-aware, senza rompere l'accessibilità.
   - Colore testo forzato a `var(--field-fg)` per evitare testo blu/nero illeggibile su sfondo chiaro o scuro.

2. **Rimozione dell'evidenziazione gialla/blu** al mount: il campo autocompletato non mostra più un rettangolo colorato sopra il fondo del field, ma si integra nella forma arrotondata esistente.

3. **Focus e transizione**: l'autofill non blocca l'animazione della label e il focus ring resta visibile.

4. **Verifica su superfici multiple**: controllo che il trucco funzioni su `base` (fondo bianco), `muted` (crema), `brand` (bordeaux) e `inverse` (ink), perché il token `--field-bg` cambia in ciascun contesto.

5. **Pagina di test**: si aggiorna `/dev/fields` aggiungendo un campo con `defaultValue` precompilato per simulare l'autofill e confrontare il risultato prima/dopo.

## Note tecniche

- Nessuna modifica a logica, schema, RLS o dati: solo CSS presentazionale.
- Non si usa `!important` direttamente sul `background-color` del browser (viene ignorato); si usa `box-shadow` inset con raggio grande per coprire tutto l'input.
- La soluzione è compatibile con i colori scuri di `brand` e `inverse`.
