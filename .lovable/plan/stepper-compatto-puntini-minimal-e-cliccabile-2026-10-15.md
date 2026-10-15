# Stepper compatto «puntini minimal» e cliccabile

Sostituire l'attuale stepper a barre segmentate (etichette sopra, barra sotto) con la versione compatta a puntini scelta dall'utente, mantenendo l'allineamento attuale con il pulsante «Chiudi» nelle modali a tutto schermo.

## Aspetto

- Tre (o quanti sono i passi) cerchietti di ~28px collegati da sottili linee orizzontali continue.
- Passo completato: cerchio pieno bordeaux con spunta bianca.
- Passo corrente: cerchio pieno bordeaux con numero bianco; è `aria-current="step"`.
- Passo futuro: cerchio bianco con bordo grigio sottile e numero grigio.
- Etichetta del solo passo corrente accanto alla fila di puntini (testo charcoal, DM Sans); se lo spazio è poco viene troncata con i puntini di sospensione, niente a capo.
- Niente barre, niente etichette dei passi futuri/completati: altezza complessiva molto minore.

## Comportamento

- I passi completati diventano pulsanti cliccabili per tornare indietro (scelta dell'utente), oltre ai pulsanti Avanti/Indietro esistenti.
- Solo i passi completati sono cliccabili; il corrente e i futuri non lo sono.
- Il cursore e l'area cliccabile restano chiari: cursore a manina sui completati, tooltip con il nome del passo, testo per screen reader «Torna al passo [nome]».
- I passi futuri e il corrente restano elementi non interattivi.

## Modifiche tecniche

- `src/components/ui/stepper.tsx`: riscrittura visuale; nuova prop opzionale `onStepSelect?: (stepIndex: number) => void`. Senza prop, i passi completati restano solo indicazione visiva (retrocompatibile).
- `src/components/castings/rounds/RoundWizardDialog.tsx`: `headerExtra` passa `onStepSelect` che riporta la procedura al passo scelto, riutilizzando la stessa logica di «Indietro» (validazione dei dati già immessi non viene aggirata: si torna solo a passi già visitati).
- `src/components/ui/fullscreen-sheet.tsx`: nessuna modifica strutturale; l'inviluppo che allinea lo stepper al pulsante «Chiudi» resta identico. Verificare solo che la distanza dello stepper dal titolo resti quella richiesta (stepper più in alto, titolo ben distanziato).

## Verifica

- Anteprima Playwright su «Nuova selezione» (desktop e mobile): puntini corretti in tutti e tre i passi, clic su un passo completato riporta indietro, Avanti/Indietro invariati, nessun overflow su 390px.
- Nessun dato salvato nel database durante le verifiche.
