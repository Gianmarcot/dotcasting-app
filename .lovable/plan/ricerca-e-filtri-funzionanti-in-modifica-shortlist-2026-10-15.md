# Ricerca e filtri funzionanti in "Modifica shortlist"

## Obiettivo
Nella finestra "Modifica shortlist" la barra di ricerca e i filtri funzionano come nel Database talenti e sono gli stessi componenti. Nella finestra restano in versione beige, così si staccano dal fondo bianco.

## Passi
1. **Capire cosa non funziona.** Nell'anteprima, dentro la finestra: si scrive nella ricerca, si apre ogni gruppo filtro (Ruolo, Anagrafica, Aspetto, Misure, Competenze, Lavoro), si sceglie un valore nei menu a tendina e nei campi, si usano "Solo CF validi" e Reset. Annoto dove si blocca: il gruppo non si apre, il menu non risponde, il campo non accetta testo oppure i risultati non cambiano. Correggo la causa che trovo.
2. **Una sola barra di ricerca.** Il campo di ricerca del Database talenti diventa un componente condiviso, con lente a sinistra e segnaposto "Cerca per parola chiave". Lo usano sia il Database talenti, nella versione per fondo crema, sia la finestra, nella versione beige. Al posto del campo scritto a mano nella finestra.
3. **Stessi filtri.** La finestra usa la stessa barra filtri del Database talenti: stessi gruppi, stessi campi, stessi conteggi e stesso Reset. Cambia solo il fondo, beige invece che bianco. Restano invariati il pulsante "Filtri" che apre e chiude il pannello e le pillole dei requisiti.
4. **Pannelli dei filtri sopra la finestra.** I pannelli dei gruppi e i loro menu a tendina si aprono sopra la finestra e restano utilizzabili: clic, digitazione e scorrimento.

## Dettagli tecnici
- Nuovo `src/components/talents/TalentSearchField.tsx` (`value`, `onChange`, `className`), che usa `--field-bg` della superficie e va inserito in `<Surface variant="raised">` nel Database talenti e `variant="base"` nella finestra. Lo adottano `OwnerTalents.tsx` e `TalentPicker.tsx`.
- `TalentFilterBar` è già condiviso. Nella finestra si conferma `surface="base"`.
- Punti da controllare per la correzione: livelli di `PopoverContent`/`SelectContent` rispetto al foglio (`z-[80]`); l'attributo `inert` sul contenitore richiudibile, che deve togliersi del tutto quando i filtri sono aperti; il blocco dei clic sui menu dentro i pannelli da parte della finestra. Si corregge quello che risulta guasto al passo 1.

## Verifica
Nell'anteprima, dentro la finestra: la ricerca cambia il numero dei risultati; ogni gruppo filtro si apre e i valori scelti filtrano la lista; Reset riporta tutto ai valori iniziali; nel Database talenti la ricerca e i filtri funzionano come prima.
