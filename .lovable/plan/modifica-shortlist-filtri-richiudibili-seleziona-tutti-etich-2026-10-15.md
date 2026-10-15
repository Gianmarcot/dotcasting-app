# Modifica Shortlist: filtri richiudibili, seleziona tutti, etichette e segnaposto scuri

## Cosa cambia per l'utente

1. **Nome:** il titolo della finestra e il pulsante nella pagina Shortlist diventano "Modifica shortlist".
2. **Filtri nascondibili:** accanto alla ricerca compare il pulsante "Filtri" a pillola, uguale ai filtri, con chevron e pallino rosso che conta i filtri attivi. Al clic si aprono o si chiudono con un'animazione la riga dei gruppi filtro, l'interruttore "Solo CF validi" e il Reset. Le pillole dei requisiti restano sempre visibili, così si vede subito se i filtri del ruolo sono attivi. I filtri partono chiusi. La scelta resta finché la finestra è aperta.
3. **Seleziona tutti:** sopra la lista di sinistra, una casella "Seleziona tutti (N)" agisce su tutti i talent filtrati (o su tutti, se non ci sono filtri):
   - spuntata aggiunge alla shortlist chi manca;
   - tolta toglie dalla shortlist i talent visibili. Se tra loro c'è chi è in una selezione o ha un ingaggio pubblicato, chiede prima una conferma unica con il numero di talent coinvolti;
   - mostra lo stato intermedio quando solo una parte dei visibili è in shortlist;
   - una sola notifica riassuntiva ("12 talent aggiunti") con "Annulla", che annulla tutta l'operazione.
4. **Colonna Shortlist della finestra:** le righe mostrano solo le etichette Minore e codice fiscale. Spariscono l'indicatore dei requisiti ("in target", "Età", "2 requisiti non soddisfatti"…) e il relativo dettaglio.
5. **Talent senza foto:** nelle liste (pagina Shortlist, entrambe le colonne della finestra, Ingaggi) il riquadro della miniatura diventa scuro con le iniziali bianche, come già accade nelle schede fotografiche.

## Dettagli tecnici

- `OwnerCastingRoleDetail.tsx`: testo del pulsante e `title` del `TalentPicker` → "Modifica shortlist".
- `TalentPicker.tsx`:
  - stato `filtersOpen` (default false), pulsante trigger a pillola `bg-field h-12 rounded-full` con `aria-expanded` e il conteggio dei filtri attivi (escluso `search`), contenitore richiudibile con `Collapsible` del design system attorno a `TalentFilterBar`;
  - riga "Seleziona tutti" con `Checkbox` (`checked` true / false / "indeterminate") calcolata su `shown`;
  - nuove funzioni `addMany` / `removeMany` con aggiornamento locale immediato, scritture in sequenza, un solo toast con undo e un `AlertDialog` unico se `getRemovalWarning` restituisce testo per almeno un id;
  - le righe della colonna destra passano `hideRequirements` a `TalentRow`.
- `TalentRow.tsx`: prop `hideRequirements` (niente indicatore né dettaglio). Il segnaposto senza foto diventa `bg-ink` con le iniziali (`text-white text-sm font-medium`); le iniziali si calcolano da nome d'arte oppure nome e cognome.
- `RoleEngagementsPanel.tsx`: stesso segnaposto scuro con iniziali, tramite un piccolo `TalentThumb` condiviso esportato da `TalentRow.tsx`.
- Aggiornare la nota su `TalentPicker` in `AGENTS.md` (selezione multipla con undo unico).

## Verifica

- Aprire la finestra: filtri chiusi, apertura e chiusura del pannello, conteggio sul pulsante.
- "Seleziona tutti" con e senza filtri, compresi lo stato intermedio e la conferma.
- Colonna destra senza indicatore dei requisiti; segnaposto scuri con iniziali nelle tre liste.
